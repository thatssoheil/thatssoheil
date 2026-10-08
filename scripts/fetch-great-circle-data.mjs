#!/usr/bin/env node
/**
 * Generates src/data/playground/great-circle-airports.json - the committed
 * airport table for the great-circle playground piece (the shortest path
 * between two points on a sphere; why flights curve on a map).
 *
 * Run from the repo root:  node scripts/fetch-great-circle-data.mjs
 *
 * Source: OurAirports airports.csv (public domain, keyless, regenerated
 * daily). The piece fetches nothing at runtime - this committed subset is
 * the whole source - so refresh by re-running this script when desired.
 * Filter: scheduled service + a 3-letter IATA code (4,133 rows as of the
 * vetting build, 2026-10-09).
 *
 * The CSV changes daily, so its sha256 is recorded in the output header as
 * a record of what was consumed, not pinned. The subset's shape is what is
 * checked instead: row count, unique IATA codes, coordinate ranges, two
 * published distances recomputed from the trimmed coordinates (JFK-LHR,
 * SYD-LAX), and the farthest scheduled pair.
 *
 * Coordinates ship at 3 decimals; the vetting probes measured the rounding
 * cost at at most about 133 m on distances - below display precision.
 * The header carries source, license, fetch stamp, and the subset's own
 * count + farthest pair so the page never hardcodes them.
 */
import { createHash } from "node:crypto";
import dns from "node:dns";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

dns.setDefaultResultOrder("ipv4first");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/great-circle-airports.json");
const SOURCE_URL = "https://davidmegginson.github.io/ourairports-data/airports.csv";
const LICENSE_URL = "https://ourairports.com/data/";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";
const EXPECTED_COUNT = 4133; // vetting build, 2026-10-09; range-checked below
const R_KM = 6371.0088; // spherical convention, labeled on the page

// --- RFC 4180 CSV parsing (enough for this file; quoted fields, "" escapes).

function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = "";
	let inQuotes = false;
	for (let i = 0; i < text.length; i += 1) {
		const ch = text[i];
		if (inQuotes) {
			if (ch === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i += 1;
				} else {
					inQuotes = false;
				}
			} else {
				field += ch;
			}
		} else if (ch === '"') {
			inQuotes = true;
		} else if (ch === ",") {
			row.push(field);
			field = "";
		} else if (ch === "\n") {
			row.push(field);
			rows.push(row);
			row = [];
			field = "";
		} else if (ch !== "\r") {
			field += ch;
		}
	}
	if (field.length > 0 || row.length > 0) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

// --- The sphere math the self-checks use (mirrors the page's lib module).

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

const distKm = (a, b) => centralAngle(toVec(a.lat, a.lon), toVec(b.lat, b.lon)) * R_KM;

// --- Fetch.

console.log(`fetching ${SOURCE_URL}`);
const res = await fetch(SOURCE_URL, {
	headers: { accept: "text/csv", "user-agent": USER_AGENT },
	signal: AbortSignal.timeout(120000),
});
if (!res.ok) throw new Error(`${SOURCE_URL}: HTTP ${res.status}`);
const text = await res.text();
const sourceSha256 = createHash("sha256").update(text).digest("hex");
const sourceLastModified = res.headers.get("last-modified") ?? "";
console.log(`source: ${text.length} B, sha256 ${sourceSha256}, last-modified ${sourceLastModified || "n/a"}`);

// --- Filter to scheduled-service airports with a 3-letter IATA code.

const table = parseCsv(text);
const header = table[0].map((h) => h.trim());
const col = (name) => {
	const i = header.indexOf(name);
	if (i === -1) throw new Error(`column missing: ${name}`);
	return i;
};
const cIata = col("iata_code");
const cName = col("name");
const cCity = col("municipality");
const cCc = col("iso_country");
const cLat = col("latitude_deg");
const cLon = col("longitude_deg");
const cSched = col("scheduled_service");

const rows = [];
for (const r of table.slice(1)) {
	if (r.length !== header.length) continue; // tolerate a trailing blank line
	if (r[cSched] !== "yes") continue;
	const iata = (r[cIata] ?? "").trim();
	if (!/^[A-Za-z]{3}$/.test(iata)) continue;
	rows.push({
		iata,
		name: (r[cName] ?? "").trim(),
		city: (r[cCity] ?? "").trim(),
		cc: (r[cCc] ?? "").trim(),
		lat: Number.parseFloat(r[cLat]),
		lon: Number.parseFloat(r[cLon]),
	});
}
console.log(`subset rows: ${rows.length} (vetting build: ${EXPECTED_COUNT})`);

// --- Self-checks. Fail loudly rather than ship a broken subset.

if (rows.length < 4000 || rows.length > 4300) {
	throw new Error(`row count out of range: ${rows.length}`);
}
if (rows.length !== EXPECTED_COUNT) {
	console.log(`note: count differs from the vetting build (${EXPECTED_COUNT}); the source regenerates daily`);
}

const seen = new Set();
for (const r of rows) {
	if (seen.has(r.iata)) throw new Error(`duplicate IATA code: ${r.iata}`);
	seen.add(r.iata);
	if (!Number.isFinite(r.lat) || !Number.isFinite(r.lon)) {
		throw new Error(`bad coordinates: ${r.iata}`);
	}
	if (r.lat < -90 || r.lat > 90 || r.lon < -180 || r.lon > 180) {
		throw new Error(`coordinates out of range: ${r.iata} ${r.lat},${r.lon}`);
	}
}

const byIata = new Map(rows.map((r) => [r.iata, r]));
for (const code of ["IKA", "THR", "JFK", "LHR", "SYD", "LAX"]) {
	if (!byIata.has(code)) throw new Error(`spot airport missing: ${code}`);
}

// Round to the ship precision (3 decimals) before the number checks, so the
// checks describe exactly what the artifact carries. toFixed rounds the
// parsed double to nearest (the same result Python's round gives, which the
// vetting build used) - verified on all 8,266 coordinates against the
// vetting artifact.
for (const r of rows) {
	r.lat = Number(r.lat.toFixed(3));
	r.lon = Number(r.lon.toFixed(3));
}

const checks = [
	["JFK", "LHR", 5540],
	["SYD", "LAX", 12061],
];
for (const [a, b, published] of checks) {
	const km = distKm(byIata.get(a), byIata.get(b));
	const delta = Math.abs(km - published);
	console.log(`${a}-${b}: ${km.toFixed(1)} km (published ${published}; delta ${delta.toFixed(3)})`);
	if (delta > 0.5) throw new Error(`${a}-${b} distance off by ${delta.toFixed(3)} km`);
}

// The farthest scheduled pair (the page's garnish fact) - brute force.
const vecs = rows.map((r) => toVec(r.lat, r.lon));
let bestAngle = 0;
let bestPair = null;
for (let i = 0; i < rows.length; i += 1) {
	for (let j = i + 1; j < rows.length; j += 1) {
		const a = centralAngle(vecs[i], vecs[j]);
		if (a > bestAngle) {
			bestAngle = a;
			bestPair = [rows[i], rows[j]];
		}
	}
}
const farthestKm = Math.round(bestAngle * R_KM);
console.log(`farthest pair: ${bestPair[0].iata}-${bestPair[1].iata} ${farthestKm} km`);
if (farthestKm < 19900) throw new Error(`farthest pair suspiciously short: ${farthestKm} km`);

// --- Write the artifact (array per row: [iata, name, city, cc, lat, lon]).

rows.sort((a, b) => (a.iata < b.iata ? -1 : a.iata > b.iata ? 1 : 0));
const airports = rows.map((r) => [r.iata, r.name, r.city, r.cc, r.lat, r.lon]);

const fetched = `${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`;
const doc = {
	source: "OurAirports airports.csv (scheduled service + 3-letter IATA subset)",
	sourceUrl: SOURCE_URL,
	license: "Public domain",
	licenseUrl: LICENSE_URL,
	fetched,
	sourceSha256,
	sourceLastModified,
	fields: ["iata", "name", "city", "cc", "lat", "lon"],
	count: rows.length,
	farthestPair: { a: bestPair[0].iata, b: bestPair[1].iata, km: farthestKm },
	airports,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(doc);
writeFileSync(OUT, json);
const bytes = Buffer.byteLength(json);
const gz = gzipSync(Buffer.from(json), { level: 9 }).length;
console.log(`wrote ${OUT}`);
console.log(`artifact: ${bytes} B raw | ${gz} B gzip-9 (vetting build: 282680 B / 110059 B)`);
