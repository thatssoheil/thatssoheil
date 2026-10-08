#!/usr/bin/env node
/**
 * Generates src/data/playground/free-shelf-fallback.json - the committed
 * fallback the Playground free shelf page renders when the Project Gutenberg
 * chart page is unreachable.
 *
 * Run from the repo root:  node scripts/fetch-free-shelf-snapshot.mjs
 *
 * Source: https://www.gutenberg.org/browse/scores/top (keyless; the catalog
 * data is public domain). The chart refreshes about once a day; the page
 * runtime reads it at most once per hour. The parse here mirrors
 * src/lib/playground/free-shelf-parse.ts, including the entity decode and the
 * dash normalization (PG titles carry em dashes; the site uses ASCII hyphens).
 *
 * Note (2026-10-08): PG's Apache negotiates by Accept header. Browsers
 * (Accept: text/html) get the static, daily-regenerated top.html; clients
 * sending Accept: * / * get a legacy top.php variant with a broken stats
 * table and different counts. This script and the page runtime both send
 * Accept: text/html to read the same page visitors see. The last-modified
 * header of top.html is kept as the chart's own generation time.
 */
import { createHash } from "node:crypto";
import dns from "node:dns";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

dns.setDefaultResultOrder("ipv4first");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/free-shelf-fallback.json");
const CHART_URL = "https://www.gutenberg.org/browse/scores/top";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";
const WINDOW_KEYS = ["last1", "last7", "last30"];
const PER_WINDOW = 30;
const MIN_PER_WINDOW = 20;

function codePoint(n) {
	if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) return "";
	try {
		return String.fromCodePoint(n);
	} catch {
		return "";
	}
}

/** Decode the entities the chart page carries; normalize dashes to ASCII. */
function decodeEntities(input) {
	return input
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/&#(\d+);/g, (_, d) => codePoint(Number(d)))
		.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => codePoint(parseInt(h, 16)))
		.replace(/[\u2013\u2014]/g, "-")
		.replace(/\s+/g, " ")
		.trim();
}

/** Parse the three chart sections; throws when a section is unreadable. */
function parseSections(html) {
	const sections = {};
	for (const key of WINDOW_KEYS) {
		const start = html.indexOf(`<h2 id="books-${key}">`);
		const olStart = start < 0 ? -1 : html.indexOf("<ol>", start);
		const olEnd = olStart < 0 ? -1 : html.indexOf("</ol>", olStart);
		if (start < 0 || olStart < 0 || olEnd < 0) {
			throw new Error(`chart page: section ${key} not found`);
		}
		const chunk = html.slice(olStart, olEnd);
		const items = [];
		const re = /<li><a href="\/ebooks\/(\d+)">(.+?)<\/a><\/li>/g;
		let m;
		while ((m = re.exec(chunk))) {
			const id = Number(m[1]);
			const label = decodeEntities(m[2]);
			const mCount = / \((\d+)\)$/.exec(label);
			const downloads = mCount ? Number(mCount[1]) : null;
			const core = mCount ? label.slice(0, mCount.index) : label;
			const mBy = /^(.*?) by (.+)$/.exec(core);
			const title = mBy ? mBy[1] : core;
			const author = mBy ? mBy[2] : null;
			if (!Number.isInteger(id) || id <= 0) continue;
			if (title === "" || downloads === null || !Number.isInteger(downloads) || downloads < 0) {
				continue;
			}
			items.push({ id, title, author, downloads });
		}
		if (items.length < MIN_PER_WINDOW) {
			throw new Error(`chart page: section ${key} parsed ${items.length} usable items`);
		}
		sections[key] = items;
	}
	return sections;
}

const res = await fetch(CHART_URL, {
	headers: { accept: "text/html", "user-agent": USER_AGENT },
	signal: AbortSignal.timeout(60_000),
});
if (!res.ok) throw new Error(`${CHART_URL}: HTTP ${res.status}`);
const buf = Buffer.from(await res.arrayBuffer());
const sha = createHash("sha256").update(buf).digest("hex");
const lastModified = res.headers.get("last-modified");
const chartModified = lastModified ? new Date(lastModified).toISOString() : null;
const sections = parseSections(buf.toString("utf8"));

for (const key of WINDOW_KEYS) {
	for (const item of sections[key]) {
		if (/[\u2013\u2014]/.test(item.title) || /[\u2013\u2014]/.test(item.author ?? "")) {
			throw new Error(`chart page: dashes survived normalization in ${key} item ${item.id}`);
		}
	}
}

const snapshot = {
	source: CHART_URL,
	sourceSha256: sha,
	fetched: new Date().toISOString(),
	chartModified,
	note: "Top items of Project Gutenberg's most-downloaded chart. Downloads are PG's own counters (repeat downloads from one address on one day count once; traffic above 100 downloads/day per address is excluded as robot traffic).",
	windows: Object.fromEntries(
		WINDOW_KEYS.map((key) => [key, sections[key].slice(0, PER_WINDOW)]),
	),
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(snapshot);
writeFileSync(OUT, json);

const counts = WINDOW_KEYS.map((key) => `${key}:${sections[key].length}->${snapshot.windows[key].length}`);
console.log(`wrote ${OUT}`);
console.log(`  ${json.length} bytes | source sha256 ${sha.slice(0, 16)}... | chart modified ${chartModified ?? "unknown"}`);
console.log(`  ${counts.join(" ")}`);
console.log(`  top of last1: ${snapshot.windows.last1[0].title} (${snapshot.windows.last1[0].downloads})`);
