#!/usr/bin/env node
/**
 * Generates src/data/playground/hafez-fallback.json - the committed set of
 * ghazals the Playground Hafez fal page draws from when Ganjoor's fal
 * endpoint is unreachable (server-side or in the visitor's browser).
 *
 * Run from the repo root:  node scripts/fetch-hafez-snapshot.mjs [target]
 *
 * Source: https://api.ganjoor.net/api/ganjoor/hafez/faal (keyless, public).
 * The fal draw is random, so this loops until `target` unique ghazals are
 * collected. The payload is trimmed to the fields the page uses: id, title,
 * fullTitle, fullUrl, and the hemistich pairs (versePosition, coupletIndex,
 * text). Text is kept exactly as served (ZWNJ and diacritics included).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/hafez-fallback.json");
const FAAL_URL = "https://api.ganjoor.net/api/ganjoor/hafez/faal";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";
const TARGET = Number(process.argv[2] ?? 48);
const MAX_DRAWS = Math.max(TARGET * 4, 120);
const SLEEP_MS = 350;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Validate one fal payload and trim it to the render shape. */
function trimGhazal(raw) {
	const record = raw ?? {};
	if (typeof record.id !== "number" || !Number.isFinite(record.id)) {
		throw new Error("fal payload: id missing");
	}
	if (
		typeof record.title !== "string" ||
		record.title === "" ||
		typeof record.fullTitle !== "string" ||
		record.fullTitle === "" ||
		typeof record.fullUrl !== "string" ||
		!record.fullUrl.startsWith("/hafez/ghazal/")
	) {
		throw new Error("fal payload: title fields missing");
	}
	if (!Array.isArray(record.verses) || record.verses.length === 0) {
		throw new Error("fal payload: verses missing");
	}
	const verses = record.verses.map((entry) => {
		const verse = entry ?? {};
		if (verse.versePosition !== 0 && verse.versePosition !== 1) {
			throw new Error("fal payload: verse position missing");
		}
		if (typeof verse.coupletIndex !== "number" || !Number.isFinite(verse.coupletIndex)) {
			throw new Error("fal payload: couplet index missing");
		}
		if (typeof verse.text !== "string" || verse.text === "") {
			throw new Error("fal payload: verse text missing");
		}
		return { versePosition: verse.versePosition, coupletIndex: verse.coupletIndex, text: verse.text };
	});
	return {
		id: record.id,
		title: record.title,
		fullTitle: record.fullTitle,
		fullUrl: record.fullUrl,
		verses,
	};
}

const seen = new Map();
let draws = 0;
while (seen.size < TARGET && draws < MAX_DRAWS) {
	draws += 1;
	const res = await fetch(FAAL_URL, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
	});
	if (!res.ok) throw new Error(`${FAAL_URL}: HTTP ${res.status}`);
	const ghazal = trimGhazal(await res.json());
	if (seen.has(ghazal.id)) {
		console.log(`draw ${draws}: repeat ${ghazal.id} (${seen.size} unique)`);
	} else {
		seen.set(ghazal.id, ghazal);
		console.log(
			`draw ${draws}: new ${ghazal.id} ${ghazal.fullUrl} (${ghazal.verses.length} hemistichs; ${seen.size} unique)`,
		);
	}
	if (seen.size < TARGET) await sleep(SLEEP_MS);
}

if (seen.size < TARGET) {
	throw new Error(`fal: only ${seen.size} unique ghazals in ${draws} draws (cap ${MAX_DRAWS})`);
}

const ghazals = [...seen.values()].sort((a, b) => a.id - b.id);
const payload = {
	generatedAt: new Date().toISOString(),
	source: FAAL_URL,
	attribution: "Text from Ganjoor (ganjoor.net)",
	ghazals,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(payload);
writeFileSync(OUT, json);

console.log(
	`wrote ${OUT} (${(json.length / 1024).toFixed(1)} KB; ${ghazals.length} ghazals in ${draws} draws; ` +
		`avg ${Math.round(json.length / ghazals.length)} bytes per ghazal)`,
);
