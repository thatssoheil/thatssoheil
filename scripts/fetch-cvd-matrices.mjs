#!/usr/bin/env node
/**
 * Generates src/data/playground/cvd-matrices.json - the committed matrix
 * table for the color-vision playground piece (the site's palette and a hue
 * spectrum through colorblind eyes).
 *
 * Run from the repo root:  node scripts/fetch-cvd-matrices.mjs
 *
 * Source: the Machado, Oliveira & Fernandes 2009 precomputed simulation
 * matrices, published by the authors alongside the paper (A Physiologically-
 * based Model for Simulation of Color Vision Deficiency, IEEE TVCG
 * 15(6):1291-1298, doi:10.1109/TVCG.2009.113). The table holds 33 matrices:
 * severities 0.0-1.0 step 0.1, one 3x3 per severity for each of protanomaly,
 * deuteranomaly, and tritanomaly. The piece fetches nothing at runtime -
 * this committed table is the whole source - so refresh by re-running this
 * script when desired.
 *
 * The page is static (published 2009; fetched twice byte-identical at the
 * vetting build). The source sha256 is recorded and compared against the
 * pinned value below; a mismatch prints a loud warning (the page changed -
 * review it), while the structural self-checks still gate the output:
 * 33 matrices parsed with 9 values each, row sums 1 within 2e-6 (values are
 * published at 6 decimals; observed worst is exactly one micro-unit off),
 * severity 0.0 exactly the identity, and the published anchors re-run end
 * to end through the same linear-RGB pipeline the page uses (deutan 1.0:
 * red -> #A39000, green -> #EFD63A; protan 1.0 red -> #6D5F00; tritan 1.0
 * green -> #00F7D9; white stays white).
 *
 * The artifact stores the published values as published; the severity
 * interpolation (floor to the 0.1 grid + linear blend) lives in the page's
 * lib module (src/lib/playground/cvd.ts), not here.
 */
import { createHash } from "node:crypto";
import dns from "node:dns";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

dns.setDefaultResultOrder("ipv4first");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/cvd-matrices.json");
const SOURCE_URL = "https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html";
const SOURCE_PIN = "379c549025f91ac05a611631114ff8202fa2d802bc29e15f79479c7985373346";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";
const TYPE_ORDER = ["protan", "deutan", "tritan"];

// --- Fetch.

console.log(`fetching ${SOURCE_URL}`);
const res = await fetch(SOURCE_URL, {
	headers: { accept: "text/html", "user-agent": USER_AGENT },
	signal: AbortSignal.timeout(120000),
});
if (!res.ok) throw new Error(`${SOURCE_URL}: HTTP ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
const sourceSha256 = createHash("sha256").update(buf).digest("hex");
const text = buf.toString("utf8");
console.log(`source: ${buf.length} B, sha256 ${sourceSha256}`);
if (sourceSha256 === SOURCE_PIN) {
	console.log("source sha256 matches the vetting pin");
} else {
	console.warn(`WARNING: sha256 differs from the pin (${SOURCE_PIN}) - the page changed; review before trusting`);
}

// --- Parse: one nested 3x3 table per severity per type, tagged
// bgcolor="#e2ebf6", document order [0.0: P, D, T], [0.1: P, D, T], ...

const chunks = text.split('bgcolor="#e2ebf6"').slice(1);
console.log(`matrix tables found: ${chunks.length} (expect 33)`);
if (chunks.length !== 33) throw new Error(`expected 33 matrix tables, found ${chunks.length}`);

const parsed = {};
chunks.forEach((chunk, i) => {
	const nums = [...chunk.matchAll(/-?\d+\.\d{6}/g)].slice(0, 9).map((m) => Number(m[0]));
	if (nums.length !== 9) throw new Error(`matrix ${i}: captured ${nums.length} numbers, need 9`);
	const sev = Math.floor(i / 3);
	const type = TYPE_ORDER[i % 3];
	parsed[`${type}|${sev}`] = nums;
});

// --- Self-checks. Fail loudly rather than ship a broken table.

let rowSumWorst = 0;
for (const key of Object.keys(parsed)) {
	const m = parsed[key];
	for (let r = 0; r < 3; r += 1) {
		rowSumWorst = Math.max(rowSumWorst, Math.abs(m[r * 3] + m[r * 3 + 1] + m[r * 3 + 2] - 1));
	}
}
// Values are published at 6 decimals, so a row sum can sit one unit of the
// last place off 1 (observed worst: protan|2 row 0 at exactly 1e-6, plus
// float noise); gate at 2e-6.
console.log(`row-sum worst deviation from 1: ${rowSumWorst.toExponential(2)}`);
if (rowSumWorst > 2e-6) throw new Error(`row sums off: ${rowSumWorst}`);

const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];
for (const type of TYPE_ORDER) {
	const m = parsed[`${type}|0`];
	const worst = Math.max(...m.map((v, k) => Math.abs(v - IDENTITY[k])));
	console.log(`severity 0.0 identity, ${type}: worst ${worst.toExponential(2)}`);
	if (worst > 1e-9) throw new Error(`${type} at 0.0 is not the identity`);
}

// --- Behavior anchors: the published model behavior, re-run through the
// same pipeline the page ships (linear RGB, sRGB decode first).

const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linearToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const hexToRgb = (hex) => {
	const n = Number.parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
};
const rgbToHex = (rgb) =>
	`#${rgb.map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
const apply = (m, rgb) => {
	const [r, g, b] = rgb.map(srgbToLinear);
	return [
		m[0] * r + m[1] * g + m[2] * b,
		m[3] * r + m[4] * g + m[5] * b,
		m[6] * r + m[7] * g + m[8] * b,
	].map(linearToSrgb);
};

const anchors = [
	["red deutan 1.0", "#FF0000", "deutan", 10, "#A39000"],
	["green deutan 1.0", "#00FF00", "deutan", 10, "#EFD63A"],
	["red protan 1.0", "#FF0000", "protan", 10, "#6D5F00"],
	["green protan 1.0", "#00FF00", "protan", 10, "#FFE500"],
	["green tritan 1.0", "#00FF00", "tritan", 10, "#00F7D9"],
	["blue deutan 1.0", "#0000FF", "deutan", 10, "#003DFB"],
	["blue tritan 1.0", "#0000FF", "tritan", 10, "#006B96"],
	["white deutan 1.0", "#FFFFFF", "deutan", 10, "#FFFFFF"],
];
for (const [label, hex, type, sev, expected] of anchors) {
	const got = rgbToHex(apply(parsed[`${type}|${sev}`], hexToRgb(hex)));
	console.log(`${label.padEnd(18)} ${hex} -> ${got} (expect ${expected})`);
	if (got !== expected) throw new Error(`anchor failed: ${label} (${got} != ${expected})`);
}

// --- Write the artifact.

const doc = {
	source:
		"Machado, Oliveira & Fernandes 2009, A Physiologically-based Model for Simulation of Color Vision Deficiency, IEEE TVCG 15(6):1291-1298",
	sourceUrl: SOURCE_URL,
	doi: "10.1109/TVCG.2009.113",
	license: "Precomputed matrices published by the authors alongside the paper (citation requested)",
	fetched: new Date().toISOString().slice(0, 10),
	sourceSha256,
	convention: "apply in linear RGB (sRGB decode first); severity = linear blend of adjacent 0.1-step matrices",
	severityStep: 0.1,
	types: {},
};
for (const type of TYPE_ORDER) {
	doc.types[type] = Array.from({ length: 11 }, (_, sev) => parsed[`${type}|${sev}`]);
}

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(doc);
writeFileSync(OUT, json);
const bytes = Buffer.byteLength(json);
const gz = gzipSync(Buffer.from(json), { level: 9 }).length;
console.log(`wrote ${OUT}`);
console.log(`artifact: ${bytes} B raw | ${gz} B gzip-9 (vetting candidate: 3238 B / 1601 B)`);
