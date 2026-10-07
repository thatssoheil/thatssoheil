// --- Playground: Hafez fal data source ---
// Draws a random Hafez ghazal from Ganjoor's fal endpoint and degrades
// gracefully:
//
//   live draw (per worker isolate) -> in-memory cache (60 s)
//                                  -> committed set (a local draw)
//
// The endpoint is keyless and public; the API FAQ allows this kind of use but
// warns the schema may change without notice, so the committed set carries the
// page when the live draw fails. Refresh the set with
// `node scripts/fetch-hafez-snapshot.mjs`. The page never depends on the live
// draw to render.

import rawFallback from "@/data/playground/hafez-fallback.json";
import { parseFalPayload } from "@/lib/playground/hafez-parse";
import type { HafezData, HafezFallbackSet, HafezGhazal } from "@/lib/playground/types";

const FAAL_URL = "https://api.ganjoor.net/api/ganjoor/hafez/faal";
const CACHE_TTL_MS = 60 * 1000;
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

function toFallbackSet(raw: unknown): HafezFallbackSet {
	const record = (raw ?? {}) as { generatedAt?: unknown; ghazals?: unknown };
	if (typeof record.generatedAt !== "string" || record.generatedAt.length === 0) {
		throw new Error("hafez fallback: generatedAt missing");
	}
	if (!Array.isArray(record.ghazals) || record.ghazals.length === 0) {
		throw new Error("hafez fallback: ghazals missing");
	}
	return {
		generatedAt: record.generatedAt,
		ghazals: record.ghazals.map(parseFalPayload),
	};
}

const fallbackSet = toFallbackSet(rawFallback as unknown);

/** The committed set, so the client can draw locally when a live draw fails. */
export function getHafezFallbackSet(): HafezFallbackSet {
	return fallbackSet;
}

function drawFromSet(set: HafezFallbackSet): HafezGhazal {
	const index = Math.floor(Math.random() * set.ghazals.length);
	return set.ghazals[index];
}

async function drawLive(): Promise<HafezData> {
	const res = await fetch(FAAL_URL, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
		cache: "no-store",
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`${FAAL_URL}: HTTP ${res.status}`);
	const payload = await res.json();
	return {
		asOf: new Date().toISOString(),
		provenance: "live",
		ghazal: parseFalPayload(payload),
	};
}

let memoryCache: { at: number; data: HafezData } | null = null;

/**
 * The page-facing entry point. A live draw with a 60-second per-isolate
 * cache; on any failure, the last good draw (memory, then the committed set).
 */
export async function getHafezData(): Promise<HafezData> {
	if (memoryCache && Date.now() - memoryCache.at < CACHE_TTL_MS) {
		return memoryCache.data;
	}
	try {
		const data = await drawLive();
		memoryCache = { at: Date.now(), data };
		return data;
	} catch (error) {
		// Keep fallbacks visible: a silent catch once hid a live-fetch
		// regression behind the snapshot (stablecoins, 2026-10).
		console.warn(
			"[playground/hafez] live draw failed; drawing from the local set:",
			error instanceof Error ? `${error.name}: ${error.message}` : String(error),
		);
		if (memoryCache) return memoryCache.data;
		return {
			asOf: fallbackSet.generatedAt,
			provenance: "local",
			ghazal: drawFromSet(fallbackSet),
		};
	}
}
