// --- Playground: seismic watch data source ---
// Fetches the week's significant earthquakes (the USGS M4.5+ feed) and
// degrades gracefully:
//
//   live fetch (per worker isolate) -> in-memory cache (60 s)
//                                   -> committed fallback snapshot
//
// The feed is keyless and public; refresh the fallback with
// `node scripts/fetch-seismic-snapshot.mjs`. The page never depends on the
// live fetch to render.

import rawFallback from "@/data/playground/seismic-fallback.json";
import type { SeismicData, SeismicEvent } from "@/lib/playground/types";

const FEED =
	"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
const CACHE_TTL_MS = 60 * 1000;
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

interface RawFeature {
	properties?: {
		mag?: unknown;
		time?: unknown;
		place?: unknown;
		url?: unknown;
	};
	geometry?: { coordinates?: unknown };
}

interface RawFeed {
	metadata?: { generated?: unknown };
	features?: unknown;
}

function num(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return 0;
}

function toEvent(row: unknown): SeismicEvent | null {
	const feature = row as RawFeature;
	const props = feature?.properties;
	const coords = feature?.geometry?.coordinates;
	if (!Array.isArray(coords) || coords.length < 3) return null;
	const mag = num(props?.mag);
	const timeMs = num(props?.time);
	const depthKm = num(coords[2]);
	const place = typeof props?.place === "string" ? props.place : "";
	const url = typeof props?.url === "string" ? props.url : "";
	if (!(mag > 0) || !(timeMs > 0) || !place || !url) return null;
	return { time: new Date(timeMs).toISOString(), mag, depthKm, place, url };
}

function normalize(
	rows: unknown,
	asOf: string,
	provenance: SeismicData["provenance"],
): SeismicData {
	if (!Array.isArray(rows)) throw new Error("feed payload: features missing");
	const events: SeismicEvent[] = [];
	for (const row of rows) {
		const event = toEvent(row);
		if (event) events.push(event);
	}
	if (events.length === 0) throw new Error("feed payload: no usable events");
	events.sort((a, b) => (a.time < b.time ? 1 : -1));
	return {
		asOf,
		provenance,
		count: events.length,
		m5plus: events.filter((event) => event.mag >= 5).length,
		m6plus: events.filter((event) => event.mag >= 6).length,
		largest: events.reduce((best, event) => (event.mag > best.mag ? event : best)),
		latest: events[0],
		events,
	};
}

async function fetchLive(): Promise<SeismicData> {
	const res = await fetch(FEED, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
		cache: "no-store",
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`${FEED}: HTTP ${res.status}`);
	const raw = (await res.json()) as RawFeed;
	const generated = num(raw?.metadata?.generated);
	const asOf =
		generated > 0 ? new Date(generated).toISOString() : new Date().toISOString();
	return normalize(raw?.features, asOf, "live");
}

interface RawFallback {
	generatedAt: string;
	events: SeismicEvent[];
}

function normalizeFallback(raw: RawFallback): SeismicData {
	const events = [...raw.events].sort((a, b) => (a.time < b.time ? 1 : -1));
	if (events.length === 0) throw new Error("fallback snapshot: no events");
	return {
		asOf: raw.generatedAt,
		provenance: "snapshot",
		count: events.length,
		m5plus: events.filter((event) => event.mag >= 5).length,
		m6plus: events.filter((event) => event.mag >= 6).length,
		largest: events.reduce((best, event) => (event.mag > best.mag ? event : best)),
		latest: events[0],
		events,
	};
}

let memoryCache: { at: number; data: SeismicData } | null = null;

/**
 * The page-facing entry point. Live data with a 60-second per-isolate cache;
 * on any failure, the last good data (memory, then committed snapshot).
 */
export async function getSeismicData(): Promise<SeismicData> {
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
			"[playground/seismic] live fetch failed; serving snapshot:",
			error instanceof Error ? `${error.name}: ${error.message}` : String(error),
		);
		if (memoryCache) return memoryCache.data;
		return normalizeFallback(rawFallback as unknown as RawFallback);
	}
}
