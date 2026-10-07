"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/playground/format";
import { parseFalPayload } from "@/lib/playground/hafez-parse";
import type { HafezData, HafezFallbackSet, HafezGhazal } from "@/lib/playground/types";

// The fal, drawn: the server renders the first draw (live from Ganjoor, or a
// local draw when the live path failed). Each redraw asks Ganjoor directly
// from the visitor's browser - CORS is open on the fal endpoint - and when
// that fetch cannot run, the draw comes from the committed local set with an
// honest label. The page never arrives empty and never draws nothing.

const FAAL_URL = "https://api.ganjoor.net/api/ganjoor/hafez/faal";

/** Persian typefaces, system fonts only; Lexend has no Arabic coverage. */
const PERSIAN_FONT_STACK =
	'"Noto Naskh Arabic", "Noto Sans Arabic", "Geeza Pro", Tahoma, "Segoe UI", Arial, sans-serif';

interface DrawState {
	ghazal: HafezGhazal;
	provenance: "live" | "local";
	asOf: string;
}

interface Couplet {
	first: string | null;
	second: string | null;
}

/** Group hemistichs into couplets, in couplet order. */
function toCouplets(ghazal: HafezGhazal): Couplet[] {
	const byCouplet = new Map<number, { first?: string; second?: string }>();
	for (const verse of ghazal.verses) {
		const entry = byCouplet.get(verse.coupletIndex) ?? {};
		if (verse.versePosition === 0) {
			entry.first = verse.text;
		} else {
			entry.second = verse.text;
		}
		byCouplet.set(verse.coupletIndex, entry);
	}
	return [...byCouplet.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([, entry]) => ({ first: entry.first ?? null, second: entry.second ?? null }));
}

/** Hour and minute (UTC) of an ISO timestamp, for draw stamps. */
function hmUtc(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	const hh = String(date.getUTCHours()).padStart(2, "0");
	const mm = String(date.getUTCMinutes()).padStart(2, "0");
	return `${hh}:${mm} UTC`;
}

export function HafezFal({
	initial,
	fallbackSet,
}: {
	initial: HafezData;
	fallbackSet: HafezFallbackSet;
}) {
	const [draw, setDraw] = useState<DrawState>({
		ghazal: initial.ghazal,
		provenance: initial.provenance,
		asOf: initial.asOf,
	});
	const [drawing, setDrawing] = useState(false);
	const [drawCount, setDrawCount] = useState(0);
	const [note, setNote] = useState<string | null>(null);
	const reducedMotion = useReducedMotion();

	const couplets = useMemo(() => toCouplets(draw.ghazal), [draw.ghazal]);

	async function handleDraw() {
		if (drawing) return;
		setDrawing(true);
		setNote(null);
		try {
			const res = await fetch(FAAL_URL, {
				headers: { accept: "application/json" },
				signal: AbortSignal.timeout(10_000),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const ghazal = parseFalPayload(await res.json());
			setDraw({ ghazal, provenance: "live", asOf: new Date().toISOString() });
		} catch (error) {
			// Keep the local draw visible: the label says where this came from.
			console.warn(
				"[playground/hafez] live redraw failed; drawing from the local set:",
				error instanceof Error ? error.message : String(error),
			);
			const index = Math.floor(Math.random() * fallbackSet.ghazals.length);
			setDraw({
				ghazal: fallbackSet.ghazals[index],
				provenance: "local",
				asOf: fallbackSet.generatedAt,
			});
			setNote("Ganjoor was unreachable from your browser just now, so this draw came from the local set.");
		} finally {
			setDrawing(false);
			setDrawCount((count) => count + 1);
		}
	}

	const stateLine =
		draw.provenance === "live"
			? `Drawn live from Ganjoor at ${hmUtc(draw.asOf)}`
			: `Drawn from the local set (refreshed ${formatDateShort(draw.asOf)})`;
	const ganjoorUrl = `https://ganjoor.net${draw.ghazal.fullUrl}`;

	return (
		<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">The draw</span>
				<span role="status" aria-live="polite" className="text-label-12-mono text-text-faint">
					{stateLine}
				</span>
			</div>

			<div
				dir="rtl"
				lang="fa"
				style={{ fontFamily: PERSIAN_FONT_STACK }}
				className={cn(
					"mt-5 flex flex-col gap-3",
					!reducedMotion && "transition-opacity duration-300",
					drawing && "opacity-60",
				)}
			>
				<p className="text-copy-14 text-text-muted">{draw.ghazal.fullTitle}</p>
				{couplets.map((couplet, index) => (
					<p
						key={index}
						className="flex flex-wrap justify-start gap-x-10 text-copy-20 leading-loose text-foreground sm:text-copy-24"
					>
						{couplet.first ? <span>{couplet.first}</span> : null}
						{couplet.second ? <span>{couplet.second}</span> : null}
					</p>
				))}
			</div>

			<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
				<div className="flex max-w-md flex-col gap-1">
					<p className="text-copy-14 text-text-muted">
						Hold a wish, then draw. Each draw is a random ghazal from Ganjoor&apos;s fal service; the
						page stores nothing about you.
					</p>
					{note ? <p className="text-copy-13 text-text-faint">{note}</p> : null}
				</div>
				<Button onClick={handleDraw} disabled={drawing}>
					{drawing ? "Drawing..." : drawCount > 0 ? "Draw again" : "Draw"}
				</Button>
			</div>

			<p className="mt-4 text-copy-13 text-text-faint">
				Text from{" "}
				<a
					href="https://ganjoor.net"
					target="_blank"
					rel="noreferrer"
					className="text-brand transition-opacity hover:opacity-75"
				>
					Ganjoor
				</a>{" "}
				·{" "}
				<a
					href={ganjoorUrl}
					target="_blank"
					rel="noreferrer"
					className="text-brand transition-opacity hover:opacity-75"
				>
					this ghazal on ganjoor.net
				</a>
			</p>
		</div>
	);
}
