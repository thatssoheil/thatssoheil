// Moon watch: the moon right now - the phase, how much of the disc is lit,
// the distance and angular size, and the next new / first quarter / full /
// last quarter instants - everything computed from the clock. Nothing is
// fetched at runtime, so nothing goes stale; the "as of" label is the
// render time.
//
// The lunar series is a port of Meeus, Astronomical Algorithms (2nd ed),
// chapter 47 (tables 47.A and 47.B, transcribed via the astronomia
// reference module, MIT); the solar series is the same low-precision set
// the night-side piece uses. Phase instants follow the USNO convention
// (geocentric ecliptic-longitude conjunctions, UT1) and carry
// TT - UT = 69.184 s.
//
// Verified at build time against fresh sources (lab/qa/moon-watch-probes/):
// exact against the astronomia reference on fresh instants (3.6e-11 deg);
// against JPL Horizons (DE441) over a fresh series: illumination within
// 0.005 percentage points, distance within 40 km (about 0.01 percent),
// phase angle within 0.004 deg; the event finder below matches all 8 fresh
// USNO events within 0.84 min; perigee and apogee instants land within
// about 10 min of JPL's refined extremes.
//
// Conventions labeled on the page: distances are geocentric (center to
// center); angular size uses the moon's mean radius of 1,737.4 km; the
// phase name is the interval the moon is in - it changes at the exact
// conjunction instants, not at local midnight. The distance swings about
// 13 percent every month (roughly 356,000 to 407,000 km), which is why
// some full moons read "super".

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/** Kilometers in one astronomical unit. */
export const AU_KM = 149597870.7;

/** The moon's mean radius used for angular size, km. */
export const MOON_R_KM = 1737.4;

/** TT - UT1 in 2026: 37 s (TAI - UTC) + 32.184 s; DUT1 stays under 0.9 s. */
export const TT_UT_S = 69.184;

/** The recompute cadence: the moon moves about half a degree per hour. */
export const TICK_MS = 60_000;

function norm360(x: number): number {
	return ((x % 360) + 360) % 360;
}

/** Signed difference a - b, wrapped to (-180, 180]. */
function angDiff(a: number, b: number): number {
	let d = (a - b) % 360;
	if (d > 180) d -= 360;
	if (d < -180) d += 360;
	return d;
}

function horner(x: number, ...c: number[]): number {
	let y = c[c.length - 1];
	for (let i = c.length - 2; i >= 0; i -= 1) y = y * x + c[i];
	return y;
}

// Meeus tables 47.A / 47.B (Astronomical Algorithms, 2nd ed), transcribed
// via the astronomia reference (MIT). Row: [D, M, M', F, sin, cos] for
// 47.A and [D, M, M', F, sin] for 47.B. Terms with M carry the
// eccentricity factor E (E^2 for 2M).
const TA: number[][] = [
	[0, 0, 1, 0, 6288774, -20905355], [2, 0, -1, 0, 1274027, -3699111], [2, 0, 0, 0, 658314, -2955968], [0, 0, 2, 0, 213618, -569925],
	[0, 1, 0, 0, -185116, 48888], [0, 0, 0, 2, -114332, -3149], [2, 0, -2, 0, 58793, 246158], [2, -1, -1, 0, 57066, -152138],
	[2, 0, 1, 0, 53322, -170733], [2, -1, 0, 0, 45758, -204586], [0, 1, -1, 0, -40923, -129620], [1, 0, 0, 0, -34720, 108743],
	[0, 1, 1, 0, -30383, 104755], [2, 0, 0, -2, 15327, 10321], [0, 0, 1, 2, -12528, 0], [0, 0, 1, -2, 10980, 79661],
	[4, 0, -1, 0, 10675, -34782], [0, 0, 3, 0, 10034, -23210], [4, 0, -2, 0, 8548, -21636], [2, 1, -1, 0, -7888, 24208],
	[2, 1, 0, 0, -6766, 30824], [1, 0, -1, 0, -5163, -8379], [1, 1, 0, 0, 4987, -16675], [2, -1, 1, 0, 4036, -12831],
	[2, 0, 2, 0, 3994, -10445], [4, 0, 0, 0, 3861, -11650], [2, 0, -3, 0, 3665, 14403], [0, 1, -2, 0, -2689, -7003],
	[2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 10056], [1, 0, 1, 0, -2348, 6322], [2, -2, 0, 0, 2236, -9884],
	[0, 1, 2, 0, -2120, 5751], [0, 2, 0, 0, -2069, 0], [2, -2, -1, 0, 2048, -4950], [2, 0, 1, -2, -1773, 4130],
	[2, 0, 0, 2, -1595, 0], [4, -1, -1, 0, 1215, -3958], [0, 0, 2, 2, -1110, 0], [3, 0, -1, 0, -892, 3258],
	[2, 1, 1, 0, -810, 2616], [4, -1, -2, 0, 759, -1897], [0, 2, -1, 0, -713, -2117], [2, 2, -1, 0, -700, 2354],
	[2, 1, -2, 0, 691, 0], [2, -1, 0, -2, 596, 0], [4, 0, 1, 0, 549, -1423], [0, 0, 4, 0, 537, -1117],
	[4, -1, 0, 0, 520, -1571], [1, 0, -2, 0, -487, -1739], [2, 1, 0, -2, -399, 0], [0, 0, 2, -2, -381, -4421],
	[1, 1, 1, 0, 351, 0], [3, 0, -2, 0, -340, 0], [4, 0, -3, 0, 330, 0], [2, -1, 2, 0, 327, 0],
	[0, 2, 1, 0, -323, 1165], [1, 1, -1, 0, 299, 0], [2, 0, 3, 0, 294, 0], [2, 0, -1, -2, 0, 8752],
];
const TB: number[][] = [
	[0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237],
	[2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271], [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198],
	[2, 0, 1, -1, 9266], [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324],
	[2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359], [2, -1, -1, 1, 2463], [2, -1, 0, 1, 2211],
	[2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870], [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794],
	[0, 0, 0, 3, -1749], [0, 1, -1, 1, -1565], [1, 0, 0, 1, -1491], [0, 1, 1, 1, -1475],
	[0, 1, 1, -1, -1410], [0, 1, 0, -1, -1344], [1, 0, 0, -1, -1335], [0, 0, 3, 1, 1107],
	[4, 0, 0, -1, 1021], [4, 0, -1, 1, 833], [0, 0, 1, -3, 777], [4, 0, -2, 1, 671],
	[2, 0, 0, -3, 607], [2, 0, 2, -1, 596], [2, -1, 1, -1, 491], [2, 0, -2, 1, -451],
	[0, 0, 3, -1, 439], [2, 0, 2, 1, 422], [2, 0, -3, -1, 421], [2, 1, -1, 1, -366],
	[2, 1, 0, 1, -351], [4, 0, 0, 1, 331], [2, -1, 1, 1, 315], [2, -2, 0, -1, 302],
	[0, 0, 1, 3, -283], [2, 1, 1, -1, -229], [1, 1, 0, -1, 223], [1, 1, 0, 1, 223],
	[0, 1, -2, -1, -220], [2, 1, -1, -1, -220], [1, 0, 1, 1, -185], [2, -1, -2, -1, 181],
	[0, 1, 2, 1, -177], [4, 0, -2, -1, 176], [4, -1, -1, -1, 166], [1, 0, 1, -1, -164],
	[4, 0, 1, -1, 132], [1, 0, -1, -1, -119], [4, -1, 0, -1, 115], [2, -2, 0, 1, 107],
];

export interface MoonPosition {
	/** Ecliptic longitude, degrees. */
	lon: number;
	/** Ecliptic latitude, degrees. */
	lat: number;
	/** Geocentric distance, km. */
	range: number;
}

/** The moon's ecliptic position for a Julian Ephemeris Day (TT). */
export function moonPosition(jde: number): MoonPosition {
	const T = (jde - 2451545.0) / 36525;
	const lp = horner(T, 218.3164477, 481267.88123421, -0.0015786, 1 / 538841, -1 / 65194000);
	const d = horner(T, 297.8501921, 445267.1114034, -0.0018819, 1 / 545868, -1 / 113065000);
	const m = horner(T, 357.5291092, 35999.0502909, -0.0001536, 1 / 24490000);
	const mp = horner(T, 134.9633964, 477198.8675055, 0.0087414, 1 / 69699, -1 / 14712000);
	const f = horner(T, 93.272095, 483202.0175233, -0.0036539, -1 / 3526000, 1 / 863310000);
	const a1 = 119.75 + 131.849 * T;
	const a2 = 53.09 + 479264.29 * T;
	const a3 = 313.45 + 481266.484 * T;
	const e = horner(T, 1, -0.002516, -0.0000074);
	const e2 = e * e;
	const dR = d * D2R;
	const mR = m * D2R;
	const mpR = mp * D2R;
	const fR = f * D2R;
	let sl = 3958 * Math.sin(a1 * D2R) + 1962 * Math.sin((lp - f) * D2R) + 318 * Math.sin(a2 * D2R);
	let sr = 0;
	let sb =
		-2235 * Math.sin(lp * D2R) +
		382 * Math.sin(a3 * D2R) +
		175 * Math.sin((a1 - f) * D2R) +
		175 * Math.sin((a1 + f) * D2R) +
		127 * Math.sin((lp - mp) * D2R) -
		115 * Math.sin((lp + mp) * D2R);
	for (const [rd, rm, rmp, rf, s, c] of TA) {
		const arg = rd * dR + rm * mR + rmp * mpR + rf * fR;
		const fac = rm === 1 || rm === -1 ? e : rm === 2 || rm === -2 ? e2 : 1;
		sl += s * Math.sin(arg) * fac;
		sr += c * Math.cos(arg) * fac;
	}
	for (const [rd, rm, rmp, rf, s] of TB) {
		const arg = rd * dR + rm * mR + rmp * mpR + rf * fR;
		const fac = rm === 1 || rm === -1 ? e : rm === 2 || rm === -2 ? e2 : 1;
		sb += s * Math.sin(arg) * fac;
	}
	return { lon: norm360(lp + sl * 1e-6), lat: sb * 1e-6, range: 385000.56 + sr * 1e-3 };
}

export interface SunEcliptic {
	/** Ecliptic longitude, degrees. */
	lon: number;
	/** Distance, AU. */
	au: number;
}

/** The sun's ecliptic longitude and distance for a UTC instant. */
export function sunEcliptic(ms: number): SunEcliptic {
	const d = ms / 86400000 + 2440587.5 - 2451545.0;
	const L = norm360(280.46 + 0.9856474 * d);
	const g = norm360(357.528 + 0.9856003 * d) * D2R;
	const lon = norm360(L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
	const au = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g);
	return { lon, au };
}

/** The moon's apparent angular diameter at a distance, degrees. */
export function angularDiameter(rangeKm: number): number {
	return 2 * Math.asin(MOON_R_KM / rangeKm) * R2D;
}

export interface MoonState {
	/** Phase angle Sun-Moon-Earth, degrees (0 = full, 180 = new). */
	i: number;
	/** Illuminated fraction of the disc, 0 to 1: (1 + cos i) / 2. */
	k: number;
	/** Geocentric distance, km. */
	range: number;
	/** Ecliptic longitude, degrees. */
	lon: number;
	/** Ecliptic latitude, degrees. */
	lat: number;
	/** Elongation from the sun, degrees 0 to 360 (0 = new, 180 = full). */
	elong: number;
	/** Apparent angular diameter, degrees. */
	angDiam: number;
	/** True while waxing (before the full moon). */
	waxing: boolean;
}

/** The moon's full state for a UTC instant. */
export function moonState(ms: number): MoonState {
	const jde = ms / 86400000 + 2440587.5 + TT_UT_S / 86400;
	const p = moonPosition(jde);
	const s = sunEcliptic(ms);
	const lam = p.lon * D2R;
	const bet = p.lat * D2R;
	const lams = s.lon * D2R;
	const mx = p.range * Math.cos(bet) * Math.cos(lam);
	const my = p.range * Math.cos(bet) * Math.sin(lam);
	const mz = p.range * Math.sin(bet);
	const rs = s.au * AU_KM;
	const sx = rs * Math.cos(lams) - mx;
	const sy = rs * Math.sin(lams) - my;
	const sz = -mz;
	// The phase angle at the moon, between (moon -> sun) and (moon -> earth):
	// cos i = -(r_m . (sun - moon)) / (|r_m| |sun - moon|). The sign matters:
	// a plain dot product reads the complement and flips the illumination.
	const cosi = -(mx * sx + my * sy + mz * sz) / (p.range * Math.hypot(sx, sy, sz));
	const c = Math.max(-1, Math.min(1, cosi));
	const elong = norm360(p.lon - s.lon);
	return {
		i: Math.acos(c) * R2D,
		k: (1 + c) / 2,
		range: p.range,
		lon: p.lon,
		lat: p.lat,
		elong,
		angDiam: angularDiameter(p.range),
		waxing: elong < 180,
	};
}

// --- Phase events. Instants follow the USNO convention: geocentric
// ecliptic-longitude conjunctions (elongation 0 / 90 / 180 / 270 degrees).

export type PhaseKind = "new" | "first-quarter" | "full" | "last-quarter";

/** The four kinds, cycle order. */
export const PHASE_KINDS: readonly PhaseKind[] = ["new", "first-quarter", "full", "last-quarter"];

/** Printed names for the four events. */
export const PHASE_LABELS: Record<PhaseKind, string> = {
	new: "New Moon",
	"first-quarter": "First Quarter",
	full: "Full Moon",
	"last-quarter": "Last Quarter",
};

/** Printed names for the interval that follows each event. */
export const INTERVAL_LABELS: Record<PhaseKind, string> = {
	new: "Waxing crescent",
	"first-quarter": "Waxing gibbous",
	full: "Waning gibbous",
	"last-quarter": "Waning crescent",
};

/** The elongation target for each kind, degrees. */
const PHASE_TARGETS: Record<PhaseKind, number> = {
	new: 0,
	"first-quarter": 90,
	full: 180,
	"last-quarter": 270,
};

export interface PhaseEvent {
	kind: PhaseKind;
	/** Instant, milliseconds since epoch. */
	t: number;
}

/** Bisect the elongation's crossing of a target between two instants. */
function bisectCrossing(target: number, lo: number, hi: number): number {
	for (let i = 0; i < 60; i += 1) {
		const mid = (lo + hi) / 2;
		if (angDiff(moonState(mid).elong, target) < 0) lo = mid;
		else hi = mid;
	}
	return (lo + hi) / 2;
}

/**
 * All phase events within +/- windowDays of the instant (hourly scan plus a
 * 60-step bisection), time-sorted. About 45 ms for the default window.
 */
export function phaseEventsAround(ms: number, windowDays = 33): PhaseEvent[] {
	const step = 3_600_000;
	const from = ms - windowDays * 86_400_000;
	const to = ms + windowDays * 86_400_000;
	const events: PhaseEvent[] = [];
	let prevElong = moonState(from).elong;
	for (let t = from + step; t <= to; t += step) {
		const elong = moonState(t).elong;
		for (const kind of PHASE_KINDS) {
			const target = PHASE_TARGETS[kind];
			const a = angDiff(prevElong, target);
			const b = angDiff(elong, target);
			if (a < 0 && b >= 0 && Math.abs(a) < 5 && Math.abs(b) < 5) {
				events.push({ kind, t: bisectCrossing(target, t - step, t) });
			}
		}
		prevElong = elong;
	}
	events.sort((x, y) => x.t - y.t);
	return events;
}

export interface MoonPhases {
	/** The most recent event at or before the instant. */
	prev: PhaseEvent;
	/** The next event after the instant. */
	next: PhaseEvent;
	/** The next occurrence of each of the four kinds, time-sorted. */
	upcoming: PhaseEvent[];
}

/** The phase situation at an instant: the bracketing events and what is next. */
export function moonPhases(ms: number): MoonPhases {
	const events = phaseEventsAround(ms);
	let prev = events[0];
	for (const e of events) {
		if (e.t <= ms) prev = e;
	}
	const next = events.find((e) => e.t > ms) ?? events[events.length - 1];
	const upcoming: PhaseEvent[] = [];
	for (const kind of PHASE_KINDS) {
		const first = events.find((e) => e.kind === kind && e.t > ms);
		if (first) upcoming.push(first);
	}
	upcoming.sort((x, y) => x.t - y.t);
	return { prev, next, upcoming };
}

// --- Perigee and apogee (the near/far cycle).

export interface Apsis {
	/** Instant of the extreme, milliseconds since epoch. */
	t: number;
	/** Geocentric distance there, km. */
	range: number;
}

/** Refine a sampled extreme to the second (ternary search over +/-2 h). */
function refineExtreme(coarseT: number, findMin: boolean): Apsis {
	let lo = coarseT - 2 * 3_600_000;
	let hi = coarseT + 2 * 3_600_000;
	for (let i = 0; i < 60; i += 1) {
		const m1 = lo + (hi - lo) / 3;
		const m2 = hi - (hi - lo) / 3;
		const f1 = moonState(m1).range;
		const f2 = moonState(m2).range;
		if (findMin ? f1 < f2 : f1 > f2) hi = m2;
		else lo = m1;
	}
	const t = (lo + hi) / 2;
	return { t, range: moonState(t).range };
}

/**
 * The next perigee and apogee after the instant: an hourly scan over 30
 * days finds the first local extreme, then a ternary search refines it.
 * The anomalistic month is 27.55 days, so both extremes are always inside
 * the window.
 */
export function nextApsides(ms: number): { perigee: Apsis; apogee: Apsis } {
	const step = 3_600_000;
	const limit = ms + 30 * 86_400_000;
	let prevR = moonState(ms - step).range;
	let currR = moonState(ms).range;
	let perigeeT = NaN;
	let apogeeT = NaN;
	for (let t = ms + step; t <= limit; t += step) {
		const nextR = moonState(t).range;
		if (Number.isNaN(perigeeT) && currR < prevR && currR < nextR) perigeeT = t - step;
		if (Number.isNaN(apogeeT) && currR > prevR && currR > nextR) apogeeT = t - step;
		if (!Number.isNaN(perigeeT) && !Number.isNaN(apogeeT)) break;
		prevR = currR;
		currR = nextR;
	}
	return { perigee: refineExtreme(perigeeT, true), apogee: refineExtreme(apogeeT, false) };
}

// --- Display helpers for the readout.

/** "364,409 km" - geocentric distance, thousands separators. */
export function formatRange(km: number): string {
	const n = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(km);
	return `${n} km`;
}

/** "31.1 arcmin" - an angular size in degrees, printed in arcminutes. */
export function formatArcmin(deg: number): string {
	return `${(deg * 60).toFixed(1)} arcmin`;
}

/** "0.42%" below one percent, "56.3%" above - the illuminated fraction. */
export function formatIllumination(k: number): string {
	const pct = k * 100;
	return pct >= 1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(2)}%`;
}

/** "2 d 6 h" / "6 h 12 min" / "42 min" - a countdown from a delta. */
export function formatCountdown(deltaMs: number): string {
	const min = Math.max(0, Math.round(deltaMs / 60000));
	if (min < 60) return `${min} min`;
	const h = Math.floor(min / 60);
	const rm = min % 60;
	if (h < 24) return rm === 0 ? `${h} h` : `${h} h ${rm} min`;
	const d = Math.floor(h / 24);
	const rh = h % 24;
	return rh === 0 ? `${d} d` : `${d} d ${rh} h`;
}

/** "Oct 26, 07:41" - the instant in the viewer's local time. */
export function formatLocalDateTime(ms: number): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(ms);
}
