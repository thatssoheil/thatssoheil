// --- Playground: Tehran air data source ---
// Fetches Open-Meteo's air-quality bundle for Tehran (the current-hour
// reading plus the hourly series: the past two days and today) and degrades
// gracefully:
//
//   live fetch (per worker isolate) -> in-memory cache (60 s)
//                                   -> committed fallback snapshot
//
// The API is keyless and public (data CC BY 4.0, attribution "Weather data by
// Open-Meteo.com"); refresh the fallback with
// `node scripts/fetch-air-snapshot.mjs`. The page never depends on the live
// fetch to render.

import rawFallback from "@/data/playground/air-fallback.json";
import type { AirData, AirReading } from "@/lib/playground/types";

const BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";
const COORDS = "latitude=35.6892&longitude=51.3890";
const CURRENT_URL = `${BASE}?${COORDS}&current=pm2_5,pm10,european_aqi,us_aqi&timezone=Asia%2FTehran`;
const HOURLY_URL = `${BASE}?${COORDS}&hourly=pm2_5,pm10,european_aqi,us_aqi&past_days=2&forecast_days=1&timezone=Asia%2FTehran`;
const CACHE_TTL_MS = 60 * 1000;
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

function numOrNull(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

/** The feed returns Tehran wall-clock strings ("YYYY-MM-DDTHH:MM"). */
function isLocalTime(value: unknown): value is string {
	return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value);
}

function toReading(
	t: string,
	pm25: unknown,
	pm10: unknown,
	aqiEu: unknown,
	aqiUs: unknown,
): AirReading {
	const p25 = numOrNull(pm25);
	const p10 = numOrNull(pm10);
	const eu = numOrNull(aqiEu);
	const us = numOrNull(aqiUs);
	if (
		p25 === null ||
		p25 < 0 ||
		p10 === null ||
		p10 < 0 ||
		eu === null ||
		eu < 0 ||
		us === null ||
		us < 0
	) {
		throw new Error(`air payload: unusable reading at ${t}`);
	}
	return { t, pm25: p25, pm10: p10, aqiEu: eu, aqiUs: us };
}

interface RawCurrent {
	time?: unknown;
	pm2_5?: unknown;
	pm10?: unknown;
	european_aqi?: unknown;
	us_aqi?: unknown;
}

function toCurrent(raw: unknown): AirReading {
	const r = (raw ?? {}) as RawCurrent;
	if (!isLocalTime(r.time)) throw new Error("air payload: current time missing");
	return toReading(r.time, r.pm2_5, r.pm10, r.european_aqi, r.us_aqi);
}

interface RawHourly {
	time?: unknown;
	pm2_5?: unknown;
	pm10?: unknown;
	european_aqi?: unknown;
	us_aqi?: unknown;
}

function toHourly(raw: unknown): AirReading[] {
	const r = (raw ?? {}) as RawHourly;
	if (!Array.isArray(r.time)) throw new Error("air payload: hourly times missing");
	const pm25 = Array.isArray(r.pm2_5) ? r.pm2_5 : [];
	const pm10 = Array.isArray(r.pm10) ? r.pm10 : [];
	const aqiEu = Array.isArray(r.european_aqi) ? r.european_aqi : [];
	const aqiUs = Array.isArray(r.us_aqi) ? r.us_aqi : [];
	const bins: AirReading[] = [];
	for (let i = 0; i < r.time.length; i += 1) {
		const t = r.time[i];
		if (!isLocalTime(t)) continue;
		const p25 = numOrNull(pm25[i]);
		const p10 = numOrNull(pm10[i]);
		const eu = numOrNull(aqiEu[i]);
		const us = numOrNull(aqiUs[i]);
		if (
			p25 === null ||
			p25 < 0 ||
			p10 === null ||
			p10 < 0 ||
			eu === null ||
			eu < 0 ||
			us === null ||
			us < 0
		) {
			continue;
		}
		bins.push({ t, pm25: p25, pm10: p10, aqiEu: eu, aqiUs: us });
	}
	if (bins.length === 0) throw new Error("air payload: no usable hourly bins");
	return bins.slice(-72);
}

async function fetchJson(url: string): Promise<unknown> {
	const res = await fetch(url, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
		cache: "no-store",
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return res.json();
}

async function fetchLive(): Promise<AirData> {
	const [currentRaw, hourlyRaw] = await Promise.all([
		fetchJson(CURRENT_URL),
		fetchJson(HOURLY_URL),
	]);
	const currentPayload = currentRaw as { current?: unknown };
	const hourlyPayload = hourlyRaw as { hourly?: unknown };
	return {
		asOf: new Date().toISOString(),
		provenance: "live",
		current: toCurrent(currentPayload.current),
		hourly: toHourly(hourlyPayload.hourly),
	};
}

interface RawFallback {
	generatedAt: string;
	current: RawCurrent;
	hourly: RawHourly;
}

function normalizeFallback(raw: RawFallback): AirData {
	return {
		asOf: raw.generatedAt,
		provenance: "snapshot",
		current: toCurrent(raw.current),
		hourly: toHourly(raw.hourly),
	};
}

let memoryCache: { at: number; data: AirData } | null = null;

/**
 * The page-facing entry point. Live data with a 60-second per-isolate cache;
 * on any failure, the last good data (memory, then committed snapshot).
 */
export async function getAirData(): Promise<AirData> {
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
			"[playground/air] live fetch failed; serving snapshot:",
			error instanceof Error ? `${error.name}: ${error.message}` : String(error),
		);
		if (memoryCache) return memoryCache.data;
		return normalizeFallback(rawFallback as unknown as RawFallback);
	}
}
