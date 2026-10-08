// --- Playground: sugar cubes data source ---
// Reads Open Food Facts (keyless, ODbL) and degrades gracefully:
//
//   live search (per worker isolate) -> in-memory cache (60 min)
//                                    -> committed curated snapshot
//
// The free-text search endpoint is intermittent under load (HTML 503 waves,
// found at vetting 2026-10-08) - retry once after a short pause, then serve
// the committed snapshot and say so. Search is submitted only: Open Food
// Facts forbids search-as-you-type, and this module is only reached on a
// ?q= request. Refresh the snapshot with
// `node scripts/fetch-sugar-snapshot.mjs` from the repo root.

import rawFallback from "@/data/playground/sugar-cubes-fallback.json";
import type { SugarData } from "@/lib/playground/types";
import {
	curatedProducts,
	findCuratedMatch,
	normalizeQuery,
	parseSearchPayload,
	type SugarFallbackFile,
} from "@/lib/playground/sugar-parse";

const SEARCH_URL = "https://world.openfoodfacts.org/cgi/search.pl";
const FIELDS = "code,product_name,brands,quantity,serving_size,nutriments";
const PAGE_SIZE = 8;
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 64;
const RETRY_DELAY_MS = 700;
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

const fallbackFile: SugarFallbackFile = rawFallback;

interface CacheEntry {
	at: number;
	data: SugarData;
}

/** Per-isolate per-query cache; small (the page's own dampener on repeat
 * searches, well inside Open Food Facts' 10 searches/min guidance). */
const cache = new Map<string, CacheEntry>();

function cacheSet(query: string, data: SugarData): void {
	if (cache.size >= CACHE_MAX) {
		const oldest = cache.keys().next().value;
		if (oldest !== undefined) cache.delete(oldest);
	}
	cache.set(query, { at: Date.now(), data });
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSearch(query: string): Promise<SugarData> {
	const url = `${SEARCH_URL}?${new URLSearchParams({
		search_terms: query,
		search_simple: "1",
		action: "process",
		json: "1",
		page_size: String(PAGE_SIZE),
		sort_by: "popularity",
		fields: FIELDS,
	}).toString()}`;
	const res = await fetch(url, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
		cache: "no-store",
		signal: AbortSignal.timeout(12_000),
	});
	if (!res.ok) throw new Error(`Open Food Facts search: HTTP ${res.status}`);
	const { products, totalCount } = parseSearchPayload(await res.json());
	return {
		asOf: new Date().toISOString(),
		provenance: "live",
		query,
		mode: "search",
		fallback: null,
		totalCount,
		results: products,
	};
}

/**
 * The page-facing entry point. An empty query is the curated default view
 * (local data, no fetch). A real query goes live with a 60-minute
 * per-isolate cache; on failure after one retry, the curated snapshot serves
 * the query's own entry when the committed set has one, the whole set
 * otherwise.
 */
export async function getSugarData(queryRaw: string): Promise<SugarData> {
	const query = normalizeQuery(queryRaw);
	if (query === "") {
		return {
			asOf: fallbackFile.generatedAt,
			provenance: "snapshot",
			query: "",
			mode: "curated",
			fallback: null,
			totalCount: null,
			results: curatedProducts(fallbackFile),
		};
	}

	const cached = cache.get(query);
	if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;

	try {
		const data = await fetchSearch(query);
		cacheSet(query, data);
		return data;
	} catch {
		try {
			await sleep(RETRY_DELAY_MS);
			const data = await fetchSearch(query);
			cacheSet(query, data);
			return data;
		} catch (error) {
			// Keep fallbacks visible: a silent catch once hid a live-fetch
			// regression behind the snapshot (stablecoins, 2026-10).
			console.warn(
				"[playground/sugar-cubes] live search failed; serving the curated snapshot:",
				error instanceof Error ? `${error.name}: ${error.message}` : String(error),
			);
			const match = findCuratedMatch(fallbackFile, query);
			return {
				asOf: fallbackFile.generatedAt,
				provenance: "snapshot",
				query,
				mode: "curated",
				fallback: match ? "match" : "set",
				totalCount: null,
				results: match ? [match] : curatedProducts(fallbackFile),
			};
		}
	}
}
