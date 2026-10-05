"use client";

import { useEffect, useState } from "react";
import { StatTile } from "@/components/playground/stat-tile";
import { formatDateLong, formatPct } from "@/lib/playground/format";

// Deribit's public DVOL endpoint. Worker egress to it is blocked (nginx-level
// 429, verified 2026-10-05), but the visitor's browser can fetch it directly:
// the API sends `access-control-allow-origin: *` and the site ships no
// Content-Security-Policy. The page renders from the committed snapshot; this
// component upgrades the reading to live when the browser fetch succeeds.

const DVOL_ENDPOINT = "https://www.deribit.com/api/v2/public/get_volatility_index_data";
const WINDOW_DAYS = 16;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReadingSeries {
	level: number;
	dayChangePct: number;
	percentile: number;
	/** Full daily close history; the percentile basis, recomputed on upgrade. */
	closes: number[];
}

interface LiveReading {
	level: number;
	dayChangePct: number;
	percentile: number;
}

interface DvolRow {
	ts: number;
	close: number;
}

async function fetchRecentWindow(currency: "BTC" | "ETH"): Promise<DvolRow[]> {
	const end = Date.now();
	const start = end - WINDOW_DAYS * DAY_MS;
	const url =
		`${DVOL_ENDPOINT}?currency=${currency}` +
		`&start_timestamp=${Math.floor(start)}&end_timestamp=${Math.floor(end)}&resolution=1D`;
	const res = await fetch(url, {
		headers: { accept: "application/json" },
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`DVOL ${currency}: HTTP ${res.status}`);
	const payload = (await res.json()) as { result?: { data?: unknown } };
	const data = payload?.result?.data;
	if (!Array.isArray(data)) throw new Error(`DVOL ${currency}: unexpected payload`);
	const points: DvolRow[] = [];
	for (const row of data) {
		if (!Array.isArray(row)) continue;
		const ts = Number(row[0]);
		const close = Number(row[4]);
		if (Number.isFinite(ts) && Number.isFinite(close) && close > 0) {
			points.push({ ts, close });
		}
	}
	points.sort((a, b) => a.ts - b.ts);
	return points;
}

function shareAtOrBelow(values: number[], level: number): number {
	if (values.length === 0) return 0;
	let count = 0;
	for (const value of values) {
		if (value <= level) count += 1;
	}
	return (count / values.length) * 100;
}

function computeLive(rows: DvolRow[], closes: number[]): LiveReading | null {
	if (rows.length < 2) return null;
	const last = rows[rows.length - 1];
	const prev = rows[rows.length - 2];
	if (!(last.close > 0) || !(prev.close > 0)) return null;
	return {
		level: last.close,
		dayChangePct: (last.close / prev.close - 1) * 100,
		percentile: shareAtOrBelow(closes, last.close),
	};
}

/**
 * The reading section: six tiles rendered from the snapshot on the server,
 * upgraded in place when the visitor's browser can reach Deribit. The state
 * line is honest either way - "Snapshot as of ..." until the live fetch
 * succeeds, "Live from Deribit, as of ..." after.
 */
export function VolatilityReading({
	btc,
	eth,
	snapshotDate,
}: {
	btc: ReadingSeries;
	eth: ReadingSeries;
	snapshotDate: string;
}) {
	const [live, setLive] = useState<{ at: string; btc: LiveReading; eth: LiveReading } | null>(null);

	useEffect(() => {
		let cancelled = false;
		const upgrade = async () => {
			try {
				const [btcRows, ethRows] = await Promise.all([
					fetchRecentWindow("BTC"),
					fetchRecentWindow("ETH"),
				]);
				const btcLive = computeLive(btcRows, btc.closes);
				const ethLive = computeLive(ethRows, eth.closes);
				if (cancelled || !btcLive || !ethLive) return;
				setLive({ at: new Date().toISOString(), btc: btcLive, eth: ethLive });
			} catch (error) {
				// Keep the snapshot; leave a trail for debugging without noise.
				if (!cancelled) {
					console.warn(
						"[playground/volatility] live upgrade unavailable:",
						error instanceof Error ? error.message : String(error),
					);
				}
			}
		};
		upgrade();
		return () => {
			cancelled = true;
		};
	}, [btc.closes, eth.closes]);

	const btcView = live?.btc ?? btc;
	const ethView = live?.eth ?? eth;
	const state = live
		? `Live from Deribit, as of ${live.at.slice(11, 16)} UTC`
		: `Snapshot as of ${formatDateLong(snapshotDate)}`;

	return (
		<div className="flex flex-col gap-3">
			<p className="text-copy-13 text-text-faint">{state}</p>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				<StatTile
					label="BTC implied volatility"
					value={btcView.level.toFixed(2)}
					hint="30-day forward"
				/>
				<StatTile
					label="ETH implied volatility"
					value={ethView.level.toFixed(2)}
					hint="30-day forward"
				/>
				<StatTile
					label="BTC day change"
					value={formatPct(btcView.dayChangePct)}
					hint="vs previous close"
				/>
				<StatTile
					label="ETH day change"
					value={formatPct(ethView.dayChangePct)}
					hint="vs previous close"
				/>
				<StatTile
					label="BTC percentile"
					value={`${btcView.percentile.toFixed(1)}%`}
					hint="of daily closes since March 2021"
				/>
				<StatTile
					label="ETH percentile"
					value={`${ethView.percentile.toFixed(1)}%`}
					hint="of daily closes since March 2021"
				/>
			</div>
		</div>
	);
}
