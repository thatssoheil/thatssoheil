#!/usr/bin/env node
/**
 * Generates src/data/playground/antipode-places.json - the committed place
 * table for the antipodes playground piece (the other side of the Earth).
 *
 * Run from the repo root:  node scripts/fetch-antipode-places.mjs
 *
 * Source: Natural Earth populated places, 10m simple (public domain), pinned
 * at the file's own last-touch commit 789c9904 (v5.1.2, 2022-05-13). The
 * source is frozen, so this script runs rarely - but it is kept runnable and
 * self-checking, and any drift fails loudly rather than shipping a different
 * table.
 *
 * Shape: array per row [name, country, lat, lon, pop]; coordinates rounded
 * to 3 decimals (about 100 m); dash-like Unicode characters normalized to
 * ASCII hyphens (one source row carries an en dash). pop_max <= 0 is an
 * unknown sentinel (10 rows: 2 x -99 and 8 x 0) - the page reads it as
 * unknown. Self-checks: row count, Iran count, spot rows, and the landmark
 * nearest-place distances the vetting probes measured (Wellington ->
 * Salamanca 51.8 km; Hancheng -> Malargue 1.3 km; Tehran -> Papeete
 * 2,889.5 km).
 */
import { createHash } from "node:crypto";
import dns from "node:dns";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

dns.setDefaultResultOrder("ipv4first");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/antipode-places.json");
const COMMIT = "789c9904087846cc3361302857aa2e76b0ae71ff"; // ne_10m_populated_places_simple last touch, v5.1.2
const SOURCE_URL = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${COMMIT}/geojson/ne_10m_populated_places_simple.geojson`;
const SOURCE_SHA256 = "fd3fa867a320cbd5c5b6bb5bc550afeec2939fb2cef688e508007282a55ac42f";
const LICENSE_URL = "https://www.naturalearthdata.com/about/terms-of-use/";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";
const EXPECTED_COUNT = 7342; // vetting build, 2026-10-10
const EXPECTED_IRAN = 63;
const R_KM = 6371.0088;

// --- Fetch, pinned by sha256 of the raw bytes (fails loudly on drift).

console.log(`fetching ${SOURCE_URL}`);
const res = await fetch(SOURCE_URL, {
	headers: { "user-agent": USER_AGENT },
	signal: AbortSignal.timeout(120000),
});
if (!res.ok) throw new Error(`${SOURCE_URL}: HTTP ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
const sourceSha256 = createHash("sha256").update(buf).digest("hex");
if (sourceSha256 !== SOURCE_SHA256) {
	throw new Error(`source drift: sha256 ${sourceSha256} != pinned ${SOURCE_SHA256}`);
}
console.log(`source ok: ${buf.length} B, sha256 matches the pin`);
const gj = JSON.parse(buf.toString("utf8"));

// --- Rows: [name, country, lat, lon, pop] in source order.

const dashNorm = (s) => s.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
const rows = [];
let dashFixed = 0;
for (const f of gj.features) {
	const p = f.properties;
	const [lon, lat] = f.geometry.coordinates;
	const name = dashNorm(p.name);
	const country = dashNorm(p.adm0name);
	if (name !== p.name || country !== p.adm0name) dashFixed += 1;
	rows.push([name, country, Number(lat.toFixed(3)), Number(lon.toFixed(3)), p.pop_max ?? null]);
}
console.log(`rows: ${rows.length}; dash-normalized: ${dashFixed} rows changed`);

// --- Self-checks. Fail loudly rather than ship a broken table.

if (rows.length !== EXPECTED_COUNT) {
	throw new Error(`row count ${rows.length} != expected ${EXPECTED_COUNT}`);
}
const iran = rows.filter((r) => r[1] === "Iran").length;
if (iran !== EXPECTED_IRAN) throw new Error(`Iran rows ${iran} != expected ${EXPECTED_IRAN}`);

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const tehran = rows.find((r) => r[0] === "Tehran");
if (!tehran || !deepEqual(tehran, ["Tehran", "Iran", 35.674, 51.422, 7873000])) {
	throw new Error(`Tehran row unexpected: ${JSON.stringify(tehran)}`);
}
for (const [name, expected] of [
	["Wellington", ["Wellington", "New Zealand", -41.292, 174.777, 393400]],
	["Hancheng", ["Hancheng", "China", 35.47, 110.43, 222135]],
]) {
	const row = rows.find((r) => r[0] === name);
	if (!row || !deepEqual(row, expected)) throw new Error(`${name} row unexpected: ${JSON.stringify(row)}`);
}

const badPop = rows.filter((r) => r[4] !== null && r[4] <= 0).length;
const nullPop = rows.filter((r) => r[4] === null).length;
if (badPop !== 10 || nullPop !== 0) {
	throw new Error(`pop sentinels changed: <=0 ${badPop} (expected 10), null ${nullPop} (expected 0)`);
}

// --- The sphere math (mirrors the page's lib module).

function toVec(lat, lon) {
	const a = (lat * Math.PI) / 180;
	const o = (lon * Math.PI) / 180;
	return [Math.cos(a) * Math.cos(o), Math.cos(a) * Math.sin(o), Math.sin(a)];
}

function centralAngle(a, b) {
	const cx = a[1] * b[2] - a[2] * b[1];
	const cy = a[2] * b[0] - a[0] * b[2];
	const cz = a[0] * b[1] - a[1] * b[0];
	return Math.atan2(Math.hypot(cx, cy, cz), a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
}

const norm180 = (l) => ((l + 540) % 360) - 180;
const antipode = (lat, lon) => [-lat, norm180(lon + 180)];
const distKm = (a, b) => centralAngle(toVec(a[0], a[1]), toVec(b[0], b[1])) * R_KM;
const normName = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

let worstRt = 0;
let worstD = 0;
for (let k = 0; k < 2000; k += 1) {
	const lat = Math.random() * 180 - 90;
	const lon = Math.random() * 360 - 180;
	const [a1, o1] = antipode(lat, lon);
	const [a2, o2] = antipode(a1, o1);
	worstRt = Math.max(worstRt, Math.abs(a2 - lat), Math.abs(norm180(o2 - lon)));
	worstD = Math.max(worstD, Math.abs(distKm([lat, lon], [a1, o1]) - Math.PI * R_KM));
}
console.log(`roundtrip over 2000 random points: worst delta ${worstRt} deg`);
console.log(`distance to antipode vs pi*R: worst |delta| ${(worstD * 1000).toFixed(3)} m`);
if (worstRt > 1e-9 || worstD > 1e-6) throw new Error("antipode self-check failed");

const LANDMARKS = [
	{ from: ["Wellington", "New Zealand"], nearest: ["Salamanca", "Spain"], km: 51.8 },
	{ from: ["Hancheng", "China"], nearest: ["Malargue", "Argentina"], km: 1.3 },
	{ from: ["Malargue", "Argentina"], nearest: ["Hancheng", "China"], km: 1.3 },
	{ from: ["Tehran", "Iran"], nearest: ["Papeete", "French Polynesia"], km: 2889.5 },
];
for (const { from, nearest, km } of LANDMARKS) {
	const a = rows.find((r) => normName(r[0]) === normName(from[0]) && normName(r[1]) === normName(from[1]));
	if (!a) throw new Error(`landmark missing: ${from[0]}`);
	const [alat, alon] = antipode(a[2], a[3]);
	let best = null;
	let bestKm = Infinity;
	for (const r of rows) {
		const d = distKm([alat, alon], [r[2], r[3]]);
		if (d < bestKm) {
			bestKm = d;
			best = r;
		}
	}
	const delta = Math.abs(bestKm - km);
	console.log(`${from[0]} -> nearest ${best[0]} (${best[1]}) ${bestKm.toFixed(1)} km (expected ${km}; delta ${delta.toFixed(2)})`);
	if (delta > 0.2) throw new Error(`${from[0]} nearest-place check failed`);
	if (normName(best[0]) !== normName(nearest[0]) || normName(best[1]) !== normName(nearest[1])) {
		throw new Error(`${from[0]} nearest place unexpected: ${best[0]} (${best[1]})`);
	}
}

// --- Write the artifact (array per row: [name, country, lat, lon, pop]).

const fetched = `${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`;
const doc = {
	source: "Natural Earth populated places, 10m simple (v5.1.2)",
	sourceUrl: SOURCE_URL,
	license: "Public domain",
	licenseUrl: LICENSE_URL,
	fetched,
	sourceSha256: SOURCE_SHA256,
	fields: ["name", "country", "lat", "lon", "pop"],
	count: rows.length,
	places: rows,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(doc);
writeFileSync(OUT, json);
const bytes = Buffer.byteLength(json);
const gz = gzipSync(Buffer.from(json), { level: 9 }).length;
console.log(`wrote ${OUT}`);
console.log(`artifact: ${bytes} B raw | ${gz} B gzip-9 (bare rows at vetting: 332059 / 131659)`);
