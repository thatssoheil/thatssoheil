"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalTheme } from "@/components/theme-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import maskData from "@/data/playground/night-side-mask.json";
import {
	BAND_ALPHAS,
	BAND_LABELS,
	BAND_ROWS,
	CITIES,
	TICK_MS,
	bandOf,
	cityState,
	decodeMask,
	formatLocalTime,
	formatUtcTime,
	maskLand,
	solarPosition,
	sunAltitude,
} from "@/lib/playground/night-side";

// The instrument: the day/night line right now. Land is a dot field from the
// committed mask; the night side and the twilight bands are computed in the
// browser from the clock; a ring marks the sun's overhead point. The static
// land atlas is painted once per theme and resize; every minute only the
// shading overlay is repainted. Nothing is fetched at runtime.

const MAX_DPR = 2;
const SHADE_BLOCK = 2; // css px per shading block

function currentDpr(): number {
	return typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, MAX_DPR);
}

/** The computed value of a semantic token, for canvas ink. */
function tokenColor(name: string): string {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function fitCanvas(canvas: HTMLCanvasElement, dpr: number) {
	const rect = canvas.getBoundingClientRect();
	const w = Math.max(1, Math.round(rect.width * dpr));
	const h = Math.max(1, Math.round(rect.height * dpr));
	if (canvas.width !== w) canvas.width = w;
	if (canvas.height !== h) canvas.height = h;
}

function formatLat(lat: number): string {
	return `${Math.abs(lat).toFixed(1)}${lat >= 0 ? "N" : "S"}`;
}

function formatLon(lon: number): string {
	return `${Math.abs(lon).toFixed(1)}${lon >= 0 ? "E" : "W"}`;
}

export function NightSide() {
	const { theme } = useLocalTheme();
	const reducedMotion = useReducedMotion();

	const [now, setNow] = useState<number | null>(null);
	const started = now !== null;

	const boxRef = useRef<HTMLDivElement | null>(null);
	const atlasRef = useRef<HTMLCanvasElement | null>(null);
	const overlayRef = useRef<HTMLCanvasElement | null>(null);
	const nowRef = useRef<number | null>(null);
	const bytes = useMemo(() => decodeMask(maskData.bits), []);

	// The first frame: computed in the browser from the clock.
	useEffect(() => {
		queueMicrotask(() => setNow(Date.now()));
	}, []);

	useEffect(() => {
		nowRef.current = now;
	}, [now]);

	/** The static atlas: the land dot field. Painted on theme and resize only. */
	const paintAtlas = useCallback(() => {
		const canvas = atlasRef.current;
		if (!canvas) return;
		const dpr = currentDpr();
		fitCanvas(canvas, dpr);
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const w = canvas.width;
		const h = canvas.height;
		ctx.clearRect(0, 0, w, h);
		if (w < 2 || h < 2) return;
		ctx.fillStyle = tokenColor("--alpha-600");
		const { cols, rows } = maskData;
		const cellW = w / cols;
		const cellH = h / rows;
		const dotW = Math.max(1, Math.round(cellW * 0.62));
		const dotH = Math.max(1, Math.round(cellH * 0.62));
		for (let j = 0; j < rows; j += 1) {
			for (let i = 0; i < cols; i += 1) {
				if (!maskLand(bytes, cols, i, j)) continue;
				const x = Math.round((i + 0.5) * cellW - dotW / 2);
				const y = Math.round((j + 0.5) * cellH - dotH / 2);
				ctx.fillRect(x, y, dotW, dotH);
			}
		}
	}, [bytes]);

	/** The moving layer: twilight bands, the subsolar ring, the city dots. */
	const paintOverlay = useCallback((ms: number) => {
		const canvas = overlayRef.current;
		if (!canvas) return;
		const dpr = currentDpr();
		fitCanvas(canvas, dpr);
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const w = canvas.width;
		const h = canvas.height;
		ctx.clearRect(0, 0, w, h);
		if (w < 2 || h < 2) return;

		const { dec, lon: subsolarLon } = solarPosition(ms);

		// Shading, on a coarse grid of about two css px blocks.
		const cols = Math.max(90, Math.round(w / (SHADE_BLOCK * dpr)));
		const rows = Math.max(45, Math.round(h / (SHADE_BLOCK * dpr)));
		ctx.fillStyle = tokenColor("--alpha-600");
		for (let j = 0; j < rows; j += 1) {
			const lat = 90 - ((j + 0.5) / rows) * 180;
			const y0 = Math.round((j * h) / rows);
			const y1 = Math.round(((j + 1) * h) / rows);
			for (let i = 0; i < cols; i += 1) {
				const lon = ((i + 0.5) / cols) * 360 - 180;
				const alpha = BAND_ALPHAS[bandOf(sunAltitude(lat, lon, ms))];
				if (alpha === 0) continue;
				const x0 = Math.round((i * w) / cols);
				const x1 = Math.round(((i + 1) * w) / cols);
				ctx.globalAlpha = alpha;
				ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
			}
		}
		ctx.globalAlpha = 1;

		// The sun's overhead point: a ring in the brand color.
		const sx = ((subsolarLon + 180) / 360) * w;
		const sy = ((90 - dec) / 180) * h;
		ctx.strokeStyle = tokenColor("--brand");
		ctx.lineWidth = Math.max(1, Math.round(1.4 * dpr));
		ctx.beginPath();
		ctx.arc(sx, sy, Math.max(3, 4.5 * dpr), 0, Math.PI * 2);
		ctx.stroke();

		// The five cities: small brand dots.
		ctx.fillStyle = tokenColor("--brand");
		const dotR = Math.max(1.2, 1.8 * dpr);
		for (const city of CITIES) {
			const cx = ((city.lon + 180) / 360) * w;
			const cy = ((90 - city.lat) / 180) * h;
			ctx.beginPath();
			ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
			ctx.fill();
		}
	}, []);

	// First paint, then repaint on theme flips and resizes. The atlas is only
	// touched here; the overlay follows the clock in its own effect.
	useEffect(() => {
		paintAtlas();
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
			raf = window.requestAnimationFrame(() => {
				paintAtlas();
				if (nowRef.current !== null) paintOverlay(nowRef.current);
			});
		});
		observer.observe(box);
		return () => {
			observer.disconnect();
			window.cancelAnimationFrame(raf);
		};
	}, [paintAtlas, paintOverlay, theme]);

	// The overlay follows the clock (and repaints on theme flips).
	useEffect(() => {
		if (now === null) return;
		paintOverlay(now);
	}, [now, paintOverlay, theme]);

	// Aligned to the minute, paused while the tab is hidden, and off under
	// reduced motion (the load-time frame holds).
	useEffect(() => {
		if (!started || reducedMotion) return;
		let timer = 0;
		const arm = () => {
			const delay = TICK_MS - (Date.now() % TICK_MS) + 250;
			timer = window.setTimeout(() => {
				if (document.visibilityState === "visible") setNow(Date.now());
				arm();
			}, delay);
		};
		const onVisibility = () => {
			if (document.visibilityState === "visible") {
				window.clearTimeout(timer);
				setNow(Date.now());
				arm();
			}
		};
		arm();
		document.addEventListener("visibilitychange", onVisibility);
		return () => {
			window.clearTimeout(timer);
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [started, reducedMotion]);

	const solar = now === null ? null : solarPosition(now);
	const asOfUtc = now === null ? null : formatUtcTime(now);
	const mapLabel =
		solar && asOfUtc
			? `World map of the day/night line at ${asOfUtc} UTC: the night side is shaded, the twilight bands run along its edge, and the ring marks the sun's overhead point at ${formatLat(solar.dec)} ${formatLon(solar.lon)}.`
			: "World map of the day/night line, computed in your browser.";

	return (
		<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">The instrument</span>
				<span className="text-label-12-mono text-text-faint">
					{asOfUtc === null ? "computing" : `${asOfUtc} UTC`}
				</span>
			</div>

			<div
				ref={boxRef}
				className="relative mt-4 aspect-[2/1] w-full overflow-hidden rounded-lg border border-alpha-200"
			>
				<canvas ref={atlasRef} role="img" aria-label={mapLabel} className="block h-full w-full" />
				<canvas
					ref={overlayRef}
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 block h-full w-full"
				/>
			</div>

			<div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-label-12 text-text-faint">
				{BAND_ROWS.map((row) => (
					<span key={row.band} className="flex items-center gap-1.5">
						<span
							aria-hidden="true"
							className="inline-block h-3 w-3 rounded-[3px] border border-alpha-200 bg-background"
							style={
								row.band === "day"
									? undefined
									: { backgroundColor: "var(--alpha-600)", opacity: BAND_ALPHAS[row.band] }
							}
						/>
						{row.label}
					</span>
				))}
				<span className="flex items-center gap-1.5">
					<span aria-hidden="true" className="inline-block h-3 w-3 rounded-full border border-brand" />
					the sun overhead
				</span>
			</div>

			<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
				{CITIES.map((city) => {
					const state = now === null ? null : cityState(city, now);
					return (
						<div key={city.name} className="rounded-lg border border-alpha-200 bg-background px-3 py-2">
							<div className="flex items-baseline justify-between gap-2">
								<span className="text-label-13 text-foreground">{city.name}</span>
								<span className="text-label-12-mono text-text-faint">
									{now === null ? "--:--" : formatLocalTime(now, city.zone)}
								</span>
							</div>
							<div className="mt-1 text-label-12-mono text-text-faint">
								{state
									? `${BAND_LABELS[state.band]} · sun ${state.alt >= 0 ? "+" : ""}${state.alt.toFixed(1)} degrees`
									: "computing"}
							</div>
						</div>
					);
				})}
			</div>

			<p className="mt-4 text-copy-13 text-text-faint">
				Computed in your browser from the clock, on a committed outline of Natural Earth&apos;s 110m
				land layer - nothing is fetched, so nothing here can go stale.{" "}
				{reducedMotion
					? "Reduced motion is on: this is a static frame."
					: "The shading refreshes every minute."}
			</p>
		</div>
	);
}
