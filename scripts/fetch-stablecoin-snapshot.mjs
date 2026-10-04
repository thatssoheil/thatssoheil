#!/usr/bin/env node
/**
 * Generates src/data/playground/stablecoin-fallback.json - the committed
 * fallback the Playground stablecoin float page renders when the live
 * DefiLlama feed is unreachable.
 *
 * Run from the repo root:  node scripts/fetch-stablecoin-snapshot.mjs
 *
 * Source: https://stablecoins.llama.fi/stablecoincharts/all (keyless, public).
 * The payload is stripped to [unix_seconds, usd] pairs - every daily reading
 * since November 2017 - so the committed JSON stays small (about 81 KB).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/stablecoin-fallback.json");
const ENDPOINT = "https://stablecoins.llama.fi/stablecoincharts/all";

const res = await fetch(ENDPOINT, { headers: { accept: "application/json" } });
if (!res.ok) throw new Error(`stablecoincharts/all: HTTP ${res.status}`);
const payload = await res.json();
if (!Array.isArray(payload)) throw new Error("stablecoincharts/all: unexpected payload shape");

const points = payload
	.map((row) => [Number(row?.date), Number(row?.totalCirculatingUSD?.peggedUSD)])
	.filter(([ts, usd]) => Number.isFinite(ts) && Number.isFinite(usd) && usd > 0)
	.sort((a, b) => a[0] - b[0]);

const raw = {
	asOf: new Date().toISOString(),
	source: ENDPOINT,
	points,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(raw);
writeFileSync(OUT, json);
const last = points[points.length - 1];
console.log(
	`wrote ${OUT} (${(json.length / 1024).toFixed(0)} KB, ${points.length} points, last ${new Date(
		last[0] * 1000,
	)
		.toISOString()
		.slice(0, 10)} = $${last[1]})`,
);
