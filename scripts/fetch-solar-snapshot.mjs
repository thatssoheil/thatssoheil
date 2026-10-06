#!/usr/bin/env node
/**
 * Generates src/data/playground/solar-fallback.json - the committed fallback
 * the Playground solar watch page renders when the NOAA SWPC feeds are
 * unreachable.
 *
 * Run from the repo root:  node scripts/fetch-solar-snapshot.mjs
 *
 * Source: https://services.swpc.noaa.gov (keyless, public domain). The payload
 * is trimmed to the fields the page uses: 56 Kp bins (past 7 days), the full
 * observed + estimated + predicted forecast, and the latest wind / mag / flux
 * summaries.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/solar-fallback.json");
const BASE = "https://services.swpc.noaa.gov";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

async function fetchJson(url) {
	const res = await fetch(url, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
	});
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return res.json();
}

/** NOAA timestamps sometimes omit the Z; store everything as ISO UTC. */
const normalizeTime = (value) =>
	value.endsWith("Z") || /[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;

const [kpRaw, forecastRaw, windRaw, magRaw, fluxRaw] = await Promise.all([
	fetchJson(`${BASE}/products/noaa-planetary-k-index.json`),
	fetchJson(`${BASE}/products/noaa-planetary-k-index-forecast.json`),
	fetchJson(`${BASE}/products/summary/solar-wind-speed.json`),
	fetchJson(`${BASE}/products/summary/solar-wind-mag-field.json`),
	fetchJson(`${BASE}/products/summary/10cm-flux.json`),
]);

const kp = kpRaw
	.slice(-56)
	.map((bin) => ({ t: normalizeTime(bin.time_tag), kp: Number(bin.Kp) }))
	.filter((bin) => Number.isFinite(bin.kp) && bin.kp >= 0);

const forecast = forecastRaw
	.map((bin) => ({
		t: normalizeTime(bin.time_tag),
		kp: Number(bin.kp),
		type: bin.observed,
		scale: bin.noaa_scale ?? null,
	}))
	.filter(
		(bin) =>
			Number.isFinite(bin.kp) &&
			bin.kp >= 0 &&
			["observed", "estimated", "predicted"].includes(bin.type),
	);

if (kp.length === 0 || forecast.length === 0) {
	throw new Error("feeds: no usable bins");
}

const wind = {
	speed: windRaw[0].proton_speed,
	t: normalizeTime(windRaw[0].time_tag),
};
const mag = {
	bt: magRaw[0].bt,
	bz: magRaw[0].bz_gsm,
	t: normalizeTime(magRaw[0].time_tag),
};
const flux = {
	v: fluxRaw[0].flux,
	t: normalizeTime(fluxRaw[0].time_tag),
};

const payload = {
	generatedAt: new Date().toISOString(),
	source: "NOAA SWPC (services.swpc.noaa.gov)",
	kp,
	forecast,
	wind,
	mag,
	flux,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(payload);
writeFileSync(OUT, json);

const last = kp[kp.length - 1];
console.log(
	`wrote ${OUT} (${(json.length / 1024).toFixed(1)} KB; ${kp.length} kp bins; ` +
		`${forecast.length} forecast bins; latest Kp ${last.kp} ${last.t}; ` +
		`wind ${wind.speed} km/s; Bz ${mag.bz} nT; F10.7 ${flux.v} sfu)`,
);
