// --- Playground: Bitcoin network pulse data source ---
// Fetches the network read (fee estimates, mempool backlog, next difficulty
// change, recent blocks) from mempool.space's public API, and degrades
// gracefully:
//
//   live fetch (one bundled round, per worker isolate) -> in-memory cache (60 s)
//                                                      -> committed fallback snapshot
//
// The API is keyless and public; refresh the fallback with
// `node scripts/fetch-network-snapshot.mjs`. The page never depends on the
// live fetch to render.

import rawFallback from "@/data/playground/network-fallback.json";
import type {
	NetworkBlock,
	NetworkHistogramBucket,
	NetworkPulseData,
} from "@/lib/playground/types";

const API = "https://mempool.space/api";
const CACHE_TTL_MS = 60 * 1000;
const RECENT_BLOCKS = 12;
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

/** Fee-rate bands for the backlog chart, sat/vB; the top band is open. */
const HISTOGRAM_BANDS: Array<[number, number]> = [
	[0, 0.5],
	[0.5, 1],
	[1, 1.5],
	[1.5, 2],
	[2, 3],
	[3, 4],
	[4, 6],
	[6, 8],
	[8, 12],
	[12, 20],
	[20, 40],
	[40, 80],
	[80, 160],
	[160, 320],
	[320, Number.POSITIVE_INFINITY],
];

interface RawFees {
	fastestFee?: unknown;
	halfHourFee?: unknown;
	hourFee?: unknown;
	economyFee?: unknown;
	minimumFee?: unknown;
}

interface RawMempool {
	count?: unknown;
	vsize?: unknown;
	total_fee?: unknown;
	fee_histogram?: unknown;
}

interface RawDifficulty {
	progressPercent?: unknown;
	difficultyChange?: unknown;
	remainingBlocks?: unknown;
	estimatedRetargetDate?: unknown;
	previousRetarget?: unknown;
}

interface RawBlock {
	height?: unknown;
	timestamp?: unknown;
	tx_count?: unknown;
	size?: unknown;
}

interface RawPrices {
	USD?: unknown;
}

function num(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return 0;
}

function bucketHistogram(rows: unknown): NetworkHistogramBucket[] {
	if (!Array.isArray(rows)) throw new Error("mempool payload: fee_histogram missing");
	const buckets: NetworkHistogramBucket[] = HISTOGRAM_BANDS.map(([lo, hi]) => ({
		lo,
		hi,
		vsize: 0,
	}));
	for (const row of rows) {
		if (!Array.isArray(row)) continue;
		const rate = num(row[0]);
		const vsize = num(row[1]);
		if (vsize <= 0) continue;
		let index = buckets.length - 1;
		for (let i = 0; i < HISTOGRAM_BANDS.length; i++) {
			if (rate < HISTOGRAM_BANDS[i][1]) {
				index = i;
				break;
			}
		}
		buckets[index].vsize += vsize;
	}
	const total = buckets.reduce((sum, bucket) => sum + bucket.vsize, 0);
	if (total <= 0) throw new Error("mempool payload: histogram is empty");
	return buckets;
}

function toBlocks(rows: unknown): NetworkBlock[] {
	if (!Array.isArray(rows)) throw new Error("blocks payload: not an array");
	const blocks: NetworkBlock[] = [];
	for (const row of rows) {
		const item = row as RawBlock;
		const height = num(item?.height);
		const timestamp = num(item?.timestamp);
		const txCount = num(item?.tx_count);
		const size = num(item?.size);
		if (height > 0 && timestamp > 0 && size > 0) {
			blocks.push({ height, timestamp, txCount, size });
		}
	}
	if (blocks.length === 0) throw new Error("blocks payload: no usable rows");
	blocks.sort((a, b) => b.height - a.height);
	return blocks.slice(0, RECENT_BLOCKS);
}

function normalize(
	fees: RawFees,
	mempool: RawMempool,
	difficulty: RawDifficulty,
	blocks: unknown,
	priceUsd: unknown,
	asOf: string,
	provenance: NetworkPulseData["provenance"],
): NetworkPulseData {
	const fastest = num(fees?.fastestFee);
	const halfHour = num(fees?.halfHourFee);
	const hour = num(fees?.hourFee);
	const economy = num(fees?.economyFee);
	const minimum = num(fees?.minimumFee);
	if (!(fastest > 0) || !(economy > 0)) throw new Error("fees payload: missing estimates");

	const count = num(mempool?.count);
	const vsize = num(mempool?.vsize);
	const totalFee = num(mempool?.total_fee);
	if (!(vsize > 0)) throw new Error("mempool payload: missing vsize");

	const retargetAt = num(difficulty?.estimatedRetargetDate);
	if (!(retargetAt > 0)) throw new Error("difficulty payload: missing retarget estimate");

	const price = num(priceUsd);
	if (!(price > 0)) throw new Error("prices payload: missing USD");

	return {
		asOf,
		provenance,
		fees: { fastest, halfHour, hour, economy, minimum },
		mempool: { count, vsize, totalFee },
		histogram: bucketHistogram(mempool?.fee_histogram),
		difficulty: {
			progressPercent: num(difficulty?.progressPercent),
			changePercent: num(difficulty?.difficultyChange),
			remainingBlocks: num(difficulty?.remainingBlocks),
			retargetAt,
			previousChangePercent: num(difficulty?.previousRetarget),
		},
		blocks: toBlocks(blocks),
		priceUsd: price,
	};
}

async function fetchJson(url: string): Promise<unknown> {
	const res = await fetch(url, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
		cache: "no-store",
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return (await res.json()) as unknown;
}

async function fetchLive(): Promise<NetworkPulseData> {
	const [fees, mempool, difficulty, blocks, prices] = await Promise.all([
		fetchJson(`${API}/v1/fees/recommended`),
		fetchJson(`${API}/mempool`),
		fetchJson(`${API}/v1/difficulty-adjustment`),
		fetchJson(`${API}/v1/blocks`),
		fetchJson(`${API}/v1/prices`),
	]);
	return normalize(
		fees as RawFees,
		mempool as RawMempool,
		difficulty as RawDifficulty,
		blocks,
		(prices as RawPrices)?.USD,
		new Date().toISOString(),
		"live",
	);
}

interface RawFallback {
	generated: string;
	fees: RawFees;
	mempool: RawMempool;
	difficulty: RawDifficulty;
	blocks: RawBlock[];
	price_usd: unknown;
}

let memoryCache: { at: number; data: NetworkPulseData } | null = null;

/**
 * The page-facing entry point. Live data with a 60-second per-isolate cache;
 * on any failure, the last good data (memory, then committed snapshot).
 */
export async function getNetworkPulseData(): Promise<NetworkPulseData> {
	if (memoryCache && Date.now() - memoryCache.at < CACHE_TTL_MS) {
		return memoryCache.data;
	}
	try {
		const data = await fetchLive();
		memoryCache = { at: Date.now(), data };
		return data;
	} catch (error) {
		// Keep fallbacks visible: a silent catch once hid a live-fetch
		// regression behind the snapshot (stablecoins, 2026-10).
		console.warn(
			"[playground/network] live fetch failed; serving snapshot:",
			error instanceof Error ? `${error.name}: ${error.message}` : String(error),
		);
		if (memoryCache) return memoryCache.data;
		const fallback = rawFallback as unknown as RawFallback;
		return normalize(
			fallback.fees,
			fallback.mempool,
			fallback.difficulty,
			fallback.blocks,
			fallback.price_usd,
			fallback.generated,
			"snapshot",
		);
	}
}
