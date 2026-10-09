"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
	MONTH_NAMES_EN,
	MONTH_NAMES_FA,
	WEEKDAY_NAMES_EN,
	WEEKDAY_NAMES_FA,
	WINDOW_MAX_ISO,
	WINDOW_MAX_JY,
	WINDOW_MIN_ISO,
	WINDOW_MIN_JY,
	dayOfYear,
	daysUntilNowruz,
	inWindowGregorian,
	isoDate,
	jalaaliMonthLength,
	jalaaliYearLength,
	jalaliWeekday,
	monthGrid,
	parseIsoDate,
	tehranToday,
	toGregorian,
	toJalaali,
	type JalaliDate,
	type TehranToday,
} from "@/lib/playground/persian-calendar";

// The instrument: today in Iran's calendar. The date, the month as a
// Saturday-first grid, the year's progress, the countdown to Nowruz, and a
// two-way converter between the Gregorian and Shamsi calendars. Everything is
// computed locally by the pure module - nothing is fetched at runtime; the
// piece is static (no motion to reduce).

const GREGORIAN_MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const YEAR_OPTIONS = Array.from(
	{ length: WINDOW_MAX_JY - WINDOW_MIN_JY + 1 },
	(_, i) => WINDOW_MIN_JY + i,
);

function formatGregorian(g: { gy: number; gm: number; gd: number }): string {
	return `${g.gd} ${GREGORIAN_MONTHS[g.gm - 1]} ${g.gy}`;
}

/** "21 March 1921 to 20 March 2122" - derived from the module's bounds. */
function windowLabel(): string {
	const min = parseIsoDate(WINDOW_MIN_ISO);
	const max = parseIsoDate(WINDOW_MAX_ISO);
	if (!min || !max) return "1921 to 2122";
	return `${formatGregorian(min)} to ${formatGregorian(max)}`;
}

/**
 * Ask the browser's own Persian calendar (ICU, behind Intl) for the same
 * instant and compare. null when Intl has no Persian calendar here.
 */
function intlCrossCheck(instant: Date): "agrees" | "differs" | null {
	let parts: Intl.DateTimeFormatPart[] | null = null;
	try {
		parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
			timeZone: "Asia/Tehran",
			year: "numeric",
			month: "numeric",
			day: "numeric",
		}).formatToParts(instant);
	} catch {
		parts = null;
	}
	if (!parts) return null;
	const o: Record<string, string> = {};
	for (const p of parts) o[p.type] = p.value;
	const jy = Number(o.year);
	const jm = Number(o.month);
	const jd = Number(o.day);
	if (!Number.isInteger(jy) || !Number.isInteger(jm) || !Number.isInteger(jd)) return null;
	const mine = tehranToday(instant);
	return mine.jy === jy && mine.jm === jm && mine.jd === jd ? "agrees" : "differs";
}

function BlockLabel({ label, children }: { label: string; children?: ReactNode }) {
	return (
		<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
			<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">{label}</span>
			{children ? <span className="text-label-12-mono text-text-faint">{children}</span> : null}
		</div>
	);
}

const NAV_BUTTON =
	"rounded-full border border-border px-3 py-1 text-copy-13 text-text-muted transition-colors hover:border-alpha-500 hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)] disabled:cursor-not-allowed disabled:opacity-40";

const FIELD =
	"h-11 rounded-xl border border-input bg-background px-2 text-copy-14 text-foreground focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]";

export function PersianCalendar({ initialToday }: { initialToday: TehranToday }) {
	const [today, setToday] = useState<TehranToday>(initialToday);
	const [view, setView] = useState({ jy: initialToday.jy, jm: initialToday.jm });
	const [picked, setPicked] = useState<JalaliDate>({
		jy: initialToday.jy,
		jm: initialToday.jm,
		jd: initialToday.jd,
	});
	const [note, setNote] = useState<string | null>(null);
	const [crossCheck, setCrossCheck] = useState<"agrees" | "differs" | null>(null);

	// The first frame: refresh "today" from the visitor's clock (a cached page
	// or a crossing midnight) and run the cross-check, both after mount.
	useEffect(() => {
		queueMicrotask(() => {
			const now = new Date();
			setToday(tehranToday(now));
			setCrossCheck(intlCrossCheck(now));
		});
	}, []);

	const weekday = jalaliWeekday(today.jy, today.jm, today.jd);
	const doy = dayOfYear(today.jy, today.jm, today.jd);
	const yearLen = jalaaliYearLength(today.jy);
	const progress = (doy / yearLen) * 100;
	const nowruzDays = daysUntilNowruz(today.jy, today.jm, today.jd);
	const nowruz = toGregorian(today.jy + 1, 1, 1);

	const cells = useMemo(() => monthGrid(view.jy, view.jm), [view.jy, view.jm]);
	const dayOptions = useMemo(() => {
		const max = jalaaliMonthLength(picked.jy, picked.jm);
		return Array.from({ length: max }, (_, i) => i + 1);
	}, [picked.jy, picked.jm]);
	const pickedG = toGregorian(picked.jy, picked.jm, picked.jd);

	const isToday = (c: JalaliDate) => c.jy === today.jy && c.jm === today.jm && c.jd === today.jd;
	const atWindowMin = view.jy === WINDOW_MIN_JY && view.jm === 1;
	const atWindowMax = view.jy === WINDOW_MAX_JY && view.jm === 12;

	const stepMonth = (delta: number) => {
		setView((v) => {
			let jy = v.jy;
			let jm = v.jm + delta;
			if (jm < 1) {
				jy -= 1;
				jm = 12;
			} else if (jm > 12) {
				jy += 1;
				jm = 1;
			}
			if (jy < WINDOW_MIN_JY || jy > WINDOW_MAX_JY) return v;
			return { jy, jm };
		});
	};

	const onGregorian = (value: string) => {
		const g = parseIsoDate(value);
		if (!g) {
			setNote("That date could not be read - pick one from the field.");
			return;
		}
		if (!inWindowGregorian(g.gy, g.gm, g.gd)) {
			setNote(`Outside the supported window: ${windowLabel()}.`);
			return;
		}
		setNote(null);
		setPicked(toJalaali(g.gy, g.gm, g.gd));
	};

	const onShamsi = (jy: number, jm: number, jd: number) => {
		const max = jalaaliMonthLength(jy, jm);
		setNote(null);
		setPicked({ jy, jm, jd: Math.min(jd, max) });
	};

	return (
		<div className="flex flex-col gap-8">
			<div>
				<BlockLabel label="Today in Iran">
					{crossCheck === "agrees"
						? "cross-checked against your browser's Persian calendar - agrees"
						: crossCheck === "differs"
							? "your browser's Persian calendar reads a different date"
							: null}
				</BlockLabel>
				<div className="mt-3 rounded-xl border border-border bg-card px-5 py-5 sm:px-6">
					<p dir="rtl" className="text-left text-heading-32 text-foreground">
						{`${WEEKDAY_NAMES_FA[weekday]} ${today.jd} ${MONTH_NAMES_FA[today.jm - 1]} ${today.jy}`}
					</p>
					<p className="mt-1.5 text-heading-20 text-text-muted">
						{`${WEEKDAY_NAMES_EN[weekday]} - ${today.jd} ${MONTH_NAMES_EN[today.jm - 1]} ${today.jy}`}
					</p>
					<p className="mt-1 text-copy-14 text-text-faint">{formatGregorian(today)}</p>

					<div className="mt-5 flex flex-col gap-2">
						<div className="flex flex-wrap items-baseline justify-between gap-x-3">
							<span className="text-copy-13 text-text-muted">{`Day ${doy} of ${yearLen}`}</span>
							<span className="text-label-12-mono text-text-faint">
								{`${progress.toFixed(1)} percent through the year`}
							</span>
						</div>
						<div className="h-1.5 overflow-hidden rounded-full bg-alpha-200">
							<div
								className="h-full rounded-full bg-brand"
								style={{ width: `${progress.toFixed(1)}%` }}
							/>
						</div>
						<p className="text-copy-13 text-text-faint">
							{`Nowruz ${today.jy + 1} falls on ${formatGregorian(nowruz)} - ${nowruzDays} days from today.`}
						</p>
					</div>
				</div>
			</div>

			<div>
				<BlockLabel label="The month">Saturday first</BlockLabel>
				<div className="mt-3 rounded-xl border border-border bg-card px-5 py-5 sm:px-6">
					<div className="mx-auto w-full max-w-md">
						<div className="flex items-center justify-between gap-3">
							<button
								type="button"
								onClick={() => stepMonth(-1)}
								disabled={atWindowMin}
								aria-label="Previous month"
								className={NAV_BUTTON}
							>
								Previous
							</button>
							<div className="flex flex-col items-center gap-0.5">
								<span dir="rtl" className="text-heading-20 text-foreground">
									{`${MONTH_NAMES_FA[view.jm - 1]} ${view.jy}`}
								</span>
								<span className="text-label-12-mono text-text-faint">
									{`${MONTH_NAMES_EN[view.jm - 1]} ${view.jy}`}
								</span>
							</div>
							<button
								type="button"
								onClick={() => stepMonth(1)}
								disabled={atWindowMax}
								aria-label="Next month"
								className={NAV_BUTTON}
							>
								Next
							</button>
						</div>
						<div className="mt-4 grid grid-cols-7 gap-1">
							{WEEKDAY_NAMES_EN.map((name) => (
								<span
									key={name}
									className="py-1 text-center text-label-12 uppercase tracking-[0.14em] text-text-faint"
								>
									{name.slice(0, 3)}
								</span>
							))}
							{cells.map((cell, index) =>
								cell ? (
									<div
										key={`${cell.jy}-${cell.jm}-${cell.jd}`}
										aria-current={isToday(cell) ? "date" : undefined}
										className={cn(
											"flex aspect-square items-center justify-center rounded-md text-copy-14",
											isToday(cell)
												? "border border-brand/60 bg-brand/10 text-foreground"
												: "text-text-muted",
										)}
									>
										{cell.jd}
									</div>
								) : (
									<div key={`blank-${index}`} aria-hidden="true" />
								),
							)}
						</div>
					</div>
				</div>
			</div>

			<div>
				<BlockLabel label="Convert">{`${WINDOW_MIN_JY}-${WINDOW_MAX_JY} Shamsi`}</BlockLabel>
				<div className="mt-3 rounded-xl border border-border bg-card px-5 py-5 sm:px-6">
					<div className="grid gap-5 sm:grid-cols-2">
						<div className="flex flex-col gap-2">
							<label
								htmlFor="pc-gregorian"
								className="text-label-12 uppercase tracking-[0.14em] text-text-faint"
							>
								Gregorian
							</label>
							<input
								id="pc-gregorian"
								type="date"
								min={WINDOW_MIN_ISO}
								max={WINDOW_MAX_ISO}
								value={isoDate(pickedG)}
								onChange={(event) => onGregorian(event.target.value)}
								className="h-11 w-full rounded-xl border border-input bg-background px-4 text-copy-14 text-foreground focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
							/>
							<p className="text-copy-13 text-text-faint">
								{`reads as ${picked.jd} ${MONTH_NAMES_EN[picked.jm - 1]} ${picked.jy}`}
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
								Shamsi
							</span>
							<div className="flex gap-2">
								<select
									value={picked.jy}
									onChange={(event) => onShamsi(Number(event.target.value), picked.jm, picked.jd)}
									aria-label="Shamsi year"
									className={FIELD}
								>
									{YEAR_OPTIONS.map((y) => (
										<option key={y} value={y}>
											{y}
										</option>
									))}
								</select>
								<select
									value={picked.jm}
									onChange={(event) => onShamsi(picked.jy, Number(event.target.value), picked.jd)}
									aria-label="Shamsi month"
									className={cn(FIELD, "min-w-0 flex-1")}
								>
									{MONTH_NAMES_EN.map((name, i) => (
										<option key={name} value={i + 1}>
											{name}
										</option>
									))}
								</select>
								<select
									value={picked.jd}
									onChange={(event) => onShamsi(picked.jy, picked.jm, Number(event.target.value))}
									aria-label="Shamsi day"
									className={FIELD}
								>
									{dayOptions.map((d) => (
										<option key={d} value={d}>
											{d}
										</option>
									))}
								</select>
							</div>
							<p className="text-copy-13 text-text-faint">
								{`reads as ${formatGregorian(pickedG)}`}
							</p>
						</div>
					</div>
					{note ? (
						<p role="status" aria-live="polite" className="mt-3 text-copy-13 text-destructive">
							{note}
						</p>
					) : null}
					<p className="mt-3 text-copy-13 text-text-faint">
						{`Supported window: ${windowLabel()}.`}
					</p>
				</div>
			</div>
		</div>
	);
}
