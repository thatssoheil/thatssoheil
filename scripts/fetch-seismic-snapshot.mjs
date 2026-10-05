#!/usr/bin/env node
/**
 * Generates src/data/playground/seismic-fallback.json - the committed
 * fallback the Playground seismic watch page renders when the live USGS
 * feed is unreachable.
 *
 * Run from the repo root:  node scripts/fetch-seismic-snapshot.mjs
 *
 * Source: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson
 * (keyless, public domain). The payload is trimmed to the fields the page
 * uses; all events are kept so the count and the list stay consistent.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/seismic-fallback.json");
const FEED =
	"https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

const res = await fetch(FEED, {
	headers: { accept: "application/json", "user-agent": USER_AGENT },
});
if (!res.ok) throw new Error(`feed: HTTP ${res.status}`);
const raw = await res.json();

const features = Array.isArray(raw?.features) ? raw.features : [];
const events = [];
for (const feature of features) {
	const props = feature?.properties ?? {};
	const coords = feature?.geometry?.coordinates;
	const mag = Number(props.mag);
	const timeMs = Number(props.time);
	const depthKm = Array.isArray(coords) && coords.length >= 3 ? Number(coords[2]) : NaN;
	if (!Number.isFinite(mag) || !(timeMs > 0) || !Number.isFinite(depthKm)) continue;
	if (typeof props.place !== "string" || typeof props.url !== "string") continue;
	events.push({
		time: new Date(timeMs).toISOString(),
		mag,
		depthKm,
		place: props.place,
		url: props.url,
	});
}
if (events.length === 0) throw new Error("feed: no usable events");
events.sort((a, b) => (a.time < b.time ? 1 : -1));

const generated = Number(raw?.metadata?.generated);
const generatedAt =
	generated > 0 ? new Date(generated).toISOString() : new Date().toISOString();
const largest = events.reduce((best, event) => (event.mag > best.mag ? event : best));

const payload = {
	generatedAt,
	source: "USGS Earthquake Hazards Program (earthquake.usgs.gov)",
	feed: "4.5_week (M4.5+, past 7 days, rolling)",
	count: events.length,
	m5plus: events.filter((event) => event.mag >= 5).length,
	m6plus: events.filter((event) => event.mag >= 6).length,
	largest,
	latest: events[0],
	events,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(payload);
writeFileSync(OUT, json);

console.log(
	`wrote ${OUT} (${(json.length / 1024).toFixed(0)} KB; ${events.length} events; ` +
		`M5+ ${payload.m5plus}; largest M${largest.mag} ${largest.place}; ` +
		`latest M${events[0].mag} ${events[0].time})`,
);
