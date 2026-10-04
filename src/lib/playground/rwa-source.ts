// ─── Playground: RWA data source ───
// Fetches the tokenized-assets sector data from Birdeye's beta forge API,
// normalizes it, and degrades gracefully:
//
//   live fetch  ->  in-memory cache (per worker isolate, 30 min)
//               ->  committed fallback snapshot (rwa-fallback-raw.json)
//
// The beta API is keyless and undocumented; it may change or lock down at any
// time. The fallback snapshot keeps the page real even then — refresh it with
// `node scripts/fetch-rwa-snapshot.mjs`.

import rawFallback from "@/data/playground/rwa-fallback-raw.json";
import type {
	RwaData,
	RwaHistoryPoint,
	RwaIssuer,
	RwaToken,
	RwaWrapperGroup,
} from "@/lib/playground/types";

const BASE = "https://beta.birdeye.so/forge";
const UA =
	"Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0";
const REFERER =
	"https://beta.birdeye.so/find-gems?type=rwas&rwaDisplay=dashboard";
const CHAINS = ["solana", "ethereum", "bsc", "base", "robinhood", "mantle"];
const TOKEN_LIMIT = 50;
const CACHE_TTL_MS = 30 * 60 * 1000;
const MIN_WRAPPER_VOLUME = 100_000;

type Json = Record<string, unknown>;

interface RawPayload {
	generatedAt?: string;
	overview?: Json;
	history?: Json;
	assets?: Json;
	tokens?: Record<string, Json>;
}

function num(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function str(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function strArray(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

function itemsOf(payload: unknown): Json[] {
	const data = (payload as Json | undefined)?.data as Json | undefined;
	const items = data?.items;
	return Array.isArray(items) ? (items as Json[]) : [];
}

async function forgeGet(path: string, params: Record<string, string>): Promise<Json> {
	const url = new URL(`${BASE}/${path}`);
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
	const res = await fetch(url, {
		headers: { "user-agent": UA, referer: REFERER },
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});
	if (!res.ok) throw new Error(`forge ${path}: HTTP ${res.status}`);
	return (await res.json()) as Json;
}

async function forgePost(path: string, body: Json): Promise<Json> {
	const res = await fetch(`${BASE}/${path}`, {
		method: "POST",
		headers: { "user-agent": UA, referer: REFERER, "content-type": "application/json" },
		body: JSON.stringify(body),
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});
	if (!res.ok) throw new Error(`forge ${path}: HTTP ${res.status}`);
	return (await res.json()) as Json;
}

async function fetchRaw(): Promise<RawPayload> {
	const [overview, history, assets] = await Promise.all([
		forgeGet("rwa/overview", {
			chain: "",
			offset: "0",
			limit: "100",
			order_by: "total_volume",
			order_type: "desc",
		}),
		forgeGet("rwa/overview-chart", { chain: "", interval: "" }),
		forgeGet("rwa/overview-chart-asset", { chain: "", interval: "" }),
	]);

	const tokens: Record<string, Json> = {};
	for (const chain of CHAINS) {
		try {
			tokens[chain] = await forgePost("insights/sectors/token_list", {
				network: chain,
				sector: "rwas",
				tags: [],
				offset: 0,
				limit: TOKEN_LIMIT,
				sort_by: "tf24h.volumeUSD",
				sort_type: "desc",
			});
		} catch {
			// One chain being down must not kill the whole page.
		}
	}

	return { generatedAt: new Date().toISOString(), overview, history, assets, tokens };
}

/** Trailing wrapper markers used by issuers: SPCXx / SPCXB / NVDAON. */
function stripWrapperSuffix(symbol: string): string {
	return symbol.replace(/(x|B|ON)$/, "");
}

function normalize(raw: RawPayload, provenance: RwaData["provenance"]): RwaData {
	const asOf = raw.generatedAt ?? new Date().toISOString();

	// ── Issuers ──
	const issuers: RwaIssuer[] = itemsOf(raw.overview)
		.map((item) => ({
			name: str(item.issuer),
			chains: strArray(item.chains),
			assetClasses: strArray(item.asset_classes),
			volume24h: num(item.total_volume),
			marketCap: num(item.total_mc),
			assets: num(item.rwa_asset),
			liquidity: num(item.total_liquidity),
			holders: num(item.total_holders),
			share: 0,
		}))
		.filter((issuer) => issuer.name.length > 0)
		.sort((a, b) => b.volume24h - a.volume24h);

	const totalVolume = issuers.reduce((sum, issuer) => sum + issuer.volume24h, 0);
	for (const issuer of issuers) {
		issuer.share = totalVolume > 0 ? (issuer.volume24h / totalVolume) * 100 : 0;
	}

	// ── History (volume + cumulative tokenized assets, joined by date) ──
	const assetsByDate = new Map<string, number>();
	for (const day of itemsOf(raw.assets)) {
		const date = str(day.event_date);
		if (!date) continue;
		const total = (Array.isArray(day.issuers) ? (day.issuers as Json[]) : []).reduce(
			(sum, issuer) => sum + num(issuer.cum_assets),
			0,
		);
		assetsByDate.set(date, total);
	}
	let lastAssets = 0;
	const history: RwaHistoryPoint[] = itemsOf(raw.history)
		.map((day) => {
			const date = str(day.event_date);
			const volume = (Array.isArray(day.issuers) ? (day.issuers as Json[]) : []).reduce(
				(sum, issuer) => sum + num(issuer.total_volume),
				0,
			);
			const assets = assetsByDate.get(date);
			if (assets !== undefined) lastAssets = assets;
			return { date, volume, assets: lastAssets };
		})
		.filter((point) => point.date.length > 0);

	// ── Tokens (per chain, deduped, sorted by volume) ──
	const tokens: RwaToken[] = [];
	const seen = new Set<string>();
	for (const chain of Object.keys(raw.tokens ?? {})) {
		for (const item of itemsOf(raw.tokens?.[chain])) {
			const address = str(item.address);
			const key = `${chain}:${address}`;
			if (address && seen.has(key)) continue;
			seen.add(key);

			const tf = (item.tf24h ?? {}) as Json;
			const participants = Array.isArray(item.participants)
				? (item.participants as Json[])
				: [];
			const issuerEntry = participants.find((p) => str(p.role) === "issuer");
			const tags = strArray(item.tags);

			tokens.push({
				symbol: str(item.symbol),
				name: str(item.name),
				chain: str(item.network) || chain,
				issuer: issuerEntry ? str(issuerEntry.entity) : (tags[0] ?? ""),
				underlying: str(item.underlyingAsset) || null,
				price: num(item.price),
				volume24h: num(tf.volumeUSD),
				marketCap: num(item.mc),
				liquidity: num(item.liquidity),
				change24h: num(tf.priceChangePercent),
				trades: num(tf.tradeCount),
				wallets: num(tf.uniqueWallets),
			});
		}
	}
	tokens.sort((a, b) => b.volume24h - a.volume24h);

	// ── Wrapper race (same underlying, competing wrappers) ──
	const groups = new Map<string, RwaToken[]>();
	for (const token of tokens) {
		if (token.volume24h <= 0) continue;
		const underlying = (token.underlying ?? stripWrapperSuffix(token.symbol)).toUpperCase();
		if (underlying.length < 2) continue;
		const bucket = groups.get(underlying);
		if (bucket) bucket.push(token);
		else groups.set(underlying, [token]);
	}

	const wrappers: RwaWrapperGroup[] = [...groups.entries()]
		.map(([underlying, list]) => {
			const sorted = [...list].sort((a, b) => b.volume24h - a.volume24h);
			const prices = sorted.map((wrapper) => wrapper.price).filter((price) => price > 0);
			const spreadPct =
				prices.length >= 2
					? ((Math.max(...prices) - Math.min(...prices)) / Math.min(...prices)) * 100
					: 0;
			return {
				underlying,
				wrappers: sorted,
				spreadPct,
				totalVolume: sorted.reduce((sum, wrapper) => sum + wrapper.volume24h, 0),
			};
		})
		.filter((group) => group.wrappers.length >= 2 && group.totalVolume >= MIN_WRAPPER_VOLUME)
		.sort((a, b) => b.totalVolume - a.totalVolume)
		.slice(0, 8);

	const totals = {
		volume24h: totalVolume,
		marketCap: issuers.reduce((sum, issuer) => sum + issuer.marketCap, 0),
		assets: issuers.reduce((sum, issuer) => sum + issuer.assets, 0),
		issuers: issuers.length,
		tokens: tokens.length,
	};

	return { asOf, provenance, totals, issuers, history, tokens, wrappers };
}

let memoryCache: { at: number; data: RwaData } | null = null;

/**
 * The page-facing entry point. Live data with a 30-minute per-isolate cache;
 * on any failure, the last good data (memory, then committed snapshot).
 */
export async function getRwaData(): Promise<RwaData> {
	if (memoryCache && Date.now() - memoryCache.at < CACHE_TTL_MS) {
		return memoryCache.data;
	}
	try {
		const raw = await fetchRaw();
		const data = normalize(raw, "live");
		memoryCache = { at: Date.now(), data };
		return data;
	} catch {
		if (memoryCache) return memoryCache.data;
		return normalize(rawFallback as unknown as RawPayload, "snapshot");
	}
}
