"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import matricesJson from "@/data/playground/cvd-matrices.json";
import {
	CVD_TYPES,
	decodeCvdMatrices,
	oklchToSrgb,
	rgbToHex,
	simulateHex,
	simulateRgb,
	type CvdMatricesDoc,
	type CvdType,
	type Rgb,
} from "@/lib/playground/cvd";

// The instrument: color vision deficiency, simulated honestly. Pick a type
// (protan / deutan / tritan) and a severity, and three subjects transform -
// a full hue circle, this site's own palette read live from the rendered
// design tokens, and any color the visitor brings. The model is Machado,
// Oliveira and Fernandes 2009; matrices are applied in linear RGB, severity
// by the authors' interpolation. Nothing is fetched at runtime, and the
// piece holds static (controls apply instantly) - no animation to reduce.

const MATRICES = decodeCvdMatrices(matricesJson as unknown as CvdMatricesDoc).types;
/** The sweep sits fully inside sRGB at this lightness and chroma (verified at vetting). */
const SPECTRUM_L = 0.73;
const SPECTRUM_C = 0.12;
const MAX_DPR = 2;

const TYPE_LABELS: Record<CvdType, string> = {
	protan: "Protan",
	deutan: "Deutan",
	tritan: "Tritan",
};

const TYPE_NOTES: Record<CvdType, string> = {
	protan: "Reds darken, and red and green pairs converge.",
	deutan: "Reds and greens converge on yellow - the common case.",
	tritan: "Greens and blues drift toward teal; reds survive - the rare case.",
};

// The curated palette; token names are data here, read at runtime so the
// grid follows whatever the browser actually renders (and the theme).
const TOKENS: { name: string; label: string }[] = [
	{ name: "--signal-200", label: "signal 200" },
	{ name: "--signal-300", label: "signal 300" },
	{ name: "--signal-400", label: "signal 400" },
	{ name: "--signal-500", label: "signal 500" },
	{ name: "--signal-600", label: "signal 600" },
	{ name: "--signal-700", label: "signal 700" },
	{ name: "--brand", label: "brand" },
	{ name: "--destructive", label: "destructive" },
	{ name: "--field-accent", label: "field accent" },
];

function currentDpr(): number {
	return typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, MAX_DPR);
}

function fitCanvas(canvas: HTMLCanvasElement, dpr: number) {
	const rect = canvas.getBoundingClientRect();
	const w = Math.max(1, Math.round(rect.width * dpr));
	const h = Math.max(1, Math.round(rect.height * dpr));
	if (canvas.width !== w) canvas.width = w;
	if (canvas.height !== h) canvas.height = h;
}

/**
 * Paint the hue circle: one device column per hue, oklch(L, C, hue) through
 * the model. sim = null paints normal vision.
 */
function paintSpectrum(
	canvas: HTMLCanvasElement | null,
	dpr: number,
	sim: { type: CvdType; severity: number } | null,
) {
	if (!canvas) return;
	fitCanvas(canvas, dpr);
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	if (w < 2 || h < 2) return;
	for (let x = 0; x < w; x += 1) {
		const hue = (x / w) * 360;
		const rgb = oklchToSrgb(SPECTRUM_L, SPECTRUM_C, hue);
		const out = sim ? simulateRgb(MATRICES, rgb, sim.type, sim.severity) : rgb;
		ctx.fillStyle = rgbToHex(out);
		ctx.fillRect(x, 0, 1, h);
	}
}

/** Resolve a token's rendered sRGB through the browser's own parser. */
function readTokenRgb(ctx: CanvasRenderingContext2D, name: string): Rgb | null {
	const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	if (!value || !CSS.supports("color", value)) return null;
	ctx.fillStyle = value;
	ctx.fillRect(0, 0, 1, 1);
	const d = ctx.getImageData(0, 0, 1, 1).data;
	return [d[0] / 255, d[1] / 255, d[2] / 255];
}

interface PaletteRow {
	name: string;
	label: string;
	hex: string;
}

export function ColorVision() {
	const { theme } = useLocalTheme();
	const [type, setType] = useState<CvdType>("deutan");
	const [severity, setSeverity] = useState(1);
	const [picked, setPicked] = useState("#ff0000");
	const [palette, setPalette] = useState<PaletteRow[] | null>(null);

	const normalRef = useRef<HTMLCanvasElement | null>(null);
	const simRef = useRef<HTMLCanvasElement | null>(null);

	// The palette readback: canvas resolves lab()/oklch()/hex identically, so
	// the values shown are exactly what the browser renders. Re-runs when the
	// site flips theme by the hour. The microtask keeps the update out of the
	// effect body (react-hooks/set-state-in-effect); the pattern matches the
	// night-side clock.
	useEffect(() => {
		const probe = document.createElement("canvas");
		probe.width = 1;
		probe.height = 1;
		const ctx = probe.getContext("2d", { willReadFrequently: true });
		if (!ctx) return;
		const rows: PaletteRow[] = [];
		for (const token of TOKENS) {
			const rgb = readTokenRgb(ctx, token.name);
			if (!rgb) continue;
			rows.push({ name: token.name, label: token.label, hex: rgbToHex(rgb) });
		}
		if (rows.length > 0) queueMicrotask(() => setPalette(rows));
	}, [theme]);

	const rows = useMemo(() => {
		if (!palette) return null;
		return palette.map((row) => ({ ...row, sim: simulateHex(MATRICES, row.hex, type, severity) }));
	}, [palette, type, severity]);

	const tableRows: { name: string; label: string; hex: string | null; sim: string | null }[] =
		rows ??
		TOKENS.map((token) => ({ name: token.name, label: token.label, hex: null, sim: null }));

	const paint = useCallback(() => {
		const dpr = currentDpr();
		paintSpectrum(normalRef.current, dpr, null);
		paintSpectrum(simRef.current, dpr, { type, severity });
	}, [type, severity]);

	// First paint, repaint on type/severity change, and on resize (the
	// observer's initial notification only seeds the baseline).
	useEffect(() => {
		paint();
		const canvases = [normalRef.current, simRef.current].filter(
			(canvas): canvas is HTMLCanvasElement => canvas !== null,
		);
		if (canvases.length === 0) return;
		let raf = 0;
		const last = new Map<Element, string>();
		const observer = new ResizeObserver((entries) => {
			let changed = false;
			for (const entry of entries) {
				const size = entry.contentRect;
				const sig = `${Math.round(size.width)}x${Math.round(size.height)}`;
				if (last.get(entry.target) === sig) continue;
				const seen = last.has(entry.target);
				last.set(entry.target, sig);
				if (seen) changed = true;
			}
			if (!changed) return;
			window.cancelAnimationFrame(raf);
			raf = window.requestAnimationFrame(() => paint());
		});
		for (const canvas of canvases) observer.observe(canvas);
		return () => {
			observer.disconnect();
			window.cancelAnimationFrame(raf);
		};
	}, [paint]);

	const pct = Math.round(severity * 100);
	const typeLabel = TYPE_LABELS[type];
	const pickedHex = picked.toUpperCase();
	const pickedSim = simulateHex(MATRICES, picked, type, severity);

	const normalLabel =
		"The full hue circle at fixed lightness and chroma, in normal vision: reds through greens and blues, back to red.";
	const simLabel = `The same hue circle through ${type} eyes at severity ${pct} percent.`;

	return (
		<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">The instrument</span>
				<span role="status" aria-live="polite" className="text-label-12-mono text-text-faint">
					{typeLabel} · severity {pct}%
				</span>
			</div>

			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-2">
					<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">Type</span>
					<div className="flex flex-wrap gap-2">
						{CVD_TYPES.map((candidate) => {
							const active = type === candidate;
							return (
								<button
									key={candidate}
									type="button"
									onClick={() => setType(candidate)}
									aria-pressed={active}
									className={cn(
										"rounded-full border px-3 py-1 text-copy-13 transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]",
										active
											? "border-brand/60 bg-brand/10 text-foreground"
											: "border-border text-text-muted hover:border-alpha-500 hover:text-foreground",
									)}
								>
									{TYPE_LABELS[candidate]}
								</button>
							);
						})}
					</div>
					<p className="text-copy-13 text-text-faint">{TYPE_NOTES[type]}</p>
				</div>

				<div className="flex flex-col gap-1.5">
					<span className="flex items-baseline justify-between gap-3">
						<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">Severity</span>
						<span className="text-label-12-mono text-text-faint">{pct}%</span>
					</span>
					<input
						type="range"
						min={0}
						max={100}
						step={1}
						value={pct}
						onChange={(event) => setSeverity(Number(event.target.value) / 100)}
						className="w-full accent-brand"
						aria-label="Severity"
						aria-valuetext={`${pct} percent`}
					/>
					<p className="text-copy-13 text-text-faint">
						At 100%, protan and deutan approximate complete dichromacy; tritan at 100% is the
						model&apos;s restrained maximum, not tritanopia.
					</p>
				</div>
			</div>

			<div className="mt-5">
				<div className="flex flex-wrap items-baseline justify-between gap-x-3">
					<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">The spectrum</span>
					<span className="text-label-12-mono text-text-faint">all hues at oklch(0.73 0.12)</span>
				</div>
				<div className="mt-2 flex flex-col gap-3">
					<div>
						<span className="text-label-12-mono text-text-faint">Normal vision</span>
						<div className="mt-1.5 h-10 overflow-hidden rounded-lg border border-alpha-200">
							<canvas ref={normalRef} role="img" aria-label={normalLabel} className="block h-full w-full" />
						</div>
					</div>
					<div>
						<div className="flex flex-wrap items-baseline justify-between gap-x-3">
							<span className="text-label-12-mono text-text-faint">Through {type} eyes</span>
							<span className="text-label-12-mono text-text-faint">severity {pct}%</span>
						</div>
						<div className="mt-1.5 h-10 overflow-hidden rounded-lg border border-alpha-200">
							<canvas ref={simRef} role="img" aria-label={simLabel} className="block h-full w-full" />
						</div>
					</div>
				</div>
			</div>

			<div className="mt-5">
				<div className="flex flex-wrap items-baseline justify-between gap-x-3">
					<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
						This site&apos;s palette
					</span>
					<span className="text-label-12-mono text-text-faint">
						read live from the design tokens - current theme
					</span>
				</div>
				<div className="mt-2 overflow-hidden rounded-lg border border-alpha-200">
					<table className="w-full border-collapse text-left">
						<thead>
							<tr className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
								<th className="px-2 py-2 font-normal sm:px-4">Token</th>
								<th className="px-2 py-2 font-normal sm:px-4">Normal</th>
								<th className="px-2 py-2 font-normal sm:px-4">Through {type}</th>
							</tr>
						</thead>
						<tbody>
							{tableRows.map((row) => (
								<tr key={row.name} className="border-t border-alpha-200">
									<td className="px-2 py-2 sm:px-4">
										<span className="text-label-12-mono text-text-muted">{row.label}</span>
									</td>
									<td className="px-2 py-2 sm:px-4">
										<span className="flex items-center gap-1.5 sm:gap-2">
											<span
												aria-hidden="true"
												className="h-3.5 w-3.5 shrink-0 rounded-sm border border-alpha-300"
												style={row.hex ? { background: row.hex } : undefined}
											/>
											<span className="text-label-12-mono text-text-faint">{row.hex ?? "-"}</span>
										</span>
									</td>
									<td className="px-2 py-2 sm:px-4">
										<span className="flex items-center gap-1.5 sm:gap-2">
											<span
												aria-hidden="true"
												className="h-3.5 w-3.5 shrink-0 rounded-sm border border-alpha-300"
												style={row.sim ? { background: row.sim } : undefined}
											/>
											<span className="text-label-12-mono text-text-faint">{row.sim ?? "-"}</span>
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className="mt-5">
				<div className="flex flex-wrap items-baseline justify-between gap-x-3">
					<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
						A color you bring
					</span>
					<span className="text-label-12-mono text-text-faint">native picker - any color</span>
				</div>
				<div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
					<div className="flex items-center gap-3">
						<input
							type="color"
							value={picked}
							onChange={(event) => setPicked(event.target.value)}
							aria-label="Pick a color to simulate"
							className="h-10 w-14 cursor-pointer rounded-lg border border-input bg-background p-1"
						/>
						<span className="text-label-12-mono text-text-faint">{pickedHex}</span>
					</div>
					<span className="text-copy-13 text-text-faint">simulates to</span>
					<span className="flex items-center gap-1.5 sm:gap-2">
						<span
							aria-hidden="true"
							className="h-5 w-5 shrink-0 rounded-sm border border-alpha-300"
							style={{ background: pickedSim }}
						/>
						<span className="text-label-12-mono text-text-faint">{pickedSim}</span>
					</span>
				</div>
			</div>

			<p className="mt-5 text-copy-13 text-text-faint">
				Machado, Oliveira and Fernandes, 2009 - 33 precomputed matrices applied in linear RGB, severity
				by the authors&apos; own interpolation. Nothing is fetched at runtime.
			</p>
		</div>
	);
}
