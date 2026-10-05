// --- Playground: stablecoin float data source ---
// Fetches the total stablecoin float from DefiLlama's public aggregate
// endpoint, normalizes it to a daily series, and degrades gracefully:
//
//   live fetch  ->  in-memory cache (per worker isolate, 30 min)
//               ->  committed fallback snapshot (stablecoin-fallback.json)
//
// The endpoint is keyless and public; refresh the fallback with
// `node scripts/fetch-stablecoin-snapshot.mjs`. The page never depends on the
// live fetch to render.

import rawFallback from "@/data/playground/stablecoin-fallback.json";
import type { StablecoinData, StablecoinHistoryPoint } from "@/lib/playground/types";

const ENDPOINT = "https://stablecoins.llama.fi/stablecoincharts/all";
const CACHE_TTL_MS = 30 * 60 * 1000;
const DAY_S = 24 * 60 * 60;

/** Internal working shape: unix seconds + USD, both validated. */
interface Point {
	ts: number;
	usd: number;
}

interface RawFallback {
	asOf: string;
	points: [number, number][];
}

function num(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	// The aggregate feed sends numeric-string fields (date arrives as
	// "1791072000"); accept both so type drift cannot silently empty the
	// series and hide behind the snapshot.
	if (typeof value === "string" && value !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return 0;
}

function toPoints(rows: unknown): Point[] {
	if (!Array.isArray(rows)) throw new Error("stablecoin payload: not an array");
	const points: Point[] = [];
	for (const row of rows) {
		const item = row as Record<string, unknown> | null;
		const ts = num(item?.date);
		const usdRaw = (item?.totalCirculatingUSD ?? null) as Record<string, unknown> | null;
		const usd = num(usdRaw?.peggedUSD);
		if (ts > 0 && usd > 0) points.push({ ts, usd });
	}
	points.sort((a, b) => a.ts - b.ts);
	return points;
}

/** The reading at (or nearest before) N days back, used for change figures. */
function valueDaysBack(points: Point[], days: number): number | null {
	if (points.length === 0) return null;
	const target = points[points.length - 1].ts - days * DAY_S;
	for (let i = points.length - 1; i >= 0; i--) {
		if (points[i].ts <= target) return points[i].usd;
	}
	return null;
}

function pctChange(latest: number, then: number | null): number | null {
	if (then === null || then <= 0) return null;
	return (latest / then - 1) * 100;
}

function normalize(points: Point[], asOf: string, provenance: StablecoinData["provenance"]): StablecoinData {
	if (points.length === 0) throw new Error("stablecoin series is empty");

	const latestPoint = points[points.length - 1];
	let peakPoint = points[0];
	for (const point of points) {
		if (point.usd > peakPoint.usd) peakPoint = point;
	}

	const history: StablecoinHistoryPoint[] = points.map((point) => ({
		date: new Date(point.ts * 1000).toISOString(),
		usd: point.usd,
	}));

	return {
		asOf,
		provenance,
		latest: latestPoint.usd,
		latestDate: new Date(latestPoint.ts * 1000).toISOString(),
		change7d: pctChange(latestPoint.usd, valueDaysBack(points, 7)),
		change30d: pctChange(latestPoint.usd, valueDaysBack(points, 30)),
		peak: { value: peakPoint.usd, date: new Date(peakPoint.ts * 1000).toISOString() },
		distanceFromPeakPct: (latestPoint.usd / peakPoint.usd - 1) * 100,
		history,
	};
}

async function fetchLive(): Promise<StablecoinData> {
	const res = await fetch(ENDPOINT, {
		headers: { accept: "application/json" },
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});
	if (!res.ok) throw new Error(`stablecoincharts/all: HTTP ${res.status}`);
	const text = await res.text();
	const payload = JSON.parse(text) as unknown;
	const points = toPoints(payload);
	if (points.length === 0) {
		console.warn(
			"[playground/stablecoins] diag: empty series",
			JSON.stringify({
				status: res.status,
				bytes: text.length,
				cf: res.headers.get("cf-cache-status"),
				age: res.headers.get("age"),
				contentType: res.headers.get("content-type"),
				isArray: Array.isArray(payload),
				len: Array.isArray(payload) ? (payload as unknown[]).length : -1,
				head: text.slice(0, 200),
			}),
		);
	}
	return normalize(points, new Date().toISOString(), "live");
}

let memoryCache: { at: number; data: StablecoinData } | null = null;

/**
 * The page-facing entry point. Live data with a 30-minute per-isolate cache;
 * on any failure, the last good data (memory, then committed snapshot).
 */
export async function getStablecoinData(): Promise<StablecoinData> {
	if (memoryCache && Date.now() - memoryCache.at < CACHE_TTL_MS) {
		return memoryCache.data;
	}
	try {
		const data = await fetchLive();
		memoryCache = { at: Date.now(), data };
		return data;
	} catch (error) {
		// Keep fallbacks visible: a silent catch once hid a live-fetch
		// regression behind the snapshot.
		console.warn(
			"[playground/stablecoins] live fetch failed; serving snapshot:",
			error instanceof Error ? `${error.name}: ${error.message}` : String(error),
		);
		if (memoryCache) return memoryCache.data;
		const fallback = rawFallback as unknown as RawFallback;
		const points = fallback.points
			.map(([ts, usd]) => ({ ts: num(ts), usd: num(usd) }))
			.filter((point) => point.ts > 0 && point.usd > 0);
		return normalize(points, fallback.asOf, "snapshot");
	}
}
