import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { PmStrip } from "@/components/playground/pm-strip";
import { getAirData } from "@/lib/playground/air-source";
import { formatDateTimeUtc } from "@/lib/playground/format";

// The page renders per request from the live feed (with a per-isolate cache
// in the source module) - never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Tehran air",
	description:
		"The air in Tehran right now: PM2.5 and PM10 readings, the day's rise and fall, and how the current hour sits against the WHO 24-hour guideline. Modeled data via Open-Meteo, refreshed hourly.",
	alternates: { canonical: "/playground/air" },
};

/** WHO global air quality guidelines (2021), 24-hour PM2.5 guideline. */
const WHO_24H = 15;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The feed returns Tehran wall-clock strings ("YYYY-MM-DDTHH:MM"). */
function parts(t: string): { m: string; d: string; hh: string; mm: string } | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(t);
	if (!match) return null;
	return { m: match[2], d: match[3], hh: match[4], mm: match[5] };
}

function formatHour(t: string): string {
	const p = parts(t);
	return p ? `${p.hh}:${p.mm}` : t;
}

function formatDayShort(t: string): string {
	const p = parts(t);
	return p ? `${MONTHS[Number(p.m) - 1]} ${Number(p.d)}` : t;
}

function formatTehranShort(t: string): string {
	const p = parts(t);
	return p ? `${MONTHS[Number(p.m) - 1]} ${Number(p.d)}, ${p.hh}:${p.mm}` : t;
}

function fmt1(value: number): string {
	return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
}

function whoComparison(value: number): string {
	const ratio = value / WHO_24H;
	return ratio >= 1
		? `about ${fmt1(ratio)} times the WHO 24-hour guideline (${WHO_24H} ug/m3)`
		: `below the WHO 24-hour guideline (${WHO_24H} ug/m3)`;
}

/** Consecutive bins grouped by Tehran-local day, for the label row. */
function dayGroups(bins: { t: string }[]): { label: string; count: number }[] {
	const groups: { label: string; count: number }[] = [];
	for (const bin of bins) {
		const label = formatDayShort(bin.t);
		const last = groups[groups.length - 1];
		if (last && last.label === label) last.count += 1;
		else groups.push({ label, count: 1 });
	}
	return groups;
}

export default async function TehranAirPage() {
	const data = await getAirData();
	const { current, hourly } = data;

	// The feed mixes nowcast and forecast in one series; the current bin time
	// is the split point (the newest bin trails the wall clock by about half
	// an hour, so find the last bin at or before it).
	let nowIndex = -1;
	for (let i = 0; i < hourly.length; i += 1) {
		if (hourly[i].t <= current.t) nowIndex = i;
	}
	const bins = hourly.map((bin, index) => ({
		t: bin.t,
		pm25: bin.pm25,
		forecast: index > nowIndex,
	}));
	const first = hourly[0];
	const last = hourly[hourly.length - 1];
	const windowMin = Math.min(...hourly.map((bin) => bin.pm25));
	const windowMax = Math.max(...hourly.map((bin) => bin.pm25));

	const evening = nowIndex >= 0 ? hourly.slice(nowIndex + 1) : [];
	const eveningMin = evening.length > 0 ? Math.min(...evening.map((bin) => bin.pm25)) : null;
	const eveningPeak =
		evening.length > 0
			? evening.reduce((best, bin) => (bin.pm25 > best.pm25 ? bin : best))
			: null;
	const lastBin = evening.length > 0 ? evening[evening.length - 1] : null;

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Tehran air"
			intro="The air in Tehran right now: PM2.5 and PM10 readings, the day's rise and fall, and how the current hour sits against the WHO guideline."
			meta={
				<>
					Data: Open-Meteo (CAMS model) · reading {formatTehranShort(current.t)} Tehran
					{data.provenance === "snapshot"
						? ` · showing the last good snapshot (${formatDateTimeUtc(data.asOf)})`
						: ""}
				</>
			}
		>
			<section aria-label="Right now">
				<SectionHeading label="Right now" note="the current hour, Tehran time" />
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<StatTile
						label="PM2.5"
						value={`${fmt1(current.pm25)} ug/m3`}
						hint={`fine particles · as of ${formatHour(current.t)}`}
					/>
					<StatTile
						label="PM10"
						value={`${fmt1(current.pm10)} ug/m3`}
						hint={`coarser particles · as of ${formatHour(current.t)}`}
					/>
					<StatTile
						label="European AQI"
						value={`${Math.round(current.aqiEu)}`}
						hint={`the feed's EAQI scale · ${formatHour(current.t)}`}
					/>
					<StatTile
						label="US AQI"
						value={`${Math.round(current.aqiUs)}`}
						hint={`the feed's USAQI scale · ${formatHour(current.t)}`}
					/>
				</div>
				<p className="mt-3 text-copy-13 text-text-faint">
					For scale: the current hour reads {whoComparison(current.pm25)}. This is
					modeled, city-scale data, not a single street station.
				</p>
			</section>

			<section aria-label="The past two days and today">
				<SectionHeading
					label="The past two days and today"
					note={`hourly PM2.5 · ${formatDayShort(first.t)} through ${formatDayShort(last.t)}`}
				/>
				<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
					<PmStrip
						bins={bins}
						guideline={WHO_24H}
						currentIndex={nowIndex >= 0 ? nowIndex : undefined}
						ariaLabel={`Hourly PM2.5, ${formatDayShort(first.t)} through ${formatDayShort(last.t)}: ${hourly.length} bins, from ${fmt1(windowMin)} to ${fmt1(windowMax)} ug/m3. Current hour ${formatHour(current.t)} at ${fmt1(current.pm25)} ug/m3. Dashed line: the WHO 24-hour guideline, ${WHO_24H} ug/m3.`}
					/>
					<div className="mt-2 flex" aria-hidden="true">
						{dayGroups(hourly).map((group) => (
							<span
								key={group.label}
								style={{ flexGrow: group.count }}
								className="basis-0 text-center text-label-12-mono text-text-faint"
							>
								{group.count >= 8 ? group.label : "\u00A0"}
							</span>
						))}
					</div>
					<p className="mt-4 text-copy-13 text-text-muted">
						Solid bars: the model&apos;s hourly values up to the current hour. Faded
						bars: its forecast for the rest of today. Dashed line: the WHO 24-hour
						guideline, {WHO_24H} ug/m3. The window ran from {fmt1(windowMin)} to{" "}
						{fmt1(windowMax)} ug/m3.
					</p>
				</div>
			</section>

			<section aria-label="The evening outlook">
				<SectionHeading label="The evening outlook" note="the model's call for the rest of today" />
				<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
					{eveningPeak && lastBin && eveningMin !== null ? (
						<p className="text-copy-14 text-text-muted">
							For the rest of today, the model runs between about {fmt1(eveningMin)}{" "}
							and about {fmt1(eveningPeak.pm25)} ug/m3, topping out around{" "}
							{formatHour(eveningPeak.t)}. The peak reads{" "}
							{whoComparison(eveningPeak.pm25)}; by {formatHour(lastBin.t)} the series
							sits at about {fmt1(lastBin.pm25)}.
						</p>
					) : (
						<p className="text-copy-14 text-text-muted">
							No forecast bins remain for today; the series picks up again tomorrow.
						</p>
					)}
					<p className="mt-3 text-copy-13 text-text-faint">
						Forecast bins are the model&apos;s current call and shift as conditions
						change.
					</p>
				</div>
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						These are modeled air-quality numbers: Copernicus CAMS model output for
						the Tehran grid point, delivered by Open-Meteo and refreshed hourly. The
						newest bin can trail the clock by about half an hour. This is a
						city-scale model - not a single street-level monitoring station.
					</p>
					<p>
						For context, the WHO global air quality guidelines (2021) set a 24-hour
						PM2.5 guideline of {WHO_24H} ug/m3. A single hour is not a 24-hour
						average, so that comparison is a scale, not a compliance measure. The
						European and US AQI figures are the feed&apos;s own standard indices.
					</p>
					<p>
						The page re-reads the feed about once a minute, and every reading keeps
						its own timestamp; when the feed is unreachable, the page serves the
						last good snapshot and says so. Times are Tehran local. Data:{" "}
						<a
							href="https://open-meteo.com/"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							Open-Meteo
						</a>{" "}
						(CC BY 4.0), &quot;Weather data by Open-Meteo.com&quot;. Guideline
						citation:{" "}
						<a
							href="https://www.who.int/publications/i/item/9789240034228"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							WHO global air quality guidelines, Geneva 2021
						</a>
						, Table 0.1.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
