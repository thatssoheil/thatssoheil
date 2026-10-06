#!/usr/bin/env node
/**
 * Generates src/data/playground/air-fallback.json - the committed fallback
 * the Playground Tehran air page renders when the Open-Meteo air-quality API
 * is unreachable.
 *
 * Run from the repo root:  node scripts/fetch-air-snapshot.mjs
 *
 * Source: https://air-quality-api.open-meteo.com (keyless; data CC BY 4.0,
 * attribution "Weather data by Open-Meteo.com"). The payload is trimmed to
 * the fields the page uses: the current bin and 72 hourly bins (the past two
 * days plus today, Tehran local times).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/air-fallback.json");
const BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";
const COORDS = "latitude=35.6892&longitude=51.3890";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

async function fetchJson(url) {
	const res = await fetch(url, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
	});
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return res.json();
}

const [currentRaw, hourlyRaw] = await Promise.all([
	fetchJson(`${BASE}?${COORDS}&current=pm2_5,pm10,european_aqi,us_aqi&timezone=Asia%2FTehran`),
	fetchJson(
		`${BASE}?${COORDS}&hourly=pm2_5,pm10,european_aqi,us_aqi&past_days=2&forecast_days=1&timezone=Asia%2FTehran`,
	),
]);

const current = currentRaw.current;
if (!current || typeof current.time !== "string") {
	throw new Error("air feed: current bin missing");
}
const missing = ["pm2_5", "pm10", "european_aqi", "us_aqi"].filter(
	(key) => typeof current[key] !== "number",
);
if (missing.length > 0) {
	throw new Error(`air feed: current fields missing: ${missing.join(", ")}`);
}

const hourly = hourlyRaw.hourly;
if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) {
	throw new Error("air feed: hourly series missing");
}
const n = hourly.time.length;
for (const key of ["pm2_5", "pm10", "european_aqi", "us_aqi"]) {
	if (!Array.isArray(hourly[key]) || hourly[key].length !== n) {
		throw new Error(`air feed: hourly ${key} length mismatch`);
	}
}

const payload = {
	generatedAt: new Date().toISOString(),
	source: "Open-Meteo air quality API (air-quality-api.open-meteo.com)",
	attribution: "Weather data by Open-Meteo.com (CC BY 4.0)",
	location: { name: "Tehran", latitude: 35.6892, longitude: 51.389, timezone: "Asia/Tehran" },
	current: {
		time: current.time,
		interval: current.interval,
		pm2_5: current.pm2_5,
		pm10: current.pm10,
		european_aqi: current.european_aqi,
		us_aqi: current.us_aqi,
	},
	hourly: {
		time: hourly.time.slice(-72),
		pm2_5: hourly.pm2_5.slice(-72),
		pm10: hourly.pm10.slice(-72),
		european_aqi: hourly.european_aqi.slice(-72),
		us_aqi: hourly.us_aqi.slice(-72),
	},
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(payload);
writeFileSync(OUT, json);

console.log(
	`wrote ${OUT} (${(json.length / 1024).toFixed(1)} KB; current ${current.time}: ` +
		`PM2.5 ${current.pm2_5}, PM10 ${current.pm10}, EAQI ${current.european_aqi}, ` +
		`USAQI ${current.us_aqi}; ${payload.hourly.time.length} hourly bins)`,
);
