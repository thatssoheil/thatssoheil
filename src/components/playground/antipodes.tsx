"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalTheme } from "@/components/theme-provider";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import maskData from "@/data/playground/night-side-mask.json";
import tableJson from "@/data/playground/antipode-places.json";
import {
	ANTIPODE_KM,
	EARTH_D_KM,
	LONGEST_RANGE_KM,
	LONGEST_RANGE_SHARE,
	antipode,
	decodeMaskBits,
	decodePlaces,
	formatKm,
	formatLatLon,
	formatPop,
	maskLandAt,
	nearestPlace,
	searchPlaces,
	type AntipodeTable,
	type MaskGrid,
	type Place,
} from "@/lib/playground/antipode";

// The instrument: pick a place and see the exact other side of the Earth -
// land or open ocean, the nearest place, and the facts every pair shares (the
// same 20,015 km apart over the surface, 12,742 km straight through, the
// 12-hour solar flip). Land is the committed Natural Earth dot field the
// night-side and great-circle pieces draw; the dashed link and the two markers
// are the only moving ink. Static data, nothing fetched at runtime.

const MAX_DPR = 2;
const DRAW_MS = 700;
const SEARCH_LIMIT = 8;

const TABLE = tableJson as unknown as AntipodeTable;
const PLACES = decodePlaces(TABLE.places);
const GRID: MaskGrid = { step: maskData.step, cols: maskData.cols, rows: maskData.rows };

function pickPlace(name: string): Place {
	const found = PLACES.find((place) => place.name === name);
	if (!found) throw new Error(`place not found: ${name}`);
	return found;
}

const DEFAULT_PLACE = pickPlace("Tehran");

// Chip pairs verified at build time: in each pair the counterpart is the
// nearest place to the first place's antipode (1.3 / 85.9 / 87.8 km).
const CHIPS: { label: string; place: string }[] = [
	{ label: "Hancheng - Malargüe (1.3 km)", place: "Hancheng" },
	{ label: "Taipei - Asunción (85.9 km)", place: "Taipei" },
	{ label: "Christchurch - La Coruña (87.8 km)", place: "Christchurch" },
];

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

/** The flat map's land: the committed dot field, as the night-side piece draws it. */
function paintAtlas(canvas: HTMLCanvasElement | null, dpr: number, bytes: Uint8Array) {
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
			if (!maskLandAt(bytes, GRID, 90 - (j + 0.5) * (180 / rows), -180 + (i + 0.5) * (360 / cols))) continue;
			const x = Math.round((i + 0.5) * cellW - dotW / 2);
			const y = Math.round((j + 0.5) * cellH - dotH / 2);
			ctx.fillRect(x, y, dotW, dotH);
		}
	}
}

/** The link line and the two markers, drawn up to `progress`. */
function paintOverlay(
	canvas: HTMLCanvasElement | null,
	dpr: number,
	place: Place,
	anti: { lat: number; lon: number },
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

	const p = Math.max(0, Math.min(1, progress));
	const homeX = ((place.lon + 180) / 360) * w;
	const homeY = ((90 - place.lat) / 180) * h;
	const antiX = ((anti.lon + 180) / 360) * w;
	const antiY = ((90 - anti.lat) / 180) * h;
	const ink = tokenColor("--brand");

	// The dashed link, drawn from the place toward the antipode.
	ctx.strokeStyle = ink;
	ctx.lineWidth = Math.max(1, 1.2 * dpr);
	ctx.setLineDash([5 * dpr, 5 * dpr]);
	ctx.globalAlpha = 0.5;
	for (const shift of [-w, 0, w]) {
		ctx.beginPath();
		ctx.moveTo(homeX + shift, homeY);
		ctx.lineTo(homeX + shift + (antiX - homeX) * p, homeY + (antiY - homeY) * p);
		ctx.stroke();
	}
	ctx.setLineDash([]);
	ctx.globalAlpha = 1;

	// The place: a solid dot inside a soft ring.
	ctx.fillStyle = ink;
	ctx.strokeStyle = ink;
	ctx.lineWidth = Math.max(1, 1.3 * dpr);
	for (const shift of [-w, 0, w]) {
		const x = homeX + shift;
		ctx.globalAlpha = 0.4;
		ctx.beginPath();
		ctx.arc(x, homeY, Math.max(4, 5.5 * dpr), 0, Math.PI * 2);
		ctx.stroke();
		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.arc(x, homeY, Math.max(2.2, 3 * dpr), 0, Math.PI * 2);
		ctx.fill();
	}

	// The antipode: a crosshair that lands when the link arrives.
	const markAlpha = p < 0.8 ? 0 : Math.min(1, (p - 0.8) / 0.2);
	if (markAlpha > 0) {
		ctx.strokeStyle = ink;
		ctx.fillStyle = ink;
		ctx.lineWidth = Math.max(1, 1.5 * dpr);
		ctx.globalAlpha = markAlpha;
		const r = Math.max(3.5, 5 * dpr);
		for (const shift of [-w, 0, w]) {
			const x = antiX + shift;
			ctx.beginPath();
			ctx.arc(x, antiY, r, 0, Math.PI * 2);
			ctx.stroke();
			const t0 = r + 1.5 * dpr;
			const t1 = r + 5 * dpr;
			for (const [dx, dy] of [
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
			] as const) {
				ctx.beginPath();
				ctx.moveTo(x + dx * t0, antiY + dy * t0);
				ctx.lineTo(x + dx * t1, antiY + dy * t1);
				ctx.stroke();
			}
			ctx.beginPath();
			ctx.arc(x, antiY, Math.max(1.4, 1.8 * dpr), 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}
}

function PlacePicker({
	id,
	label,
	value,
	onSelect,
}: {
	id: string;
	label: string;
	value: Place;
	onSelect: (place: Place) => void;
}) {
	const display = `${value.name} - ${value.country}`;
	// The draft is what the user is typing, tagged with the selection it was
	// typed against. A chip changes the value, the tag stops matching, and the
	// field falls back to the new selection - no syncing needed.
	const [draft, setDraft] = useState<{ text: string; key: string } | null>(null);
	const [open, setOpen] = useState(false);
	const listId = `${id}-list`;

	const key = `${value.name}|${value.country}|${value.lat}|${value.lon}`;
	const text = draft && draft.key === key ? draft.text : display;
	const searching = open && text.trim().length > 0 && text.trim() !== display;
	const results = useMemo(
		() => (searching ? searchPlaces(PLACES, text, SEARCH_LIMIT) : []),
		[searching, text],
	);

	const select = (place: Place) => {
		onSelect(place);
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
				placeholder="Search a city, town, or country"
				onChange={(event) => {
					setDraft({ text: event.target.value, key });
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
							{results.map((place) => (
								<li key={`${place.lat}|${place.lon}`}>
									<button
										type="button"
										onMouseDown={(event) => event.preventDefault()}
										onClick={() => select(place)}
										className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
									>
										<span className="text-copy-14 text-foreground">{place.name}</span>
										<span className="text-label-12-mono text-text-faint">
											{place.country} · {formatPop(place.pop)}
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

export function Antipodes() {
	const { theme } = useLocalTheme();
	const reducedMotion = useReducedMotion();

	const [place, setPlace] = useState<Place>(DEFAULT_PLACE);

	const bytes = useMemo(() => decodeMaskBits(maskData.bits), []);
	const data = useMemo(() => {
		const anti = antipode(place.lat, place.lon);
		return {
			place,
			anti,
			land: maskLandAt(bytes, GRID, anti.lat, anti.lon),
			near: nearestPlace(PLACES, anti.lat, anti.lon),
		};
	}, [place, bytes]);
	const placeKey = `${place.name}|${place.country}|${place.lat}|${place.lon}`;

	const boxRef = useRef<HTMLDivElement | null>(null);
	const atlasRef = useRef<HTMLCanvasElement | null>(null);
	const overlayRef = useRef<HTMLCanvasElement | null>(null);

	const dataRef = useRef(data);
	const animRef = useRef<number | null>(null);
	const paintedRef = useRef(false);
	const lastKeyRef = useRef<string | null>(null);

	// The latest data, synced before any paint effect below (declaration order).
	useEffect(() => {
		dataRef.current = data;
	}, [data]);

	const paintLand = useCallback(() => {
		paintAtlas(atlasRef.current, currentDpr(), bytes);
	}, [bytes]);

	const paintFrame = useCallback((progress: number) => {
		const d = dataRef.current;
		paintOverlay(overlayRef.current, currentDpr(), d.place, d.anti, progress);
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
				paintFrame(1);
				return;
			}
			const t0 = performance.now();
			const frame = (t: number) => {
				const p = Math.min(1, (t - t0) / DRAW_MS);
				paintFrame(1 - Math.pow(1 - p, 3));
				animRef.current = p < 1 ? window.requestAnimationFrame(frame) : null;
			};
			animRef.current = window.requestAnimationFrame(frame);
		},
		[cancelDraw, paintFrame],
	);

	const sweep = useCallback(() => {
		paintLand();
		startDraw(false);
	}, [paintLand, startDraw]);

	const settle = useCallback(() => {
		paintLand();
		cancelDraw();
		paintFrame(1);
	}, [paintLand, cancelDraw, paintFrame]);

	// First paint and place changes sweep the link in; theme flips, reduced
	// motion flips, and anything else land on the final frame.
	useEffect(() => {
		const changed = lastKeyRef.current !== placeKey;
		lastKeyRef.current = placeKey;
		if (!paintedRef.current || changed) {
			paintedRef.current = true;
			sweep();
		} else {
			settle();
		}
	}, [placeKey, theme, reducedMotion, sweep, settle]);

	// Resizes repaint everything on the final frame.
	useEffect(() => {
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
			raf = window.requestAnimationFrame(() => settle());
		});
		observer.observe(box);
		return () => {
			observer.disconnect();
			window.cancelAnimationFrame(raf);
		};
	}, [settle]);

	useEffect(() => () => cancelDraw(), [cancelDraw]);

	const near = data.near;
	const antiText = formatLatLon(data.anti.lat, data.anti.lon);
	const landText = data.land ? "Land" : "Open ocean";
	const diameterText = `${Math.round(EARTH_D_KM).toLocaleString("en-US")} km`;
	const surfaceText = `${Math.round(ANTIPODE_KM).toLocaleString("en-US")} km`;
	const rangePercent = `${Math.round(LONGEST_RANGE_SHARE * 100)}%`;
	const mapLabel = `World map with ${place.name} marked and its antipode at ${antiText}.`;

	return (
		<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">The instrument</span>
				<span className="text-label-12-mono text-text-faint">
					{place.name} · {place.country}
				</span>
			</div>

			<div className="mt-4">
				<PlacePicker id="antipode-place" label="Place" value={place} onSelect={setPlace} />
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-2">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">Try</span>
				{CHIPS.map((chip) => {
					const active = place.name === chip.place;
					return (
						<button
							key={chip.label}
							type="button"
							onClick={() => setPlace(pickPlace(chip.place))}
							aria-pressed={active}
							className={cn(
								"rounded-full border px-3 py-1 text-copy-13 transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]",
								active
									? "border-brand/60 bg-brand/10 text-foreground"
									: "border-border text-text-muted hover:border-alpha-500 hover:text-foreground",
							)}
						>
							{chip.label}
						</button>
					);
				})}
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
			<p className="mt-2 text-copy-13 text-text-faint">
				The solid dot is {place.name}; the crosshair is its antipode - the exact other side of the Earth.
				The dashed line links them on the map; the real way through is the straight diameter.
			</p>

			<div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
				<ReadoutTile
					label="Lands on"
					value={landText}
					hint={`at ${antiText} - the exact opposite of ${place.name}`}
				/>
				<ReadoutTile
					label="Nearest place"
					value={near ? near.place.name : "unknown"}
					hint={near ? `${near.place.country} - ${formatKm(near.km)} away` : "no places in the table"}
				/>
				<ReadoutTile
					label="Through the Earth"
					value={diameterText}
					hint="straight through the center - the diameter"
				/>
				<ReadoutTile
					label="Around the surface"
					value={surfaceText}
					hint="half the circumference - the same for every pair"
				/>
				<ReadoutTile label="Solar clock" value="12 h" hint="solar noon at one antipode is solar midnight at the other" />
			</div>

			<p className="mt-4 text-copy-13 text-text-faint">
				Every antipode pair sits exactly as far apart as every other - half the circumference. No airliner can
				fly a full-load nonstop between them: the longest-range jet today (an A350-900ULR,{" "}
				{LONGEST_RANGE_KM.toLocaleString("en-US")} km) covers about {rangePercent} of the distance. The place
				table is {TABLE.count.toLocaleString("en-US")} populated places from Natural Earth (public domain);
				land and ocean come from the same grid the map draws. Nothing is fetched at runtime, so nothing here
				goes stale.
				{reducedMotion ? " Reduced motion is on: the link is drawn as a still frame." : ""}
			</p>
		</div>
	);
}
