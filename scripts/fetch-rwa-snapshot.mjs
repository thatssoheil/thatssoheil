#!/usr/bin/env node
/**
 * Generates src/data/playground/rwa-fallback-raw.json — the committed fallback
 * the Playground RWA tracker renders when the live Birdeye feed is unreachable.
 *
 * Run from the repo root:  node scripts/fetch-rwa-snapshot.mjs
 *
 * Source: the beta deployment's internal forge API (keyless, undocumented).
 * If this script starts failing, check whether the beta host changed or the
 * endpoints were locked down; the site keeps serving the last snapshot either way.
 *
 * The payloads are stripped to the fields the site's normalizer reads, so the
 * committed JSON stays small (raw items carry bulky unused fields like priceLine).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/rwa-fallback-raw.json");
const BASE = "https://beta.birdeye.so/forge";
const HEADERS = {
	"user-agent":
		"Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
	referer: "https://beta.birdeye.so/find-gems?type=rwas&rwaDisplay=dashboard",
};
const CHAINS = ["solana", "ethereum", "bsc", "base", "robinhood", "mantle"];

async function get(path, params = {}) {
	const url = new URL(`${BASE}/${path}`);
	for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
	const res = await fetch(url, { headers: HEADERS });
	if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
	return res.json();
}

async function post(path, body) {
	const res = await fetch(`${BASE}/${path}`, {
		method: "POST",
		headers: { ...HEADERS, "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
	return res.json();
}

const stripTokenItem = (t) => ({
	symbol: t.symbol,
	name: t.name,
	address: t.address,
	network: t.network,
	tags: t.tags,
	participants: t.participants,
	underlyingAsset: t.underlyingAsset,
	price: t.price,
	mc: t.mc,
	liquidity: t.liquidity,
	tf24h: t.tf24h
		? {
				volumeUSD: t.tf24h.volumeUSD,
				priceChangePercent: t.tf24h.priceChangePercent,
				tradeCount: t.tf24h.tradeCount,
				uniqueWallets: t.tf24h.uniqueWallets,
			}
		: undefined,
});

const stripDay = (day, fields) => ({
	event_date: day.event_date,
	issuers: Array.isArray(day.issuers)
		? day.issuers.map((issuer) =>
				Object.fromEntries(fields.map((field) => [field, issuer[field]])),
			)
		: [],
});

const overview = await get("rwa/overview", {
	chain: "",
	offset: "0",
	limit: "100",
	order_by: "total_volume",
	order_type: "desc",
});
const history = await get("rwa/overview-chart", { chain: "", interval: "" });
const assets = await get("rwa/overview-chart-asset", { chain: "", interval: "" });

const tokens = {};
for (const chain of CHAINS) {
	try {
		const payload = await post("insights/sectors/token_list", {
			network: chain,
			sector: "rwas",
			tags: [],
			offset: 0,
			limit: 50,
			sort_by: "tf24h.volumeUSD",
			sort_type: "desc",
		});
		const items = payload?.data?.items ?? [];
		tokens[chain] = { data: { items: items.map(stripTokenItem) } };
		console.log(`tokens ${chain}: ${items.length}`);
	} catch (error) {
		console.warn(`tokens ${chain}: skipped (${error.message})`);
	}
}

const raw = {
	generatedAt: new Date().toISOString(),
	overview: {
		data: {
			items: (overview?.data?.items ?? []).map((issuer) => ({
				issuer: issuer.issuer,
				chains: issuer.chains,
				asset_classes: issuer.asset_classes,
				total_volume: issuer.total_volume,
				total_mc: issuer.total_mc,
				rwa_asset: issuer.rwa_asset,
				total_liquidity: issuer.total_liquidity,
				total_holders: issuer.total_holders,
			})),
		},
	},
	history: {
		data: { items: (history?.data?.items ?? []).map((day) => stripDay(day, ["total_volume"])) },
	},
	assets: {
		data: { items: (assets?.data?.items ?? []).map((day) => stripDay(day, ["cum_assets"])) },
	},
	tokens,
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(raw);
writeFileSync(OUT, json);
console.log(
	`wrote ${OUT} (${(json.length / 1024).toFixed(0)} KB) · issuers: ${
		raw.overview.data.items.length
	} · history days: ${raw.history.data.items.length}`,
);
