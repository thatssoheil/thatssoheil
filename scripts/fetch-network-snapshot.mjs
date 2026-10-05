#!/usr/bin/env node
/**
 * Generates src/data/playground/network-fallback.json - the committed
 * fallback the Playground Bitcoin network pulse page renders when the live
 * mempool.space API is unreachable.
 *
 * Run from the repo root:  node scripts/fetch-network-snapshot.mjs
 *
 * Source: https://mempool.space/api (keyless, public). Payloads are trimmed to
 * the fields the page uses; the fee histogram and the recent blocks are kept
 * whole enough to render every section from the snapshot.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/network-fallback.json");
const API = "https://mempool.space/api";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

async function get(path) {
	const res = await fetch(`${API}${path}`, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
	});
	if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
	return res.json();
}

const [fees, mempool, difficulty, blocks, prices] = await Promise.all([
	get("/v1/fees/recommended"),
	get("/mempool"),
	get("/v1/difficulty-adjustment"),
	get("/v1/blocks"),
	get("/v1/prices"),
]);

const trimmedBlocks = (Array.isArray(blocks) ? blocks : []).slice(0, 12).map((block) => ({
	height: Number(block?.height),
	timestamp: Number(block?.timestamp),
	tx_count: Number(block?.tx_count),
	size: Number(block?.size),
}));

const raw = {
	generated: new Date().toISOString(),
	source: "https://mempool.space",
	fees,
	mempool: {
		count: mempool?.count,
		vsize: mempool?.vsize,
		total_fee: mempool?.total_fee,
		fee_histogram: mempool?.fee_histogram,
	},
	difficulty,
	blocks: trimmedBlocks,
	price_usd: prices?.USD,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(raw);
writeFileSync(OUT, json);

const histogramTotal = (mempool?.fee_histogram ?? []).reduce(
	(sum, [, vsize]) => sum + (Number(vsize) > 0 ? Number(vsize) : 0),
	0,
);
console.log(
	`wrote ${OUT} (${(json.length / 1024).toFixed(0)} KB; tip ${trimmedBlocks[0]?.height}; ` +
		`fees ${fees?.fastestFee}-${fees?.minimumFee} sat/vB; mempool ${mempool?.count} txs; ` +
		`histogram total ${(histogramTotal / 1e6).toFixed(1)} MvB vs mempool ${(Number(mempool?.vsize) / 1e6).toFixed(1)} MvB)`,
);
