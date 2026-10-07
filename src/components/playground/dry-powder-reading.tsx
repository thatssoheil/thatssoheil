"use client";

import { useEffect, useState } from "react";
import { StatTile } from "@/components/playground/stat-tile";
import {
	formatChangeBillions,
	formatDateLong,
	formatDateShort,
	formatPct,
	formatUsdBillions,
} from "@/lib/playground/format";
import type { DryPowderReadingSeries } from "@/lib/playground/types";

// Both sources answer browser fetches with CORS `*` (verified 2026-10-05 and
// 2026-10-07), but the Treasury API refuses the site's own Worker egress
// (HTTP 525) and the lab's headless browser (F5 block), so this component
// carries the live layer: the page renders from the committed snapshot and
// each series upgrades in place when the visitor's browser can reach its
// source. A failed upgrade keeps that series' snapshot values.

const TGA_ENDPOINT =
	"https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/operating_cash_balance";
const RRP_ENDPOINT = "https://markets.newyorkfed.org/api/rp/reverserepo/all/results/last/30.json";
const WINDOW_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

// Same recipe as the snapshot generator: the DTS rows that carry the Treasury
// balance; in the current era the closing value sits in open_today_bal.
const TGA_PATTERN = /^(Treasury General Account \(TGA\)( Closing Balance)?|Federal Reserve Account)$/;

interface TgaRow {
	record_date?: string;
	account_type?: string;
	close_today_bal?: string;
	open_today_bal?: string;
}

interface RrpOperation {
	operationDate?: string;
	totalAmtAccepted?: number;
}

interface TgaLive {
	latest: number;
	latestDate: string;
	change7d: number | null;
	change30d: number | null;
}

interface RrpLive {
	latest: number;
	latestDate: string;
}

interface SeriesPoint {
	date: string;
	value: number;
}

function toNumber(value: unknown): number | null {
	if (value == null || value === "" || value === "null") return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

async function fetchTgaWindow(): Promise<SeriesPoint[]> {
	const since = new Date(Date.now() - WINDOW_DAYS * DAY_MS).toISOString().slice(0, 10);
	const url =
		`${TGA_ENDPOINT}?filter=record_date:gte:${since}` +
		"&fields=record_date,account_type,close_today_bal,open_today_bal" +
		"&page[size]=500&sort=record_date";
	const res = await fetch(url, {
		headers: { accept: "application/json" },
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`TGA: HTTP ${res.status}`);
	const payload = (await res.json()) as { data?: unknown };
	const rows = payload?.data;
	if (!Array.isArray(rows)) throw new Error("TGA: unexpected payload");
	const byDate = new Map<string, number>();
	for (const row of rows as TgaRow[]) {
		const type = typeof row?.account_type === "string" ? row.account_type : "";
		if (!TGA_PATTERN.test(type)) continue;
		const value = toNumber(row.close_today_bal) ?? toNumber(row.open_today_bal);
		const date = typeof row?.record_date === "string" ? row.record_date : "";
		if (value == null || date === "") continue;
		byDate.set(date, value / 1000);
	}
	return [...byDate.entries()]
		.map(([date, value]) => ({ date, value }))
		.sort((a, b) => (a.date < b.date ? -1 : 1));
}

async function fetchRrpRecent(): Promise<SeriesPoint[]> {
	const res = await fetch(RRP_ENDPOINT, {
		headers: { accept: "application/json" },
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`RRP: HTTP ${res.status}`);
	const payload = (await res.json()) as { repo?: { operations?: unknown } };
	const operations = payload?.repo?.operations;
	if (!Array.isArray(operations)) throw new Error("RRP: unexpected payload");
	const points: SeriesPoint[] = [];
	for (const op of operations as RrpOperation[]) {
		const date = typeof op?.operationDate === "string" ? op.operationDate : "";
		const amount = typeof op?.totalAmtAccepted === "number" ? op.totalAmtAccepted : null;
		if (date === "" || amount == null || !Number.isFinite(amount)) continue;
		points.push({ date, value: amount / 1e9 });
	}
	points.sort((a, b) => (a.date < b.date ? -1 : 1));
	return points;
}

function changeOver(points: SeriesPoint[], latest: SeriesPoint, days: number): number | null {
	const target = new Date(Date.parse(latest.date) - days * DAY_MS).toISOString().slice(0, 10);
	for (let index = points.length - 1; index >= 0; index -= 1) {
		if (points[index].date <= target) return latest.value - points[index].value;
	}
	return null;
}

/**
 * The reading section: six tiles rendered from the snapshot on the server,
 * upgraded in place when the visitor's browser can reach each source. The
 * state line is honest either way - snapshot or live, per series, with the
 * data's own as-of date.
 */
export function DryPowderReading({
	tga,
	rrp,
}: {
	tga: DryPowderReadingSeries;
	rrp: DryPowderReadingSeries;
}) {
	const [tgaLive, setTgaLive] = useState<TgaLive | null>(null);
	const [rrpLive, setRrpLive] = useState<RrpLive | null>(null);

	useEffect(() => {
		let cancelled = false;
		const upgradeTga = async () => {
			try {
				const points = await fetchTgaWindow();
				if (cancelled || points.length === 0) return;
				const latest = points[points.length - 1];
				setTgaLive({
					latest: latest.value,
					latestDate: latest.date,
					change7d: changeOver(points, latest, 7),
					change30d: changeOver(points, latest, 30),
				});
			} catch (error) {
				// Keep the snapshot; leave a trail for debugging without noise.
				if (!cancelled) {
					console.warn(
						"[playground/dry-powder] TGA live upgrade unavailable:",
						error instanceof Error ? error.message : String(error),
					);
				}
			}
		};
		const upgradeRrp = async () => {
			try {
				const points = await fetchRrpRecent();
				if (cancelled || points.length === 0) return;
				const latest = points[points.length - 1];
				setRrpLive({ latest: latest.value, latestDate: latest.date });
			} catch (error) {
				if (!cancelled) {
					console.warn(
						"[playground/dry-powder] RRP live upgrade unavailable:",
						error instanceof Error ? error.message : String(error),
					);
				}
			}
		};
		upgradeTga();
		upgradeRrp();
		return () => {
			cancelled = true;
		};
	}, []);

	const tgaView = tgaLive ?? {
		latest: tga.latest,
		latestDate: tga.latestDate,
		change7d: tga.change7d,
		change30d: tga.change30d,
	};
	const rrpView = rrpLive ?? { latest: rrp.latest, latestDate: rrp.latestDate };
	const combined = tgaView.latest + rrpView.latest;
	const rrpDistance = rrp.peak.value > 0 ? (rrpView.latest / rrp.peak.value - 1) * 100 : 0;

	const tgaState = `TGA: ${tgaLive ? "live" : "snapshot"} from U.S. Treasury Fiscal Data, as of ${formatDateLong(tgaView.latestDate)}`;
	const rrpState = `RRP: ${rrpLive ? "live" : "snapshot"} from the Federal Reserve Bank of New York, as of ${formatDateLong(rrpView.latestDate)}`;

	return (
		<div className="flex flex-col gap-3">
			<p className="text-copy-13 text-text-faint">
				{tgaState} · {rrpState}
			</p>
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				<StatTile
					label="TGA balance"
					value={formatUsdBillions(tgaView.latest)}
					hint="the government's checking account"
				/>
				<StatTile
					label="RRP balance"
					value={formatUsdBillions(rrpView.latest)}
					hint="cash parked at the Fed overnight"
				/>
				<StatTile label="Combined idle cash" value={formatUsdBillions(combined)} hint="TGA plus RRP" />
				<StatTile
					label="TGA week change"
					value={tgaView.change7d == null ? "-" : formatChangeBillions(tgaView.change7d)}
					hint="vs 7 days earlier"
				/>
				<StatTile
					label="TGA month change"
					value={tgaView.change30d == null ? "-" : formatChangeBillions(tgaView.change30d)}
					hint="vs 30 days earlier"
				/>
				<StatTile
					label="RRP vs peak"
					value={formatPct(rrpDistance, 2)}
					hint={`peak ${formatUsdBillions(rrp.peak.value)} on ${formatDateShort(rrp.peak.date)}`}
				/>
			</div>
		</div>
	);
}
