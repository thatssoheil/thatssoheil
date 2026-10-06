// --- Playground: solar watch data source ---
// Fetches NOAA SWPC's space weather products (the planetary K index, its
// three-day forecast, and the near-real-time solar wind / F10.7 summaries)
// and degrades gracefully:
//
//   live fetch (per worker isolate) -> in-memory cache (60 s)
//                                   -> committed fallback snapshot
//
// The feeds are keyless and public; refresh the fallback with
// `node scripts/fetch-solar-snapshot.mjs`. The page never depends on the
// live fetch to render.

import rawFallback from "@/data/playground/solar-fallback.json";
import type {
	SolarData,
	SolarFluxSummary,
	SolarForecastBin,
	SolarKpBin,
	SolarMagSummary,
	SolarWindSummary,
} from "@/lib/playground/types";

const BASE = "https://services.swpc.noaa.gov";
const KP_URL = `${BASE}/products/noaa-planetary-k-index.json`;
const FORECAST_URL = `${BASE}/products/noaa-planetary-k-index-forecast.json`;
const WIND_URL = `${BASE}/products/summary/solar-wind-speed.json`;
const MAG_URL = `${BASE}/products/summary/solar-wind-mag-field.json`;
const FLUX_URL = `${BASE}/products/summary/10cm-flux.json`;
const CACHE_TTL_MS = 60 * 1000;
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

/** NOAA timestamps sometimes omit the Z; store everything as ISO UTC. */
function normalizeTime(value: string): string {
	return value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
}

function numOrNull(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return null;
}

interface RawKpRow {
	time_tag?: unknown;
	Kp?: unknown;
}

function toKpBins(rows: unknown): { t: string; kp: number }[] {
	if (!Array.isArray(rows)) throw new Error("kp payload: rows missing");
	const bins: { t: string; kp: number }[] = [];
	for (const row of rows) {
		const r = row as RawKpRow;
		const t = typeof r?.time_tag === "string" ? normalizeTime(r.time_tag) : "";
		const kp = numOrNull(r?.Kp);
		if (!t || kp === null || kp < 0) continue;
		bins.push({ t, kp });
	}
	if (bins.length === 0) throw new Error("kp payload: no usable bins");
	return bins.slice(-56);
}

const FORECAST_TYPES = new Set(["observed", "estimated", "predicted"]);

interface RawForecastRow {
	time_tag?: unknown;
	kp?: unknown;
	observed?: unknown;
	noaa_scale?: unknown;
}

function toForecastBins(rows: unknown): SolarForecastBin[] {
	if (!Array.isArray(rows)) throw new Error("forecast payload: rows missing");
	const bins: SolarForecastBin[] = [];
	for (const row of rows) {
		const r = row as RawForecastRow;
		const t = typeof r?.time_tag === "string" ? normalizeTime(r.time_tag) : "";
		const kp = numOrNull(r?.kp);
		const type = typeof r?.observed === "string" ? r.observed : "";
		if (!t || kp === null || kp < 0 || !FORECAST_TYPES.has(type)) continue;
		const scale =
			typeof r?.noaa_scale === "string" && r.noaa_scale !== "" ? r.noaa_scale : null;
		bins.push({ t, kp, type: type as SolarForecastBin["type"], scale });
	}
	if (bins.length === 0) throw new Error("forecast payload: no usable bins");
	return bins;
}

/** Attaches the feed's storm labels (they ride on the forecast product). */
function mergeScales(
	kp: { t: string; kp: number }[],
	forecast: SolarForecastBin[],
): SolarKpBin[] {
	const byTime = new Map<string, string>();
	for (const bin of forecast) {
		if (bin.scale) byTime.set(bin.t, bin.scale);
	}
	return kp.map((bin) => ({ ...bin, scale: byTime.get(bin.t) ?? null }));
}

function toWind(rows: unknown): SolarWindSummary {
	const row = (Array.isArray(rows) ? rows[0] : null) as {
		proton_speed?: unknown;
		time_tag?: unknown;
	} | null;
	const speed = numOrNull(row?.proton_speed);
	const t = typeof row?.time_tag === "string" ? normalizeTime(row.time_tag) : "";
	if (speed === null || speed <= 0 || !t) throw new Error("wind payload: unusable");
	return { speed, t };
}

function toMag(rows: unknown): SolarMagSummary {
	const row = (Array.isArray(rows) ? rows[0] : null) as {
		bt?: unknown;
		bz_gsm?: unknown;
		time_tag?: unknown;
	} | null;
	const bt = numOrNull(row?.bt);
	const bz = numOrNull(row?.bz_gsm);
	const t = typeof row?.time_tag === "string" ? normalizeTime(row.time_tag) : "";
	if (bt === null || bt < 0 || bz === null || !t) throw new Error("mag payload: unusable");
	return { bt, bz, t };
}

function toFlux(rows: unknown): SolarFluxSummary {
	const row = (Array.isArray(rows) ? rows[0] : null) as {
		flux?: unknown;
		time_tag?: unknown;
	} | null;
	const v = numOrNull(row?.flux);
	const t = typeof row?.time_tag === "string" ? normalizeTime(row.time_tag) : "";
	if (v === null || v <= 0 || !t) throw new Error("flux payload: unusable");
	return { v, t };
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

async function fetchLive(): Promise<SolarData> {
	const [kpRaw, forecastRaw, windRaw, magRaw, fluxRaw] = await Promise.all([
		fetchJson(KP_URL),
		fetchJson(FORECAST_URL),
		fetchJson(WIND_URL),
		fetchJson(MAG_URL),
		fetchJson(FLUX_URL),
	]);
	const forecast = toForecastBins(forecastRaw);
	return {
		asOf: new Date().toISOString(),
		provenance: "live",
		kp: mergeScales(toKpBins(kpRaw), forecast),
		forecast,
		wind: toWind(windRaw),
		mag: toMag(magRaw),
		flux: toFlux(fluxRaw),
	};
}

interface RawFallback {
	generatedAt: string;
	kp: { t: string; kp: number }[];
	forecast: SolarForecastBin[];
	wind: SolarWindSummary;
	mag: SolarMagSummary;
	flux: SolarFluxSummary;
}

function normalizeFallback(raw: RawFallback): SolarData {
	if (!Array.isArray(raw.kp) || raw.kp.length === 0) {
		throw new Error("fallback snapshot: no kp bins");
	}
	if (!Array.isArray(raw.forecast) || raw.forecast.length === 0) {
		throw new Error("fallback snapshot: no forecast bins");
	}
	const forecast = raw.forecast.map((bin) => ({
		t: normalizeTime(bin.t),
		kp: bin.kp,
		type: bin.type,
		scale: bin.scale ?? null,
	}));
	return {
		asOf: raw.generatedAt,
		provenance: "snapshot",
		kp: mergeScales(
			raw.kp.map((bin) => ({ t: normalizeTime(bin.t), kp: bin.kp })),
			forecast,
		),
		forecast,
		wind: raw.wind,
		mag: raw.mag,
		flux: raw.flux,
	};
}

let memoryCache: { at: number; data: SolarData } | null = null;

/**
 * The page-facing entry point. Live data with a 60-second per-isolate cache;
 * on any failure, the last good data (memory, then committed snapshot).
 */
export async function getSolarData(): Promise<SolarData> {
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
			"[playground/solar] live fetch failed; serving snapshot:",
			error instanceof Error ? `${error.name}: ${error.message}` : String(error),
		);
		if (memoryCache) return memoryCache.data;
		return normalizeFallback(rawFallback as unknown as RawFallback);
	}
}
