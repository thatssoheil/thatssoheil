// The logistic map, x -> r*x*(1-x): the pure core of the instrument.
// One equation, one dial, and a walk from order into chaos. This module is the
// deterministic heart: iteration, the bounded cycle detector that powers the
// live readout, and the landmark catalogue pinned to the literature (May 1976;
// Feigenbaum 1978; Li-Yorke 1975). Nothing is fetched, ever.

/** Generic seed: pi/10. Avoids the x0 = 0.5 preimage chain that collapses at r = 4. */
export const SEED = Math.PI / 10;

export const R_MIN = 2.4;
export const R_MAX = 4.0;

/** The universal rate of period doubling, as published (Feigenbaum 1978). */
export const FEIGENBAUM_DELTA = "4.669201609102990";

export interface CycleConfig {
	burn: number;
	keep: number;
	tol: number;
	maxP: number;
}

// Two-stage readout: the fast config runs while the dial moves (about 0.1 ms
// per call); the deep one runs once the dial settles (about 13 ms), where the
// ghost bands below onsets shrink under any slider precision. Both measured in
// the lab's vetting study (lab/vetting/logistic-map-probes/cycle-check*.mjs).
export const CYCLE_FAST: CycleConfig = { burn: 5000, keep: 1024, tol: 1e-6, maxP: 64 };
export const CYCLE_DEEP: CycleConfig = { burn: 4194304, keep: 1024, tol: 1e-6, maxP: 64 };

/**
 * Bounded cycle detector: burn `burn` iterations, keep a window, then find the
 * smallest period p <= maxP where every kept point repeats within `tol`.
 * Returns -1 when no cycle is resolved at this burn and tolerance ("no stable
 * cycle" at the readout's honesty level).
 */
export function boundedCycle(r: number, config: CycleConfig = CYCLE_FAST, x0: number = SEED): number {
	const { burn, keep, tol, maxP } = config;
	let x = x0;
	for (let i = 0; i < burn; i += 1) x = r * x * (1 - x);
	const pts = new Float64Array(keep);
	for (let i = 0; i < keep; i += 1) {
		x = r * x * (1 - x);
		pts[i] = x;
	}
	for (let p = 1; p <= maxP; p += 1) {
		let ok = true;
		for (let i = 0; i + p < keep; i += 1) {
			if (Math.abs(pts[i] - pts[i + p]) > tol) {
				ok = false;
				break;
			}
		}
		if (ok) return p;
	}
	return -1;
}

/** The last `count` values of the orbit after a burn-in: the orbit strip. */
export function orbitWindow(r: number, burn: number, count: number, x0: number = SEED): number[] {
	let x = x0;
	for (let i = 0; i < burn; i += 1) x = r * x * (1 - x);
	const out = new Array<number>(count);
	for (let i = 0; i < count; i += 1) {
		x = r * x * (1 - x);
		out[i] = x;
	}
	return out;
}

/**
 * The distinct orbit values at this r (deduplicated within `dedupe`), for the
 * marker column's attractor dots: period 2 gives two values, chaos a spread.
 */
export function attractorValues(
	r: number,
	burn: number,
	count: number,
	dedupe = 2e-3,
	x0: number = SEED,
): number[] {
	let x = x0;
	for (let i = 0; i < burn; i += 1) x = r * x * (1 - x);
	const seen: number[] = [];
	for (let i = 0; i < count; i += 1) {
		x = r * x * (1 - x);
		if (!seen.some((value) => Math.abs(value - x) < dedupe)) seen.push(x);
	}
	return seen;
}

export interface Landmark {
	slug: string;
	name: string;
	r: number;
	exact?: string;
	note: string;
}

/** The stops on the dial, pinned to the literature (see the vetting report). */
export const LANDMARKS: readonly Landmark[] = [
	{ slug: "first-split", name: "First split", r: 3, exact: "3", note: "period 2 is born" },
	{ slug: "second-split", name: "Second split", r: 1 + Math.sqrt(6), exact: "1 + sqrt(6)", note: "period 4" },
	{
		slug: "cascade",
		name: "Cascade completes",
		r: 3.569945672,
		note: "chaos begins",
	},
	{
		slug: "order-returns",
		name: "Order returns",
		r: 1 + Math.sqrt(8),
		exact: "1 + 2*sqrt(2)",
		note: "a period-3 window",
	},
];

export interface OnsetRow {
	name: string;
	r: string;
	exact?: string;
}

/** The period-doubling cascade and the window, as printed by the literature. */
export const ONSET_TABLE: readonly OnsetRow[] = [
	{ name: "Period 2", r: "3", exact: "3" },
	{ name: "Period 4", r: "3.449489742783178", exact: "1 + sqrt(6)" },
	{ name: "Period 8", r: "3.544090359551922" },
	{ name: "Period 16", r: "3.564407266095" },
	{ name: "Period 32", r: "3.568759419543" },
	{ name: "Accumulation", r: "3.569945672" },
	{ name: "Period 3 window", r: "3.8284271247461903", exact: "1 + 2*sqrt(2)" },
];
