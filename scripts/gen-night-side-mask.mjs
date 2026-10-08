#!/usr/bin/env node
// Regenerates src/data/playground/night-side-mask.json - the committed land
// dot mask for the night-side map. The mask is a 1.5-degree grid (240x120
// cells) with one bit per cell, LSB-first within each byte, row-major from
// the north pole. Generated once from Natural Earth's 110m land layer
// (public domain); the source is frozen (last touched 2020), so this script
// runs rarely - but it is kept runnable and self-checking so the artifact is
// reproducible from scratch.
//
// Run from the repo root:  node scripts/gen-night-side-mask.mjs
//
// The fetch is pinned by commit AND by sha256 of the file bytes; any drift
// fails loudly rather than shipping a different mask.

import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const COMMIT = "693f11422f4e08d2da4566b854dda53eb7c39fb3"; // "v4.1.0 geojsons", 2020-12-13
const SOURCE = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${COMMIT}/geojson/ne_110m_land.geojson`;
const SOURCE_SHA256 = "9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9";
const STEP = 1.5;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "playground", "night-side-mask.json");

const res = await fetch(SOURCE, { signal: AbortSignal.timeout(60000) });
if (!res.ok) throw new Error(`fetch failed: HTTP ${res.status}`);
const text = await res.text();
const sha = createHash("sha256").update(text).digest("hex");
if (sha !== SOURCE_SHA256) {
	throw new Error(`source drift: sha256 ${sha} != pinned ${SOURCE_SHA256}`);
}
console.log(`source ok: ${text.length} bytes, sha256 matches the pin`);
const gj = JSON.parse(text);

// Polygon rings with bounding boxes, for point-in-polygon rasterization.
const polys = [];
for (const f of gj.features) {
	const g = f.geometry;
	const addPoly = (rings) => {
		const bb = [Infinity, Infinity, -Infinity, -Infinity];
		for (const ring of rings)
			for (const [x, y] of ring) {
				if (x < bb[0]) bb[0] = x;
				if (x > bb[2]) bb[2] = x;
				if (y < bb[1]) bb[1] = y;
				if (y > bb[3]) bb[3] = y;
			}
		polys.push({ rings, bb });
	};
	if (g.type === "Polygon") addPoly(g.coordinates);
	else if (g.type === "MultiPolygon") for (const p of g.coordinates) addPoly(p);
}

function inRing(x, y, ring) {
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const xi = ring[i][0],
			yi = ring[i][1],
			xj = ring[j][0],
			yj = ring[j][1];
		if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
	}
	return inside;
}

function isLand(lon, lat) {
	for (const p of polys) {
		const bb = p.bb;
		if (lon < bb[0] || lon > bb[2] || lat < bb[1] || lat > bb[3]) continue;
		if (!inRing(lon, lat, p.rings[0])) continue;
		let hole = false;
		for (let k = 1; k < p.rings.length; k++)
			if (inRing(lon, lat, p.rings[k])) {
				hole = true;
				break;
			}
		if (!hole) return true;
	}
	return false;
}

const cols = Math.round(360 / STEP);
const rows = Math.round(180 / STEP);
let land = 0;
let areaLand = 0;
let areaAll = 0;
const bits = new Uint8Array(Math.ceil((rows * cols) / 8));
for (let j = 0; j < rows; j++) {
	const lat = 90 - (j + 0.5) * STEP;
	const w = Math.cos((lat * Math.PI) / 180);
	for (let i = 0; i < cols; i++) {
		const lon = -180 + (i + 0.5) * STEP;
		areaAll += w;
		if (isLand(lon, lat)) {
			land++;
			areaLand += w;
			const bit = j * cols + i;
			bits[bit >> 3] |= 1 << (bit & 7);
		}
	}
}

// Self-checks: known points, cell count, area-weighted land fraction. The
// values below are the vetting-time measurements (2026-10-08); a mismatch
// means the source or the rasterizer changed.
const known = [
	["Tehran", 35.6892, 51.389],
	["London", 51.5074, -0.1278],
	["Sydney", -33.8688, 151.2093],
	["Sahara", 25, 15],
	["Amazon interior", -5, -60],
	["Antarctica interior", -80, 0],
];
const knownOcean = [
	["mid-Pacific", 0, -140],
	["Atlantic", 30, -40],
	["Indian Ocean", -20, 80],
	["Arctic ocean", 85, 0],
];
const cellAt = (lat, lon) => {
	const j = Math.min(rows - 1, Math.max(0, Math.floor((90 - lat) / STEP)));
	const i = Math.min(cols - 1, Math.max(0, Math.floor((lon + 180) / STEP)));
	const bit = j * cols + i;
	return (bits[bit >> 3] >> (bit & 7)) & 1;
};
let fails = 0;
for (const [name, lat, lon] of known)
	if (!cellAt(lat, lon)) {
		console.error(`FAIL known point: ${name}`);
		fails++;
	}
for (const [name, lat, lon] of knownOcean)
	if (cellAt(lat, lon)) {
		console.error(`FAIL known ocean: ${name}`);
		fails++;
	}
const areaFrac = areaLand / areaAll;
console.log(`cells: ${cols}x${rows}, land ${land} (${((land / (rows * cols)) * 100).toFixed(1)}% by count), area-weighted ${(areaFrac * 100).toFixed(1)}% (Earth: 29.2%)`);
if (land !== 9527) {
	console.error(`FAIL land count ${land} != 9527`);
	fails++;
}
if (Math.abs(areaFrac - 0.289) > 0.005) {
	console.error(`FAIL area fraction ${areaFrac.toFixed(4)} far from 0.289`);
	fails++;
}
if (fails) throw new Error(`${fails} self-check(s) failed - not writing the artifact`);

const b64 = Buffer.from(bits).toString("base64");
const doc = {
	step: STEP,
	cols,
	rows,
	bits: b64,
	source: SOURCE,
	sourceSha256: SOURCE_SHA256,
	generated: new Date().toISOString().slice(0, 10),
};
writeFileSync(OUT, JSON.stringify(doc) + "\n");
console.log(`wrote ${OUT} (${b64.length} b64 chars, ${JSON.stringify(doc).length} bytes)`);
