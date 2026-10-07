"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalTheme } from "@/components/theme-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import {
	attractorValues,
	boundedCycle,
	CYCLE_DEEP,
	CYCLE_FAST,
	LANDMARKS,
	orbitWindow,
	R_MAX,
	R_MIN,
	SEED,
	type Landmark,
} from "@/lib/playground/logistic";

// The instrument: the logistic map x -> r*x*(1-x) as a hand dial. The atlas
// (every r is a column; the orbit's values are the dots) is computed in the
// browser, and the readout measures the cycle length from the orbit itself in
// two stages - a fast burn while the dial moves, a deep burn once it settles
// (limits measured in the lab's vetting study). Nothing is fetched at runtime.

const DEFAULT_R = 3.2;
const ATLAS_BURN = 350;
const ATLAS_PLOT = 72;
const ATLAS_COLS = 1024;
const SWEEP_SLICES = 16;
const STRIP_BURN = 600;
const STRIP_STEPS = 160;
const SETTLE_MS = 160;
const LANDMARK_EPS = 1e-9;
const MAX_DPR = 2;

function currentDpr(): number {
	return typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, MAX_DPR);
}

/** The computed value of a semantic token, for canvas ink. */
function tokenColor(name: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function prefersReducedMotion(): boolean {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cancelSweep(rafRef: { current: number | null }) {
	if (rafRef.current !== null) {
		window.cancelAnimationFrame(rafRef.current);
		rafRef.current = null;
	}
}

interface AtlasGeo {
	w: number;
	h: number;
	padX: number;
	padY: number;
	plotW: number;
	plotH: number;
	cols: number;
	colW: number;
}

function atlasGeo(canvas: HTMLCanvasElement, dpr: number): AtlasGeo {
	const w = canvas.width;
	const h = canvas.height;
	const padX = Math.round(1.5 * dpr);
	const padY = Math.round(2 * dpr);
	const plotW = Math.max(1, w - padX * 2);
	const plotH = Math.max(1, h - padY * 2);
	const cols = Math.min(ATLAS_COLS, Math.max(256, Math.round(plotW)));
	return { w, h, padX, padY, plotW, plotH, cols, colW: plotW / cols };
}

/** Paint atlas columns [from, to): each column one r, its dots the orbit. */
function paintColumns(ctx: CanvasRenderingContext2D, geo: AtlasGeo, from: number, to: number) {
	ctx.fillStyle = tokenColor("--alpha-600");
	const colW = Math.max(1, geo.colW);
	for (let c = from; c < to; c += 1) {
		const r = R_MIN + ((c + 0.5) / geo.cols) * (R_MAX - R_MIN);
		let x = SEED;
		for (let i = 0; i < ATLAS_BURN; i += 1) x = r * x * (1 - x);
		const x0 = geo.padX + c * geo.colW;
		for (let k = 0; k < ATLAS_PLOT; k += 1) {
			x = r * x * (1 - x);
			const y = Math.round(geo.padY + (1 - x) * geo.plotH);
			ctx.fillRect(x0, y, colW, 1);
		}
	}
}

/** Short marks along the bottom edge at the dial's landmark stops. */
function paintTicks(ctx: CanvasRenderingContext2D, geo: AtlasGeo, dpr: number) {
	ctx.fillStyle = tokenColor("--alpha-600");
	const tickH = Math.max(3, Math.round(4 * dpr));
	const tickW = Math.max(1, Math.round(dpr));
	for (const landmark of LANDMARKS) {
		const x = Math.round(geo.padX + ((landmark.r - R_MIN) / (R_MAX - R_MIN)) * geo.plotW);
		ctx.fillRect(Math.min(Math.max(x, 0), geo.w - tickW), geo.h - tickH, tickW, tickH);
	}
}

/** Sweep the atlas in left to right; reduced motion paints it in one pass. */
function startSweep(ctx: CanvasRenderingContext2D, geo: AtlasGeo, dpr: number, rafRef: { current: number | null }) {
	const perFrame = Math.max(1, Math.ceil(geo.cols / SWEEP_SLICES));
	let c = 0;
	const frame = () => {
		const end = Math.min(geo.cols, c + perFrame);
		paintColumns(ctx, geo, c, end);
		c = end;
		if (c < geo.cols) {
			rafRef.current = window.requestAnimationFrame(frame);
		} else {
			rafRef.current = null;
			paintTicks(ctx, geo, dpr);
		}
	};
	rafRef.current = window.requestAnimationFrame(frame);
}

function fitCanvas(canvas: HTMLCanvasElement, dpr: number) {
	const rect = canvas.getBoundingClientRect();
	const w = Math.max(1, Math.round(rect.width * dpr));
	const h = Math.max(1, Math.round(rect.height * dpr));
	if (canvas.width !== w) canvas.width = w;
	if (canvas.height !== h) canvas.height = h;
}

/** The marker: the current r as a brand line, with the attractor's dots. */
function drawOverlay(canvas: HTMLCanvasElement, r: number, dpr: number) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	if (w < 2 || h < 2) return;
	const padX = Math.round(1.5 * dpr);
	const padY = Math.round(2 * dpr);
	const plotW = Math.max(1, w - padX * 2);
	const plotH = Math.max(1, h - padY * 2);
	const x = padX + ((r - R_MIN) / (R_MAX - R_MIN)) * plotW;
	const lineW = Math.max(1, Math.round(1.5 * dpr));
	const lx = Math.min(Math.max(x - lineW / 2, 0), w - lineW);
	ctx.fillStyle = tokenColor("--brand");
	ctx.globalAlpha = 0.9;
	ctx.fillRect(lx, 0, lineW, h);
	ctx.globalAlpha = 1;
	const dotR = Math.max(1.2, 1.4 * dpr);
	for (const value of attractorValues(r, 600, 96)) {
		const y = padY + (1 - value) * plotH;
		ctx.beginPath();
		ctx.arc(x, y, dotR, 0, Math.PI * 2);
		ctx.fill();
	}
}

/** The orbit strip: the last steps' values as brand dots. */
function drawStrip(canvas: HTMLCanvasElement, r: number, dpr: number) {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	if (w < 2 || h < 2) return;
	const padX = Math.round(2 * dpr);
	const padY = Math.round(3 * dpr);
	const plotW = Math.max(1, w - padX * 2);
	const plotH = Math.max(1, h - padY * 2);
	const values = orbitWindow(r, STRIP_BURN, STRIP_STEPS);
	ctx.fillStyle = tokenColor("--brand");
	const dotR = Math.max(1, 1.2 * dpr);
	for (let i = 0; i < values.length; i += 1) {
		const x = padX + (i / (values.length - 1)) * plotW;
		const y = padY + (1 - values[i]) * plotH;
		ctx.beginPath();
		ctx.arc(x, y, dotR, 0, Math.PI * 2);
		ctx.fill();
	}
}

export function LogisticMap() {
	const { theme } = useLocalTheme();
	const reducedMotion = useReducedMotion();

	const [r, setR] = useState(DEFAULT_R);
	const [cycle, setCycle] = useState<number>(() => boundedCycle(DEFAULT_R, CYCLE_FAST));

	const boxRef = useRef<HTMLDivElement | null>(null);
	const atlasRef = useRef<HTMLCanvasElement | null>(null);
	const overlayRef = useRef<HTMLCanvasElement | null>(null);
	const stripRef = useRef<HTMLCanvasElement | null>(null);
	const deepTimerRef = useRef<number | null>(null);
	const sweepRef = useRef<number | null>(null);
	const paintedRef = useRef(false);
	const rRef = useRef(r);

	useEffect(() => {
		rRef.current = r;
	}, [r]);

	/** Size all canvases and repaint them; the atlas sweeps only when asked. */
	const repaint = useCallback((sweep: boolean) => {
		const atlas = atlasRef.current;
		const overlay = overlayRef.current;
		const strip = stripRef.current;
		if (!atlas || !overlay || !strip) return;
		const dpr = currentDpr();
		fitCanvas(atlas, dpr);
		fitCanvas(overlay, dpr);
		fitCanvas(strip, dpr);
		const ctx = atlas.getContext("2d");
		if (ctx) {
			cancelSweep(sweepRef);
			const geo = atlasGeo(atlas, dpr);
			ctx.clearRect(0, 0, atlas.width, atlas.height);
			if (sweep && !prefersReducedMotion()) {
				startSweep(ctx, geo, dpr, sweepRef);
			} else {
				paintColumns(ctx, geo, 0, geo.cols);
				paintTicks(ctx, geo, dpr);
			}
		}
		drawOverlay(overlay, rRef.current, dpr);
		drawStrip(strip, rRef.current, dpr);
	}, []);

	// First paint (a sweep, unless reduced motion), then resize handling.
	useEffect(() => {
		repaint(!paintedRef.current);
		paintedRef.current = true;

		const box = boxRef.current;
		if (!box) return;
		let raf = 0;
		let last: string | null = null;
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) return;
			const size = entry.contentRect;
			const sig = `${Math.round(size.width)}x${Math.round(size.height)}`;
			if (last === null) {
				last = sig;
				return;
			}
			if (sig === last) return;
			last = sig;
			window.cancelAnimationFrame(raf);
			raf = window.requestAnimationFrame(() => repaint(false));
		});
		observer.observe(box);
		return () => {
			observer.disconnect();
			window.cancelAnimationFrame(raf);
		};
	}, [repaint]);

	// Theme flips and reduced-motion flips repaint everything instantly so
	// colors and the motion policy stay correct.
	useEffect(() => {
		if (!paintedRef.current) return;
		repaint(false);
	}, [theme, reducedMotion, repaint]);

	// The marker and the strip follow the dial.
	useEffect(() => {
		const overlay = overlayRef.current;
		const strip = stripRef.current;
		if (!overlay || !strip) return;
		const dpr = currentDpr();
		drawOverlay(overlay, r, dpr);
		drawStrip(strip, r, dpr);
	}, [r]);

	const scheduleDeep = useCallback((nextR: number, delay: number) => {
		if (deepTimerRef.current !== null) window.clearTimeout(deepTimerRef.current);
		deepTimerRef.current = window.setTimeout(() => {
			deepTimerRef.current = null;
			setCycle(boundedCycle(nextR, CYCLE_DEEP));
		}, delay);
	}, []);

	// Settle the initial readout with the deep burn once the page is up.
	useEffect(() => {
		scheduleDeep(DEFAULT_R, 80);
		return () => {
			if (deepTimerRef.current !== null) window.clearTimeout(deepTimerRef.current);
			cancelSweep(sweepRef);
		};
	}, [scheduleDeep]);

	const handleR = useCallback(
		(nextR: number) => {
			setR(nextR);
			setCycle(boundedCycle(nextR, CYCLE_FAST));
			scheduleDeep(nextR, SETTLE_MS);
		},
		[scheduleDeep],
	);

	const handleLandmark = useCallback((landmark: Landmark) => {
		if (deepTimerRef.current !== null) {
			window.clearTimeout(deepTimerRef.current);
			deepTimerRef.current = null;
		}
		setR(landmark.r);
		setCycle(boundedCycle(landmark.r, CYCLE_DEEP));
	}, []);

	const cycleText = cycle === -1 ? "no stable cycle" : `period ${cycle}`;
	const activeLandmark = LANDMARKS.find((landmark) => Math.abs(landmark.r - r) < LANDMARK_EPS) ?? null;
	const atlasLabel = `Bifurcation atlas: the logistic map's orbit values for growth rates from 2.4 to 4.0, with the dial at r = ${r.toFixed(4)}. The readout says ${cycleText}.`;
	const stripLabel =
		cycle === -1
			? `The last 160 values of the orbit at r = ${r.toFixed(4)}: no stable cycle, the values wander.`
			: `The last 160 values of the orbit at r = ${r.toFixed(4)}: a repeating cycle of length ${cycle}.`;

	return (
		<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">The instrument</span>
				<span role="status" aria-live="polite" className="text-label-12-mono text-text-faint">
					{cycleText}
				</span>
			</div>

			<div
				ref={boxRef}
				className="relative mt-4 aspect-[2/1] w-full overflow-hidden rounded-lg border border-alpha-200"
			>
				<canvas ref={atlasRef} role="img" aria-label={atlasLabel} className="block h-full w-full" />
				<canvas
					ref={overlayRef}
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 block h-full w-full"
				/>
			</div>
			<div className="mt-1.5 flex items-baseline justify-between text-label-12-mono text-text-faint">
				<span>r = 2.4</span>
				<span>4.0</span>
			</div>

			<div className="mt-4 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<span className="flex items-baseline justify-between gap-3">
						<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
							r (growth rate)
						</span>
						<span className="text-label-12-mono text-text-faint">{r.toFixed(4)}</span>
					</span>
					<input
						type="range"
						min={R_MIN}
						max={R_MAX}
						step="any"
						value={r}
						onChange={(event) => handleR(Number(event.target.value))}
						className="w-full accent-brand"
						aria-label="r, the growth rate"
						aria-valuetext={r.toFixed(4)}
					/>
				</div>

				<div className="flex flex-col gap-2">
					<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
						Stops on the dial
					</span>
					<div className="flex flex-wrap gap-2">
						{LANDMARKS.map((landmark) => {
							const active = activeLandmark?.slug === landmark.slug;
							return (
								<button
									key={landmark.slug}
									type="button"
									onClick={() => handleLandmark(landmark)}
									aria-pressed={active}
									className={cn(
										"flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]",
										active
											? "border-brand/60 bg-brand/10"
											: "border-border bg-background hover:border-alpha-500 hover:bg-muted",
									)}
								>
									<span className="text-label-13 text-foreground">{landmark.name}</span>
									<span className="text-label-12-mono text-text-faint">
										r = {landmark.exact ?? landmark.r} · {landmark.note}
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>

			<div className="mt-5">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
					The orbit (last 160 steps)
				</span>
				<div className="mt-2 h-[72px] w-full">
					<canvas ref={stripRef} role="img" aria-label={stripLabel} className="block h-full w-full" />
				</div>
			</div>

			<p className="mt-4 text-copy-13 text-text-faint">
				After May, 1976 -{" "}
				<a
					href="https://www.nature.com/articles/261459a0"
					target="_blank"
					rel="noreferrer"
					className="text-brand transition-opacity hover:opacity-75"
				>
					Simple mathematical models with very complicated dynamics
				</a>{" "}
				(Nature 261, pp. 459-467). The map and the atlas are computed in your browser; nothing is
				fetched, so nothing here can go stale.
			</p>
		</div>
	);
}
