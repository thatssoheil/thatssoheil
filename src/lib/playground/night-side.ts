// The night side: solar position, sun altitude, the twilight band ladder,
// and the committed land mask. Everything here is computed from the clock -
// nothing is fetched, so nothing can go stale.
//
// Solar position follows the Astronomical Almanac's low-precision formula set
// ("Low precision formulae for the Sun", page C5; about 0.01 deg class, valid
// 1950-2050). USNO publishes the same series as "Computing Approximate Solar
// Coordinates". Verified against published landmarks in the lab's vetting
// probes (20/20 checks; sunrise/sunset within about two minutes of two
// independent APIs).
//
// The land mask is a committed artifact (src/data/playground/night-side-mask
// .json) generated once from Natural Earth's 110m land layer (public domain)
// by scripts/gen-night-side-mask.mjs; see that script for the source pin.

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function norm360(x: number): number {
	return ((x % 360) + 360) % 360;
}

function norm180(x: number): number {
	const v = norm360(x);
	return v > 180 ? v - 360 : v;
}

export interface SolarPosition {
	/** Solar declination, degrees. */
	dec: number;
	/** Subsolar longitude, degrees east (-180 to 180). */
	lon: number;
}

/** The sun's position for a UTC instant (milliseconds since epoch). */
export function solarPosition(ms: number): SolarPosition {
	const d = ms / 86400000 + 2440587.5 - 2451545.0; // days since J2000
	const L = norm360(280.46 + 0.9856474 * d);
	const g = norm360(357.528 + 0.9856003 * d) * D2R;
	const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * D2R;
	const eps = (23.439 - 0.0000004 * d) * D2R;
	const dec = Math.asin(Math.sin(eps) * Math.sin(lam)) * R2D;
	const ra = norm360(Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) * R2D);
	const gmst = norm360(280.46061837 + 360.98564736629 * d);
	const lon = norm180(ra - gmst);
	return { dec, lon };
}

/** The sun's altitude above the horizon at a location and instant, degrees. */
export function sunAltitude(lat: number, lon: number, ms: number): number {
	const { dec, lon: slon } = solarPosition(ms);
	const H = (lon - slon) * D2R;
	const la = lat * D2R;
	const de = dec * D2R;
	return Math.asin(Math.sin(la) * Math.sin(de) + Math.cos(la) * Math.cos(de) * Math.cos(H)) * R2D;
}

/** The horizon with standard refraction: day starts here. */
export const SUN_HORIZON = -0.833;

export type Band = "day" | "civil" | "nautical" | "astronomical" | "night";

/** Classify a sun altitude into the standard band ladder. */
export function bandOf(alt: number): Band {
	if (alt > SUN_HORIZON) return "day";
	if (alt > -6) return "civil";
	if (alt > -12) return "nautical";
	if (alt > -18) return "astronomical";
	return "night";
}

/** Shade strength per band, as a fraction of the ink token's own alpha. */
export const BAND_ALPHAS: Record<Band, number> = {
	day: 0,
	civil: 0.16,
	nautical: 0.34,
	astronomical: 0.52,
	night: 0.78,
};

export interface BandRow {
	band: Band;
	label: string;
	range: string;
}

/** Band names as printed (legend, readout, table). */
export const BAND_LABELS: Record<Band, string> = {
	day: "Day",
	civil: "Civil twilight",
	nautical: "Nautical twilight",
	astronomical: "Astronomical twilight",
	night: "Night",
};

/** The ladder as printed on the page (legend + method table). */
export const BAND_ROWS: readonly BandRow[] = [
	{ band: "day", label: BAND_LABELS.day, range: "sun above -0.83 degrees" },
	{ band: "civil", label: BAND_LABELS.civil, range: "-0.83 to -6 degrees" },
	{ band: "nautical", label: BAND_LABELS.nautical, range: "-6 to -12 degrees" },
	{ band: "astronomical", label: BAND_LABELS.astronomical, range: "-12 to -18 degrees" },
	{ band: "night", label: BAND_LABELS.night, range: "below -18 degrees" },
];

export interface NightSideMask {
	step: number;
	cols: number;
	rows: number;
	bits: string;
	source: string;
	sourceSha256: string;
	generated: string;
}

/** Decode the committed base64 bitmask (works in browsers and node). */
export function decodeMask(b64: string): Uint8Array {
	const bin = atob(b64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
	return bytes;
}

/** Is cell (i, j) land? Bits are LSB-first within each byte, row-major. */
export function maskLand(bytes: Uint8Array, cols: number, i: number, j: number): boolean {
	const bit = j * cols + i;
	return ((bytes[bit >> 3] >> (bit & 7)) & 1) === 1;
}

export interface City {
	name: string;
	lat: number;
	lon: number;
	zone: string;
}

/** The readout row's cities (the five covered by the vetting probes). */
export const CITIES: readonly City[] = [
	{ name: "Tehran", lat: 35.6892, lon: 51.389, zone: "Asia/Tehran" },
	{ name: "London", lat: 51.5074, lon: -0.1278, zone: "Europe/London" },
	{ name: "New York", lat: 40.7128, lon: -74.006, zone: "America/New_York" },
	{ name: "Sydney", lat: -33.8688, lon: 151.2093, zone: "Australia/Sydney" },
	{ name: "Tokyo", lat: 35.6762, lon: 139.6503, zone: "Asia/Tokyo" },
];

export interface CityState {
	alt: number;
	band: Band;
}

/** A city's sun state for an instant. */
export function cityState(city: City, ms: number): CityState {
	const alt = sunAltitude(city.lat, city.lon, ms);
	return { alt, band: bandOf(alt) };
}

/** The city's wall-clock time as HH:MM. */
export function formatLocalTime(ms: number, zone: string): string {
	return new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: zone,
	}).format(ms);
}

/** The instant as HH:MM UTC. */
export function formatUtcTime(ms: number): string {
	return new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "UTC",
	}).format(ms);
}

/** The recompute cadence: the terminator moves 0.25 deg per minute. */
export const TICK_MS = 60_000;

/** Latitude/longitude of a cell center, for drawing. */
export function cellCenter(i: number, j: number, step: number): { lat: number; lon: number } {
	return { lat: 90 - (j + 0.5) * step, lon: -180 + (i + 0.5) * step };
}
