#!/usr/bin/env node
/**
 * Generates src/data/playground/sugar-cubes-fallback.json - the committed
 * curated set the Playground sugar-cubes page serves when Open Food Facts
 * cannot be reached.
 *
 * Run from the repo root:  node scripts/fetch-sugar-snapshot.mjs
 *
 * Source: Open Food Facts (keyless, ODbL) - world.openfoodfacts.org. The
 * curated list below is pinned (query + resolved barcode); each item is read
 * by its code, the reliable path - the free-text search endpoint 503s in
 * waves under load (vetting, 2026-10-08) while product reads stayed green.
 * On a failed read the item keeps its previous committed values; a brand-new
 * item that cannot be read aborts the run.
 */
import dns from "node:dns";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

dns.setDefaultResultOrder("ipv4first");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/sugar-cubes-fallback.json");
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";
const FIELDS = "code,product_name,brands,quantity,serving_size,nutriments";
const RETRY_DELAYS_MS = [15_000, 30_000];

/** Pinned curated list: query + resolved barcode (resolution evidence in the
 * lab's vetting probes, 2026-10-08). The page's chips draw from these. */
const CURATED = [
	["coca-cola", "5449000054227"],
	["sprite", "5449000015105"],
	["fanta", "5449000132277"],
	["red bull", "9002490100070"],
	["nutella", "3017620422003"],
	["oreo", "7622300336738"],
	["kit kat", "3033710019526"],
	["snickers", "5900951311505"],
	["frosted flakes", "20003197"],
	["activia", "6111032002208"],
	["ben & jerry's", "8711327374515"],
	["coca-cola zero", "5449000133328"],
	["haribo", "3103220035214"],
	["heinz tomato ketchup", "8715700407760"],
	["m&m's", "5000159492737"],
	["milka", "7622210100917"],
	["pepsi", "6111252420059"],
	["skippy peanut butter", "0037600110754"],
	["tropicana orange juice", "5022313729824"],
	["monster energy", "5060335632302"],
];

function round1(value) {
	return Math.round(Number((value * 10).toFixed(6))) / 10;
}

function num(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() !== "") {
		const n = Number(value);
		return Number.isFinite(n) ? n : null;
	}
	return null;
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchProduct(code) {
	const url = `${PRODUCT_URL}/${code}.json?fields=${FIELDS}`;
	const res = await fetch(url, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
		signal: AbortSignal.timeout(30_000),
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const payload = await res.json();
	if (payload?.status !== 1 || typeof payload.product !== "object" || payload.product === null) {
		throw new Error(`status ${payload?.status ?? "unknown"}`);
	}
	return payload.product;
}

function toEntry(query, code, product) {
	const n = product.nutriments ?? {};
	const sugars100g = num(n.sugars_100g);
	const sugarsServing = num(n.sugars_serving);
	return {
		query,
		code: String(product.code ?? code),
		name: String(product.product_name ?? "").replace(/\s+/g, " ").trim(),
		brands: String(product.brands ?? "").replace(/\s+/g, " ").trim(),
		quantity: String(product.quantity ?? "").replace(/\s+/g, " ").trim(),
		servingSize:
			typeof product.serving_size === "string" && product.serving_size.trim() !== ""
				? product.serving_size.replace(/\s+/g, " ").trim()
				: null,
		sugars100g: sugars100g === null ? null : round1(sugars100g),
		sugarsServing: sugarsServing === null ? null : round1(sugarsServing),
	};
}

function isUsable(entry) {
	return entry.code !== "" && entry.name !== "" && typeof entry.sugars100g === "number";
}

let previous = new Map();
try {
	const prev = JSON.parse(readFileSync(OUT, "utf8"));
	for (const item of prev.products ?? []) previous.set(item.query, item);
} catch {
	// first generation; nothing to keep
}

const products = [];
let kept = 0;

for (const [query, code] of CURATED) {
	let entry = null;
	let lastError = null;
	for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
		if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);
		try {
			const product = await fetchProduct(code);
			entry = toEntry(query, code, product);
			if (!isUsable(entry)) throw new Error("unusable read (name or sugars missing)");
			break;
		} catch (error) {
			lastError = error;
			entry = null;
		}
	}
	if (entry) {
		products.push(entry);
		console.log(`ok: ${query} (${code}) -> ${entry.sugars100g} g/100 g`);
	} else {
		const prev = previous.get(query);
		if (prev) {
			products.push(prev);
			kept += 1;
			console.log(`kept previous: ${query} (${code}) - ${lastError}`);
		} else {
			throw new Error(`${query} (${code}): no read and no previous entry (${lastError})`);
		}
	}
	await sleep(250);
}

const snapshot = {
	generatedAt: new Date().toISOString(),
	source: "Open Food Facts (ODbL) - world.openfoodfacts.org",
	note: "Curated fallback set for /playground/sugar-cubes - one entry per curated query; refresh with node scripts/fetch-sugar-snapshot.mjs.",
	products,
};

const json = JSON.stringify(snapshot);
writeFileSync(OUT, json);
console.log(`wrote ${OUT}`);
console.log(`  ${json.length} bytes | ${products.length} items | kept previous: ${kept}`);
for (const [query, expected] of Object.entries({ "coca-cola": 10.6, nutella: 56.3, "coca-cola zero": 0 })) {
	const item = products.find((p) => p.query === query);
	console.log(`  anchor ${query}: ${item ? item.sugars100g : "MISSING"} (expected ${expected})`);
}
