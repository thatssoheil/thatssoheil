// --- Playground: volatility gauge data source ---
// The committed DVOL snapshot is the page's base layer. Deribit blocks
// Cloudflare Worker egress (nginx-level 429, verified 2026-10-05 from
// wrangler dev --remote and from a deployed probe worker), so unlike the
// other Playground sources this module does NOT fetch at request time: the
// page renders complete values from the snapshot, and the visitor's browser
// upgrades them to a live reading (see volatility-reading.tsx).
//
// Refresh the snapshot with `node scripts/fetch-dvol-snapshot.mjs` (run from
// a host that can reach Deribit; the VPS can).

import rawSnapshot from "@/data/playground/dvol-fallback.json";
import type { VolatilityData, VolatilitySeriesData } from "@/lib/playground/types";

interface RawSnapshot {
	generated: string;
	series: {
		BTC: [number, number][];
		ETH: [number, number][];
	};
}

function num(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value !== "") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) return parsed;
	}
	return 0;
}

function buildSeries(currency: "BTC" | "ETH", rows: [number, number][]): VolatilitySeriesData {
	const points = rows
		.map(([day, close]) => ({ ts: num(day), value: num(close) }))
		.filter((point) => point.ts > 0 && point.value > 0)
		.sort((a, b) => a.ts - b.ts);
	if (points.length < 2) throw new Error(`DVOL ${currency}: series too short`);

	const latest = points[points.length - 1];
	const prev = points[points.length - 2];
	let atOrBelow = 0;
	for (const point of points) {
		if (point.value <= latest.value) atOrBelow += 1;
	}

	return {
		currency,
		latest: latest.value,
		dayChangePct: (latest.value / prev.value - 1) * 100,
		percentile: (atOrBelow / points.length) * 100,
		history: points.map((point) => ({
			date: new Date(point.ts * 1000).toISOString(),
			value: point.value,
		})),
	};
}

/**
 * The page-facing entry point. Sync, snapshot-only: the live layer runs in
 * the browser because Worker egress to Deribit is blocked.
 */
export function getVolatilityData(): VolatilityData {
	const snapshot = rawSnapshot as unknown as RawSnapshot;
	return {
		asOf: snapshot.generated,
		provenance: "snapshot",
		btc: buildSeries("BTC", snapshot.series.BTC),
		eth: buildSeries("ETH", snapshot.series.ETH),
	};
}
