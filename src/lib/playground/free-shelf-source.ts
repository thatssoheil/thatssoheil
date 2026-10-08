// --- Playground: free shelf data source ---
// Reads Project Gutenberg's most-downloaded chart and degrades gracefully:
//
//   live fetch (per worker isolate) -> in-memory cache (60 min)
//                                   -> committed fallback snapshot
//
// Accept: text/html is load-bearing (2026-10-08): PG's Apache negotiates on
// it. Browsers get the static, daily-regenerated top.html; clients sending
// Accept: * / * get a legacy top.php variant with a broken stats table and
// different counts. Sending text/html reads the same page a visitor sees.
// The chart refreshes about once a day; an hour-long cache keeps the page
// far inside PG's human-scale traffic guidance. Refresh the fallback with
// `node scripts/fetch-free-shelf-snapshot.mjs`.

import rawFallback from "@/data/playground/free-shelf-fallback.json";
import type { FreeShelfBook, FreeShelfData, FreeShelfWindowKey } from "@/lib/playground/types";
import {
	PER_WINDOW,
	WINDOW_KEYS,
	parseChartSections,
	snapshotToData,
} from "@/lib/playground/free-shelf-parse";

const CHART_URL = "https://www.gutenberg.org/browse/scores/top";
const CACHE_TTL_MS = 60 * 60 * 1000;
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

/** Parse a header value into an ISO string; null when absent or invalid. */
function toIsoOrNull(value: string | null): string | null {
	if (!value) return null;
	const t = Date.parse(value);
	return Number.isNaN(t) ? null : new Date(t).toISOString();
}

async function fetchLive(): Promise<FreeShelfData> {
	const res = await fetch(CHART_URL, {
		headers: { accept: "text/html", "user-agent": USER_AGENT },
		cache: "no-store",
		signal: AbortSignal.timeout(15_000),
	});
	if (!res.ok) throw new Error(`${CHART_URL}: HTTP ${res.status}`);
	const chartModified = toIsoOrNull(res.headers.get("last-modified"));
	const html = await res.text();
	const sections = parseChartSections(html);
	const windows = Object.fromEntries(
		WINDOW_KEYS.map((key) => [key, sections[key].slice(0, PER_WINDOW)]),
	) as Record<FreeShelfWindowKey, FreeShelfBook[]>;
	return { asOf: new Date().toISOString(), chartModified, provenance: "live", windows };
}

let memoryCache: { at: number; data: FreeShelfData } | null = null;

/**
 * The page-facing entry point. Live chart data with a 60-minute per-isolate
 * cache; on any failure, the last good data (memory, then committed
 * snapshot).
 */
export async function getFreeShelfData(): Promise<FreeShelfData> {
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
			"[playground/free-shelf] live fetch failed; serving snapshot:",
			error instanceof Error ? `${error.name}: ${error.message}` : String(error),
		);
		if (memoryCache) return memoryCache.data;
		return snapshotToData(rawFallback);
	}
}
