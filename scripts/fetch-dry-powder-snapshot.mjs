#!/usr/bin/env node
/**
 * Generates src/data/playground/dry-powder-fallback.json - the committed
 * snapshot the Playground dollar dry powder page renders (and upgrades from
 * live in the visitor's browser).
 *
 * Run from the repo root:  node scripts/fetch-dry-powder-snapshot.mjs
 *
 * Sources (keyless, public):
 * - U.S. Treasury Fiscal Data, DTS operating cash balance (TGA), USD millions
 * - FRED RRPONTSYD (the New York Fed overnight reverse repo series), USD billions
 *
 * The Treasury API cannot be reached from Cloudflare Workers (HTTP 525,
 * verified 2026-10-05 and 2026-10-07), so this script is the server-side path
 * for the TGA series; the page itself never fetches at request time.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/dry-powder-fallback.json");
const FD = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance";
const FRED = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=RRPONTSYD";
const UA = "thatssoheil-website/0.1 (+https://thatssoheil.website)";
const RRP_START = "2013-01-01";

// The DTS account types that carry the Treasury balance; the separate
// "Opening Balance" row (current era) must not be matched. In the current era
// close_today_bal is the string "null" and the closing value sits in
// open_today_bal.
const TGA_PATTERN = /^(Treasury General Account \(TGA\)( Closing Balance)?|Federal Reserve Account)$/;
const toNumber = (value) => {
	if (value == null || value === "" || value === "null") return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

// TGA: full history, paginated.
const tga = new Map();
for (let page = 1; page <= 4; page += 1) {
	const url = `${FD}?sort=record_date&page[size]=10000&page[number]=${page}`;
	const res = await fetch(url, { headers: { accept: "application/json", "user-agent": UA } });
	if (!res.ok) throw new Error(`FiscalData page ${page}: HTTP ${res.status}`);
	const payload = await res.json();
	const rows = payload?.data;
	if (!Array.isArray(rows)) throw new Error(`FiscalData page ${page}: unexpected payload`);
	for (const row of rows) {
		if (!TGA_PATTERN.test(row.account_type ?? "")) continue;
		const value = toNumber(row.close_today_bal) ?? toNumber(row.open_today_bal);
		if (value == null || typeof row.record_date !== "string") continue;
		tga.set(row.record_date, value);
	}
	if (rows.length < 10000) break;
}
const tgaSeries = [...tga.keys()].sort().map((date) => [date, tga.get(date)]);
if (tgaSeries.length < 100) throw new Error("TGA: series too short");

// RRP: FRED CSV. Daily rows; an empty value means no operation that day, so
// nothing was parked overnight - kept as 0. Trimmed to the facility era.
const res = await fetch(FRED, { headers: { accept: "text/csv", "user-agent": UA } });
if (!res.ok) throw new Error(`FRED: HTTP ${res.status}`);
const csv = await res.text();
const rrpSeries = [];
for (const line of csv.trim().split(/\r?\n/).slice(1)) {
	const [date, raw] = line.split(",");
	if (!date || date < RRP_START) continue;
	const value = raw === "" ? 0 : Number(raw);
	if (!Number.isFinite(value)) continue;
	rrpSeries.push([date, value]);
}
if (rrpSeries.length < 100) throw new Error("RRP: series too short");

const snapshot = {
	generated: new Date().toISOString(),
	sources: {
		tga: "U.S. Treasury Fiscal Data, DTS operating cash balance (USD millions)",
		rrp: "Federal Reserve Bank of New York, overnight reverse repo (via FRED RRPONTSYD, USD billions)",
	},
	tga: tgaSeries,
	rrp: rrpSeries,
};

const tgaFirst = tgaSeries[0];
const tgaLast = tgaSeries[tgaSeries.length - 1];
const rrpLast = rrpSeries[rrpSeries.length - 1];
console.log(`TGA: ${tgaSeries.length} points, ${tgaFirst[0]} to ${tgaLast[0]}, latest ${tgaLast[1]} (USD millions)`);
console.log(`RRP: ${rrpSeries.length} points, ${rrpSeries[0][0]} to ${rrpLast[0]}, latest ${rrpLast[1]} (USD billions)`);

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(snapshot);
writeFileSync(OUT, json);
console.log(`wrote ${OUT} (${(json.length / 1024).toFixed(0)} KB)`);
