"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalTheme } from "@/components/theme-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import maskData from "@/data/playground/night-side-mask.json";
import tableJson from "@/data/playground/great-circle-airports.json";
import {
	CRUISE_KMH,
	EARTH_CIRCUMFERENCE_KM,
	EARTH_R_KM,
	TAXI_MIN,
	decodeAirports,
	distanceKm,
	estimateFlightMinutes,
	flatX,
	flatY,
	formatDuration,
	formatKm,
	formatShare,
	globePoint,
	midpoint,
	pathPoints,
	searchAirports,
	toLatLon,
	toVec,
	unwrapLons,
	type Airport,
	type GreatCircleTable,
	type Vec3,
} from "@/lib/playground/great-circle";
import { decodeMask, maskLand } from "@/lib/playground/night-side";

// The instrument: pick two airports and see the shortest path twice - bowed on
// the flat map, straight on a globe turned to the route's midpoint. The flat
// land is the committed Natural Earth dot field the night-side piece draws; the
// globe projects the same mask onto a tangent plane centered on the route. The
// route sweeps in on change (instantly under reduced motion); nothing is
// fetched at runtime.

const MAX_DPR = 2;
const SEGMENTS = 256;
const DRAW_MS = 700;
const SEARCH_LIMIT = 8;

const TABLE = tableJson as unknown as GreatCircleTable;
const AIRPORTS = decodeAirports(TABLE.airports);

function pickAirport(iata: string): Airport {
	const found = AIRPORTS.find((airport) => airport.iata === iata);
	if (!found) throw new Error(`airport not found: ${iata}`);
	return found;
}

const DEFAULT_FROM = pickAirport("IKA");
const DEFAULT_TO = pickAirport("JFK");

const ROUTES: { label: string; from: string; to: string }[] = [
	{ label: "JFK - LHR", from: "JFK", to: "LHR" },
	{ label: "EZE - SYD", from: "EZE", to: "SYD" },
	{ label: "OES - ZQZ (farthest pair)", from: "OES", to: "ZQZ" },
];

function displayName(airport: Airport): string {
	return `${airport.iata} - ${airport.city || airport.name}`;
}

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

function fitCanvas(canvas: HTMLCanvasElement, dpr: number) {
	const rect = canvas.getBoundingClientRect();
	const w = Math.max(1, Math.round(rect.width * dpr));
	const h = Math.max(1, Math.round(rect.height * dpr));
	if (canvas.width !== w) canvas.width = w;
	if (canvas.height !== h) canvas.height = h;
}

/** A longitude outside the map wraps to its visible position on the canvas. */
function wrapX(x: number, w: number): number {
	return ((x % w) + w) % w;
}

function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
}

function globeRadius(w: number, h: number, dpr: number): number {
	return Math.min(w, h) / 2 - Math.max(3, Math.round(3 * dpr));
}

/** The flat map's land: the committed dot field, as the night-side piece draws it. */
function paintFlatLand(canvas: HTMLCanvasElement | null, dpr: number, bytes: Uint8Array) {
	if (!canvas) return;
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
}

/** One polyline, drawn up to `last` points with an optional partial segment. */
function strokePolyline(
	ctx: CanvasRenderingContext2D,
	xs: number[],
	ys: number[],
	last: number,
	frac: number,
	shift: number,
) {
	ctx.beginPath();
	ctx.moveTo(xs[0] + shift, ys[0]);
	for (let i = 1; i <= last; i += 1) ctx.lineTo(xs[i] + shift, ys[i]);
	if (frac > 0 && last < xs.length - 1) {
		const k = last + 1;
		ctx.lineTo(xs[last] + shift + (xs[k] - xs[last]) * frac, ys[last] + (ys[k] - ys[last]) * frac);
	}
	ctx.stroke();
}

/** The flat route: the great-circle polyline, unwrapped and drawn with its edge copies. */
function paintFlatRoute(canvas: HTMLCanvasElement | null, dpr: number, a: Vec3, b: Vec3, progress: number) {
	if (!canvas) return;
	fitCanvas(canvas, dpr);
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	if (w < 2 || h < 2) return;

	const points = pathPoints(a, b, SEGMENTS);
	const lons: number[] = [];
	const lats: number[] = [];
	for (const point of points) {
		const ll = toLatLon(point);
		lons.push(ll.lon);
		lats.push(ll.lat);
	}
	const unwrapped = unwrapLons(lons);
	const xs = unwrapped.map((lon) => flatX(lon, w));
	const ys = lats.map((lat) => flatY(lat, h));

	const t = Math.max(0, Math.min(1, progress)) * SEGMENTS;
	const last = Math.min(Math.floor(t), SEGMENTS);
	const frac = t - last;

	ctx.strokeStyle = tokenColor("--brand");
	ctx.lineWidth = Math.max(1.5, 1.5 * dpr);
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	for (const shift of [-w, 0, w]) strokePolyline(ctx, xs, ys, last, frac, shift);

	ctx.fillStyle = tokenColor("--brand");
	const dotR = Math.max(2, 2.6 * dpr);
	drawDot(ctx, wrapX(xs[0], w), ys[0], dotR);
	if (progress >= 1) drawDot(ctx, wrapX(xs[SEGMENTS], w), ys[SEGMENTS], dotR);
}

/** The globe: outline plus the same land mask projected onto the centered hemisphere. */
function paintGlobe(canvas: HTMLCanvasElement | null, dpr: number, center: Vec3, bytes: Uint8Array) {
	if (!canvas) return;
	fitCanvas(canvas, dpr);
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	if (w < 2 || h < 2) return;
	const cx = w / 2;
	const cy = h / 2;
	const radius = globeRadius(w, h, dpr);

	ctx.strokeStyle = tokenColor("--alpha-500");
	ctx.lineWidth = Math.max(1, Math.round(dpr));
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, Math.PI * 2);
	ctx.stroke();

	ctx.fillStyle = tokenColor("--alpha-600");
	const { cols, rows } = maskData;
	const dotR = Math.max(1, 1.15 * dpr);
	for (let j = 0; j < rows; j += 1) {
		const lat = 90 - ((j + 0.5) / rows) * 180;
		for (let i = 0; i < cols; i += 1) {
			if (!maskLand(bytes, cols, i, j)) continue;
			const lon = ((i + 0.5) / cols) * 360 - 180;
			const p = globePoint(toVec(lat, lon), center, radius);
			if (!p.front) continue;
			ctx.beginPath();
			ctx.arc(cx + p.x, cy + p.y, dotR, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}

/** The globe route: straight through the center when the globe faces the midpoint. */
function paintGlobeRoute(
	canvas: HTMLCanvasElement | null,
	dpr: number,
	center: Vec3,
	a: Vec3,
	b: Vec3,
	progress: number,
) {
	if (!canvas) return;
	fitCanvas(canvas, dpr);
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	if (w < 2 || h < 2) return;

	const cx = w / 2;
	const cy = h / 2;
	const radius = globeRadius(w, h, dpr);
	const points = pathPoints(a, b, SEGMENTS);
	const xs: number[] = [];
	const ys: number[] = [];
	for (const point of points) {
		const p = globePoint(point, center, radius);
		xs.push(cx + p.x);
		ys.push(cy + p.y);
	}

	const t = Math.max(0, Math.min(1, progress)) * SEGMENTS;
	const last = Math.min(Math.floor(t), SEGMENTS);
	const frac = t - last;

	ctx.strokeStyle = tokenColor("--brand");
	ctx.lineWidth = Math.max(1.5, 1.5 * dpr);
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	strokePolyline(ctx, xs, ys, last, frac, 0);

	ctx.fillStyle = tokenColor("--brand");
	const dotR = Math.max(2, 2.6 * dpr);
	drawDot(ctx, xs[0], ys[0], dotR);
	if (progress >= 1) drawDot(ctx, xs[SEGMENTS], ys[SEGMENTS], dotR);
}

function AirportPicker({
	id,
	label,
	value,
	onSelect,
}: {
	id: string;
	label: string;
	value: Airport;
	onSelect: (airport: Airport) => void;
}) {
	const display = displayName(value);
	// The draft is what the user is typing, tagged with the selection it was
	// typed against. A route chip changes the value, the tag stops matching,
	// and the field falls back to the new selection - no syncing needed.
	const [draft, setDraft] = useState<{ text: string; iata: string } | null>(null);
	const [open, setOpen] = useState(false);
	const listId = `${id}-list`;

	const text = draft && draft.iata === value.iata ? draft.text : display;
	const searching = open && text.trim().length > 0 && text.trim() !== display;
	const results = useMemo(
		() => (searching ? searchAirports(AIRPORTS, text, SEARCH_LIMIT) : []),
		[searching, text],
	);

	const select = (airport: Airport) => {
		onSelect(airport);
		setDraft(null);
		setOpen(false);
	};

	return (
		<div className="relative flex flex-col gap-1.5">
			<label htmlFor={id} className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
				{label}
			</label>
			<input
				id={id}
				type="text"
				role="combobox"
				aria-expanded={searching}
				aria-controls={listId}
				aria-autocomplete="list"
				autoComplete="off"
				spellCheck={false}
				value={text}
				placeholder="Search a city, airport, or code"
				onChange={(event) => {
					setDraft({ text: event.target.value, iata: value.iata });
					setOpen(true);
				}}
				onFocus={(event) => event.target.select()}
				onBlur={() => {
					setOpen(false);
					setDraft(null);
				}}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						setOpen(false);
						setDraft(null);
					} else if (event.key === "Enter" && searching && results.length > 0) {
						event.preventDefault();
						select(results[0]);
					}
				}}
				className="h-11 w-full rounded-xl border border-input bg-background px-4 text-copy-14 text-foreground placeholder:text-text-faint focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
			/>
			{searching ? (
				<div
					id={listId}
					className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-card"
				>
					{results.length > 0 ? (
						<ul className="max-h-72 overflow-auto py-1">
							{results.map((airport) => (
								<li key={airport.iata}>
									<button
										type="button"
										onMouseDown={(event) => event.preventDefault()}
										onClick={() => select(airport)}
										className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
									>
										<span className="text-copy-14 text-foreground">{displayName(airport)}</span>
										<span className="text-label-12-mono text-text-faint">
											{airport.name} · {airport.cc}
										</span>
									</button>
								</li>
							))}
						</ul>
					) : (
						<p className="px-3 py-2 text-copy-13 text-text-faint">No matches.</p>
					)}
				</div>
			) : null}
		</div>
	);
}

function ReadoutTile({ label, value, hint }: { label: string; value: string; hint: string }) {
	return (
		<div className="rounded-lg border border-alpha-200 bg-background px-3 py-2.5">
			<div className="text-label-12 uppercase tracking-[0.14em] text-text-faint">{label}</div>
			<div className="mt-1 text-heading-20 text-foreground">{value}</div>
			<div className="mt-0.5 text-copy-13 text-text-faint">{hint}</div>
		</div>
	);
}

export function GreatCircle() {
	const { theme } = useLocalTheme();
	const reducedMotion = useReducedMotion();

	const [from, setFrom] = useState<Airport>(DEFAULT_FROM);
	const [to, setTo] = useState<Airport>(DEFAULT_TO);

	const route = useMemo(() => {
		const a = toVec(from.lat, from.lon);
		const b = toVec(to.lat, to.lon);
		return { a, b, center: midpoint(a, b), km: distanceKm(a, b) };
	}, [from, to]);
	const routeKey = `${from.iata} - ${to.iata}`;

	const flatBoxRef = useRef<HTMLDivElement | null>(null);
	const globeBoxRef = useRef<HTMLDivElement | null>(null);
	const flatLandRef = useRef<HTMLCanvasElement | null>(null);
	const flatRouteRef = useRef<HTMLCanvasElement | null>(null);
	const globeLandRef = useRef<HTMLCanvasElement | null>(null);
	const globeRouteRef = useRef<HTMLCanvasElement | null>(null);

	const bytes = useMemo(() => decodeMask(maskData.bits), []);

	const routeRef = useRef(route);
	const animRef = useRef<number | null>(null);
	const paintedRef = useRef(false);
	const lastKeyRef = useRef<string | null>(null);

	// The latest route, synced before any paint effect below (declaration order).
	useEffect(() => {
		routeRef.current = route;
	}, [route]);

	const paintLand = useCallback(() => {
		const dpr = currentDpr();
		paintFlatLand(flatLandRef.current, dpr, bytes);
		paintGlobe(globeLandRef.current, dpr, routeRef.current.center, bytes);
	}, [bytes]);

	const paintRoute = useCallback((progress: number) => {
		const dpr = currentDpr();
		const r = routeRef.current;
		paintFlatRoute(flatRouteRef.current, dpr, r.a, r.b, progress);
		paintGlobeRoute(globeRouteRef.current, dpr, r.center, r.a, r.b, progress);
	}, []);

	const cancelDraw = useCallback(() => {
		if (animRef.current !== null) {
			window.cancelAnimationFrame(animRef.current);
			animRef.current = null;
		}
	}, []);

	const startDraw = useCallback(
		(instant: boolean) => {
			cancelDraw();
			if (instant || prefersReducedMotion()) {
				paintRoute(1);
				return;
			}
			const t0 = performance.now();
			const frame = (t: number) => {
				const p = Math.min(1, (t - t0) / DRAW_MS);
				paintRoute(1 - Math.pow(1 - p, 3));
				animRef.current = p < 1 ? window.requestAnimationFrame(frame) : null;
			};
			animRef.current = window.requestAnimationFrame(frame);
		},
		[cancelDraw, paintRoute],
	);

	const sweep = useCallback(() => {
		paintLand();
		startDraw(false);
	}, [paintLand, startDraw]);

	const settle = useCallback(() => {
		paintLand();
		cancelDraw();
		paintRoute(1);
	}, [paintLand, cancelDraw, paintRoute]);

	// First paint and route changes sweep the path in; theme flips, reduced-motion
	// flips, and anything else land on the final frame. The route ref sync above
	// must run first.
	useEffect(() => {
		const changed = lastKeyRef.current !== routeKey;
		lastKeyRef.current = routeKey;
		if (!paintedRef.current || changed) {
			paintedRef.current = true;
			sweep();
		} else {
			settle();
		}
	}, [routeKey, theme, reducedMotion, sweep, settle]);

	// Resizes repaint everything on the final frame.
	useEffect(() => {
		const boxes = [flatBoxRef.current, globeBoxRef.current].filter(
			(box): box is HTMLDivElement => box !== null,
		);
		if (boxes.length === 0) return;
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
			raf = window.requestAnimationFrame(() => settle());
		});
		for (const box of boxes) observer.observe(box);
		return () => {
			observer.disconnect();
			window.cancelAnimationFrame(raf);
		};
	}, [settle]);

	useEffect(() => () => cancelDraw(), [cancelDraw]);

	const kmText = formatKm(route.km);
	const timeText = formatDuration(estimateFlightMinutes(route.km));
	const shareText = formatShare(route.km);

	const flatLabel = `World map with the great-circle route from ${from.iata} to ${to.iata} drawn on it: the path bows across the flat map.`;
	const globeLabel = `Globe centered on the midpoint of the route from ${from.iata} to ${to.iata}: the same path is a straight line.`;

	return (
		<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">The instrument</span>
				<span className="text-label-12-mono text-text-faint">
					{from.iata} to {to.iata}
				</span>
			</div>

			<div className="mt-4 grid gap-3 sm:grid-cols-2">
				<AirportPicker id="from-airport" label="From" value={from} onSelect={setFrom} />
				<AirportPicker id="to-airport" label="To" value={to} onSelect={setTo} />
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-2">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">Try</span>
				{ROUTES.map((routeChip) => {
					const active = from.iata === routeChip.from && to.iata === routeChip.to;
					return (
						<button
							key={routeChip.label}
							type="button"
							onClick={() => {
								setFrom(pickAirport(routeChip.from));
								setTo(pickAirport(routeChip.to));
							}}
							aria-pressed={active}
							className={cn(
								"rounded-full border px-3 py-1 text-copy-13 transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]",
								active
									? "border-brand/60 bg-brand/10 text-foreground"
									: "border-border text-text-muted hover:border-alpha-500 hover:text-foreground",
							)}
						>
							{routeChip.label}
						</button>
					);
				})}
			</div>

			<div
				ref={flatBoxRef}
				className="relative mt-4 aspect-[2/1] w-full overflow-hidden rounded-lg border border-alpha-200"
			>
				<canvas ref={flatLandRef} role="img" aria-label={flatLabel} className="block h-full w-full" />
				<canvas
					ref={flatRouteRef}
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 block h-full w-full"
				/>
			</div>
			<p className="mt-2 text-copy-13 text-text-faint">
				As a map draws it: the shortest path bows. The straight line across the map is not the short way
				around.
			</p>

			<div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,320px)_minmax(0,1fr)] sm:items-start">
				<div>
					<div
						ref={globeBoxRef}
						className="relative aspect-square w-full overflow-hidden rounded-lg border border-alpha-200"
					>
						<canvas ref={globeLandRef} role="img" aria-label={globeLabel} className="block h-full w-full" />
						<canvas
							ref={globeRouteRef}
							aria-hidden="true"
							className="pointer-events-none absolute inset-0 block h-full w-full"
						/>
					</div>
					<p className="mt-2 text-copy-13 text-text-faint">
						As the Earth draws it: turn the globe to the route&apos;s midpoint and the same path is a
						straight line.
					</p>
				</div>
				<div className="flex flex-col gap-2">
					<p className="text-copy-13 text-text-muted">
						{from.name} ({from.iata}) to {to.name} ({to.iata}).
					</p>
					<ReadoutTile
						label="Distance"
						value={kmText}
						hint={`great circle on a sphere, R = ${EARTH_R_KM.toLocaleString("en-US", { maximumFractionDigits: 4 })} km`}
					/>
					<ReadoutTile
						label="Flight time"
						value={timeText}
						hint={`distance / ${CRUISE_KMH} km/h plus ${TAXI_MIN} min - an estimate`}
					/>
					<ReadoutTile
						label="Circumference share"
						value={shareText}
						hint={`of the ${Math.round(EARTH_CIRCUMFERENCE_KM).toLocaleString("en-US")} km circumference`}
					/>
				</div>
			</div>

			<p className="mt-4 text-copy-13 text-text-faint">
				Distances are great circles on a spherical Earth. Flight time: distance divided by {CRUISE_KMH}{" "}
				km/h, plus {TAXI_MIN} minutes of taxi - an estimate, not a schedule. The airport table is{" "}
				{TABLE.count.toLocaleString("en-US")} airports with scheduled service from OurAirports (public
				domain), generated {TABLE.fetched}. Nothing is fetched at runtime.
				{reducedMotion ? " Reduced motion is on: the route is drawn as a still frame." : ""}
			</p>
		</div>
	);
}
