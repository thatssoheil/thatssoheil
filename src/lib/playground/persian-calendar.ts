// Persian calendar: the arithmetic behind today's date in Iran. A
// dependency-free port of the Borkowski 1996 algorithm - the same one behind
// the jalaali-js library (MIT) - deterministic and safe on both the server
// and in the browser. Exact for Jalaali years -61..3177; the page guards its
// converter to 1300-1500 AP (1921-2122), the stretch where this arithmetic
// and the browser's own Persian calendar agree on every single day (verified
// at build time across the full window).
//
// The official rule is astronomical: 1 Farvardin is the day whose March
// equinox falls before solar noon in Tehran. Arithmetic calendars like this
// one track it across the modern centuries; rare far-future dates can differ
// from the astronomical determination by a day.
//
// Verified at build time against 11 hand-verified fixture pairs (both
// directions), the published 33-year correspondence table, the Nowruz list
// 1389-1406, the window bounds, and a full port-vs-Intl sweep over the days
// 1800-2256 (fnv32-pinned; the two known far-future blocks are the only
// divergences). Evidence: lab/vetting/persian-calendar.md.

/** Inclusive Jalaali year range of the algorithm. */
export const MIN_JY = -61;
export const MAX_JY = 3177;

/** The page's display window, in Jalaali years (1300/1/1 = 21 March 1921). */
export const WINDOW_MIN_JY = 1300;
export const WINDOW_MAX_JY = 1500;

const BREAKS = [
	-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394,
	2456, 3178,
];

const div = (a: number, b: number) => Math.trunc(a / b);
const mod = (a: number, b: number) => a - Math.trunc(a / b) * b;

export type JalaliDate = { jy: number; jm: number; jd: number };
export type GregorianDate = { gy: number; gm: number; gd: number };
export type TehranToday = GregorianDate & JalaliDate;

function jalCalCore(jy: number): { gy: number; march: number; jump: number; n: number } {
	if (!Number.isFinite(jy) || jy < MIN_JY || jy > MAX_JY) {
		throw new RangeError(`Jalaali year out of range: ${jy}`);
	}
	const gy = jy + 621;
	let leapJ = -14;
	let jp = BREAKS[0];
	let jm = 0;
	let jump = 0;
	for (let i = 1; i < BREAKS.length; i += 1) {
		jm = BREAKS[i];
		jump = jm - jp;
		if (jy < jm) break;
		leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
		jp = jm;
	}
	const n = jy - jp;
	leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
	if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
	const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
	const march = 20 + leapJ - leapG;
	return { gy, march, jump, n };
}

function leapFromCycle(jump: number, n: number): number {
	let adjusted = n;
	if (jump - n < 6) adjusted = n - jump + div(jump + 4, 33) * 33;
	let leap = mod(mod(adjusted + 1, 33) - 1, 4);
	if (leap === -1) leap = 4;
	return leap;
}

/** Year data: leap residue (0 means leap), Gregorian year, March day of 1 Farvardin. */
export function jalCal(jy: number): { leap: number; gy: number; march: number } {
	const { gy, march, jump, n } = jalCalCore(jy);
	return { leap: leapFromCycle(jump, n), gy, march };
}

/** True when the Jalaali year has 366 days. */
export function isLeapJalaaliYear(jy: number): boolean {
	const { jump, n } = jalCalCore(jy);
	return leapFromCycle(jump, n) === 0;
}

/** Days in a Jalaali month: 31 in the first half, 30 in the second, 29/30 in Esfand. */
export function jalaaliMonthLength(jy: number, jm: number): number {
	if (jm <= 6) return 31;
	if (jm <= 11) return 30;
	return isLeapJalaaliYear(jy) ? 30 : 29;
}

/** Days in the Jalaali year: 365, or 366 when leap. */
export function jalaaliYearLength(jy: number): number {
	return isLeapJalaaliYear(jy) ? 366 : 365;
}

function g2d(gy: number, gm: number, gd: number): number {
	let d =
		div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408;
	d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
	return d;
}

function d2g(jdn: number): GregorianDate {
	let j = 4 * jdn + 139361631;
	j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
	const i = div(mod(j, 1461), 4) * 5 + 308;
	const gd = div(mod(i, 153), 5) + 1;
	const gm = mod(div(i, 153), 12) + 1;
	const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
	return { gy, gm, gd };
}

function j2d(jy: number, jm: number, jd: number): number {
	const r = jalCalCore(jy);
	return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

const FIRST_JDN = j2d(MIN_JY, 1, 1);
const LAST_JDN = j2d(MAX_JY, 12, jalaaliMonthLength(MAX_JY, 12));
const WINDOW_MIN_JDN = j2d(WINDOW_MIN_JY, 1, 1);
const WINDOW_MAX_JDN = j2d(WINDOW_MAX_JY, 12, jalaaliMonthLength(WINDOW_MAX_JY, 12));

function d2j(jdn: number): JalaliDate {
	if (jdn < FIRST_JDN || jdn > LAST_JDN) throw new RangeError(`JDN out of range: ${jdn}`);
	const gy = d2g(jdn).gy;
	let jy = Math.min(gy - 621, MAX_JY);
	const r = jalCal(jy);
	const jdn1f = g2d(r.gy, 3, r.march);
	let k = jdn - jdn1f;
	if (k >= 0) {
		if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
		k -= 186;
	} else {
		jy -= 1;
		k += 179;
		if (r.leap === 1) k += 1;
	}
	return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

/** Gregorian date to Jalaali (Borkowski arithmetic). */
export function toJalaali(gy: number, gm: number, gd: number): JalaliDate {
	return d2j(g2d(gy, gm, gd));
}

/** Jalaali date to Gregorian. */
export function toGregorian(jy: number, jm: number, jd: number): GregorianDate {
	return d2g(j2d(jy, jm, jd));
}

/** Sat-first weekday index for a Jalaali date: 0 = Saturday .. 6 = Friday. */
export function jalaliWeekday(jy: number, jm: number, jd: number): number {
	return mod(j2d(jy, jm, jd) + 2, 7);
}

/** Day of the Jalaali year, 1-based. */
export function dayOfYear(jy: number, jm: number, jd: number): number {
	return jm <= 6 ? (jm - 1) * 31 + jd : 186 + (jm - 7) * 30 + jd;
}

/** Days from a Jalaali date to 1 Farvardin of the next year. */
export function daysUntilNowruz(jy: number, jm: number, jd: number): number {
	return j2d(jy + 1, 1, 1) - j2d(jy, jm, jd);
}

/** A Saturday-first month grid; leading and trailing nulls pad to whole weeks. */
export function monthGrid(jy: number, jm: number): (JalaliDate | null)[] {
	const length = jalaaliMonthLength(jy, jm);
	const lead = jalaliWeekday(jy, jm, 1);
	const cells: (JalaliDate | null)[] = [];
	for (let i = 0; i < lead; i += 1) cells.push(null);
	for (let d = 1; d <= length; d += 1) cells.push({ jy, jm, jd: d });
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}

/** Is this a valid Jalaali date inside the page's display window? */
export function inWindow(jy: number, jm: number, jd: number): boolean {
	if (!Number.isInteger(jy) || !Number.isInteger(jm) || !Number.isInteger(jd)) return false;
	if (jy < WINDOW_MIN_JY || jy > WINDOW_MAX_JY) return false;
	if (jm < 1 || jm > 12 || jd < 1) return false;
	return jd <= jalaaliMonthLength(jy, jm);
}

/** Is this Gregorian date inside the page's display window? */
export function inWindowGregorian(gy: number, gm: number, gd: number): boolean {
	const jdn = g2d(gy, gm, gd);
	return jdn >= WINDOW_MIN_JDN && jdn <= WINDOW_MAX_JDN;
}

/** YYYY-MM-DD for a Gregorian date (the native date input's value format). */
export function isoDate(g: GregorianDate): string {
	const p2 = (n: number) => String(n).padStart(2, "0");
	return `${g.gy}-${p2(g.gm)}-${p2(g.gd)}`;
}

/** Parse YYYY-MM-DD; null when malformed or not a real calendar date. */
export function parseIsoDate(value: string): GregorianDate | null {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!m) return null;
	const gy = Number(m[1]);
	const gm = Number(m[2]);
	const gd = Number(m[3]);
	const check = new Date(Date.UTC(gy, gm - 1, gd));
	if (check.getUTCFullYear() !== gy || check.getUTCMonth() + 1 !== gm || check.getUTCDate() !== gd) {
		return null;
	}
	return { gy, gm, gd };
}

/** The Tehran calendar date for an instant (Intl; fixed +3:30 fallback). */
export function tehranDate(instant: Date): GregorianDate {
	let parts: Intl.DateTimeFormatPart[] | null = null;
	try {
		parts = new Intl.DateTimeFormat("en-US", {
			timeZone: "Asia/Tehran",
			year: "numeric",
			month: "numeric",
			day: "numeric",
		}).formatToParts(instant);
	} catch {
		parts = null;
	}
	if (parts) {
		const o: Record<string, string> = {};
		for (const p of parts) o[p.type] = p.value;
		const gy = Number(o.year);
		const gm = Number(o.month);
		const gd = Number(o.day);
		if (Number.isInteger(gy) && Number.isInteger(gm) && Number.isInteger(gd)) {
			return { gy, gm, gd };
		}
	}
	// Iran has had no daylight saving since 2022; +3:30 is exact for now.
	const shifted = new Date(instant.getTime() + 3.5 * 3600 * 1000);
	return { gy: shifted.getUTCFullYear(), gm: shifted.getUTCMonth() + 1, gd: shifted.getUTCDate() };
}

/** Today in Iran: the Tehran Gregorian date and its Jalaali reading. */
export function tehranToday(instant: Date): TehranToday {
	const g = tehranDate(instant);
	return { ...g, ...toJalaali(g.gy, g.gm, g.gd) };
}

/** The converter's bounds, as the ISO strings the native date input wants. */
export const WINDOW_MIN_ISO = isoDate(toGregorian(WINDOW_MIN_JY, 1, 1));
export const WINDOW_MAX_ISO = isoDate(
	toGregorian(WINDOW_MAX_JY, 12, jalaaliMonthLength(WINDOW_MAX_JY, 12)),
);

/** English transliterations, Farvardin..Esfand (match ICU). */
export const MONTH_NAMES_EN = [
	"Farvardin",
	"Ordibehesht",
	"Khordad",
	"Tir",
	"Mordad",
	"Shahrivar",
	"Mehr",
	"Aban",
	"Azar",
	"Dey",
	"Bahman",
	"Esfand",
];

/** Persian script month names, Farvardin..Esfand. */
export const MONTH_NAMES_FA = [
	"فروردین",
	"اردیبهشت",
	"خرداد",
	"تیر",
	"مرداد",
	"شهریور",
	"مهر",
	"آبان",
	"آذر",
	"دی",
	"بهمن",
	"اسفند",
];

/** Weekday names, Saturday first (the Iranian week starts on Saturday). */
export const WEEKDAY_NAMES_EN = [
	"Saturday",
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
];

/** Persian script weekday names, Saturday first. */
export const WEEKDAY_NAMES_FA = [
	"شنبه",
	"یکشنبه",
	"دوشنبه",
	"سه‌شنبه",
	"چهارشنبه",
	"پنجشنبه",
	"جمعه",
];
