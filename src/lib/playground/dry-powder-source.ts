// --- Playground: dollar dry powder data source ---
// The committed snapshot is the page's base layer. The Treasury (FiscalData)
// API refuses Cloudflare Worker egress (HTTP 525, verified 2026-10-05 and
// 2026-10-07), so unlike the live-first Playground sources this module does
// NOT fetch at request time: the page renders complete values from the
// snapshot, and the visitor's browser upgrades each series to a live reading
// (see dry-powder-reading.tsx).
//
// Refresh the snapshot with `node scripts/fetch-dry-powder-snapshot.mjs`
// (run from a host that can reach FiscalData; the VPS can).

import rawSnapshot from "@/data/playground/dry-powder-fallback.json";
import type { DryPowderData, DryPowderSeriesData } from "@/lib/playground/types";

interface RawSnapshot {
	generated: string;
	sources: { tga: string; rrp: string };
	/** [record date, balance in USD millions] */
	tga: [string, number][];
	/** [date, balance in USD billions] */
	rrp: [string, number][];
}

const DAY_MS = 86_400_000;

function buildSeries(rows: [string, number][], scale: number): DryPowderSeriesData {
	const points = rows
		.map(([date, value]) => ({ date, value: value * scale }))
		.filter((point) => typeof point.date === "string" && Number.isFinite(point.value))
		.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
	if (points.length < 2) throw new Error("dry powder: series too short");

	const latest = points[points.length - 1];
	const change = (days: number): number | null => {
		const target = new Date(Date.parse(latest.date) - days * DAY_MS).toISOString().slice(0, 10);
		for (let index = points.length - 1; index >= 0; index -= 1) {
			if (points[index].date <= target) return latest.value - points[index].value;
		}
		return null;
	};
	let peak = points[0];
	for (const point of points) {
		if (point.value > peak.value) peak = point;
	}

	return {
		latest: latest.value,
		latestDate: latest.date,
		change7d: change(7),
		change30d: change(30),
		peak: { value: peak.value, date: peak.date },
		distanceFromPeakPct: peak.value > 0 ? (latest.value / peak.value - 1) * 100 : 0,
		history: points,
	};
}

/**
 * The page-facing entry point. Sync, snapshot-only: the live layer runs in
 * the browser because Worker egress to the Treasury API is blocked.
 */
export function getDryPowderData(): DryPowderData {
	const snapshot = rawSnapshot as unknown as RawSnapshot;
	return {
		asOf: snapshot.generated,
		provenance: "snapshot",
		tga: buildSeries(snapshot.tga, 1 / 1000),
		rrp: buildSeries(snapshot.rrp, 1),
	};
}
