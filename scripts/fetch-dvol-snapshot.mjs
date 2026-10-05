#!/usr/bin/env node
/**
 * Generates src/data/playground/dvol-fallback.json - the committed snapshot
 * the Playground volatility gauge renders (and upgrades from live in the
 * visitor's browser).
 *
 * Run from the repo root:  node scripts/fetch-dvol-snapshot.mjs
 *
 * Source: https://www.deribit.com/api/v2/public/get_volatility_index_data
 * (keyless, public). Full daily close history for BTC and ETH since March
 * 2021, stored as [unix_day_seconds, close] pairs per series so the committed
 * JSON stays small (about 77 KB). Deribit blocks Cloudflare Worker egress, so
 * this script is the server-side path; the page itself never fetches at
 * request time.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/dvol-fallback.json");
const ENDPOINT = "https://www.deribit.com/api/v2/public/get_volatility_index_data";
const START_MS = Date.UTC(2021, 0, 1);
const DAY_S = 86_400;

const UA = "thatssoheil-website/0.1 (+https://thatssoheil.website)";

async function fetchSeries(currency) {
	const rows = [];
	let cursor = Date.now();
	for (let call = 0; call < 8; call += 1) {
		const url =
			`${ENDPOINT}?currency=${currency}&start_timestamp=${START_MS}` +
			`&end_timestamp=${Math.floor(cursor)}&resolution=1D`;
		const res = await fetch(url, {
			headers: { accept: "application/json", "user-agent": UA },
		});
		if (!res.ok) throw new Error(`DVOL ${currency}: HTTP ${res.status}`);
		const payload = await res.json();
		const data = payload?.result?.data;
		if (!Array.isArray(data) || data.length === 0) break;
		rows.unshift(...data);
		const oldest = data[0][0];
		if (data.length < 1000 || oldest <= START_MS) break;
		cursor = oldest - 1;
		await new Promise((resolve) => setTimeout(resolve, 300));
	}

	// Compact to [unix_day_seconds, close], deduped by day.
	const byDay = new Map();
	for (const row of rows) {
		const day = Math.floor(row[0] / 1000 / DAY_S) * DAY_S;
		const close = Number(row[4]);
		if (Number.isFinite(close) && close > 0) byDay.set(day, close);
	}
	return [...byDay.entries()].sort((a, b) => a[0] - b[0]);
}

const snapshot = {
	generated: new Date().toISOString().slice(0, 10),
	source: "Deribit DVOL daily close (get_volatility_index_data)",
	series: {
		BTC: await fetchSeries("BTC"),
		ETH: await fetchSeries("ETH"),
	},
};

for (const [currency, points] of Object.entries(snapshot.series)) {
	if (points.length < 2) throw new Error(`DVOL ${currency}: series too short`);
	const first = new Date(points[0][0] * 1000).toISOString().slice(0, 10);
	const last = new Date(points[points.length - 1][0] * 1000).toISOString().slice(0, 10);
	console.log(
		`${currency}: ${points.length} points, ${first} to ${last}, last close ${points[points.length - 1][1]}`,
	);
}

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(snapshot);
writeFileSync(OUT, json);
console.log(`wrote ${OUT} (${(json.length / 1024).toFixed(0)} KB)`);
