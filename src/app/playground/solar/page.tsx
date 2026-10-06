import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { KpStrip } from "@/components/playground/kp-strip";
import { getSolarData } from "@/lib/playground/solar-source";
import { formatDateTimeUtc } from "@/lib/playground/format";

// The page renders per request from the live feeds (with a per-isolate cache
// in the source module) - never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Solar watch",
	description:
		"Earth's space weather, read live: the planetary K index now, the past week of geomagnetic activity, and NOAA's three-day outlook. Source: NOAA SWPC.",
	alternates: { canonical: "/playground/solar" },
};

function formatKp(value: number): string {
	const two = value.toFixed(2);
	return two.endsWith("0") ? value.toFixed(1) : two;
}

function formatUtcShort(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	const formatted = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "UTC",
	}).format(date);
	return `${formatted} UTC`;
}

function formatDayShort(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	}).format(date);
}

function formatBz(value: number): string {
	const abs = Math.abs(value);
	const body = abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1);
	const sign = value > 0 ? "+" : value < 0 ? "-" : "";
	return `${sign}${body} nT`;
}

/** Consecutive bins grouped by UTC day, for the label row under the strip. */
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

export default async function SolarWatchPage() {
	const data = await getSolarData();
	const latest = data.kp[data.kp.length - 1];
	const weekPeak = data.kp.reduce((best, bin) => (bin.kp > best.kp ? bin : best));
	const peakIndex = data.kp.findIndex((bin) => bin === weekPeak);
	const stormBins = data.kp.filter((bin) => bin.scale);
	const stormLabels = [...new Set(stormBins.map((bin) => bin.scale))].join(", ");

	const outlook = data.forecast.filter((bin) => bin.type !== "observed");
	const outlookPeak = outlook.length
		? outlook.reduce((best, bin) => (bin.kp > best.kp ? bin : best))
		: null;
	const outlookStorm = outlook.filter((bin) => bin.scale);
	const estimated = outlook.filter((bin) => bin.type === "estimated");
	const predicted = outlook.filter((bin) => bin.type === "predicted");
	const lastEstimated = estimated[estimated.length - 1];
	const lastPredicted = predicted[predicted.length - 1];
	const outlookRange = [
		lastEstimated ? `estimated through ${formatDayShort(lastEstimated.t)}` : null,
		lastPredicted ? `predicted through ${formatDayShort(lastPredicted.t)}` : null,
	]
		.filter(Boolean)
		.join("; ");

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Solar watch"
			intro="Earth's space weather, live: the planetary K index right now, the past week of geomagnetic activity, and NOAA's three-day outlook."
			meta={
				<>
					Data: NOAA SWPC · as of {formatDateTimeUtc(data.asOf)}
					{data.provenance === "snapshot" ? " · showing the last good snapshot" : ""}
				</>
			}
		>
			<section aria-label="Right now">
				<SectionHeading label="Right now" note="near-real-time readings" />
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<StatTile
						label="Planetary K index"
						value={formatKp(latest.kp)}
						hint={`${
							latest.scale ? `${latest.scale} storm level` : "below storm level"
						} · as of ${formatUtcShort(latest.t)}`}
					/>
					<StatTile
						label="Solar wind speed"
						value={`${Math.round(data.wind.speed)} km/s`}
						hint={`proton speed at L1 · ${formatUtcShort(data.wind.t)}`}
					/>
					<StatTile
						label="Bz field"
						value={formatBz(data.mag.bz)}
						hint={`north-south field · ${formatUtcShort(data.mag.t)}`}
					/>
					<StatTile
						label="F10.7 flux"
						value={`${Math.round(data.flux.v)} sfu`}
						hint={`solar radio flux · ${formatUtcShort(data.flux.t)}`}
					/>
				</div>
				<p className="mt-3 text-copy-13 text-text-faint">
					Kp is a 3-hour planetary reading; the solar wind numbers are near-real-time
					from the L1 monitors. Storm labels (G1-G5) are NOAA&apos;s, taken straight
					from the feed.
				</p>
			</section>

			<section aria-label="The past week">
				<SectionHeading
					label="The past week"
					note={`3-hour bins · through ${formatDayShort(data.kp[data.kp.length - 1].t)}`}
				/>
				<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
					<KpStrip
						bins={data.kp}
						peakIndex={peakIndex}
						ariaLabel={`Kp, past week: ${data.kp.length} three-hour bins from ${formatDayShort(
							data.kp[0].t,
						)} to ${formatDayShort(data.kp[data.kp.length - 1].t)}; peak Kp ${formatKp(
							weekPeak.kp,
						)} at ${formatUtcShort(weekPeak.t)}.`}
					/>
					<div className="mt-2 flex" aria-hidden="true">
						{dayGroups(data.kp).map((group) => (
							<span
								key={group.label}
								style={{ flexGrow: group.count }}
								className="basis-0 text-center text-label-12-mono text-text-faint"
							>
								{group.count >= 4 ? group.label : "\u00A0"}
							</span>
						))}
					</div>
					<p className="mt-4 text-copy-13 text-text-muted">
						Dashed line: Kp 5, NOAA&apos;s storm threshold. Peak: Kp{" "}
						{formatKp(weekPeak.kp)}
						{weekPeak.scale ? ` (${weekPeak.scale})` : ""} on {formatUtcShort(weekPeak.t)}.
						{stormBins.length > 0
							? ` Storm-labeled bins: ${stormBins.length} (${stormLabels}).`
							: " No storm labels this week."}
					</p>
				</div>
			</section>

			<section aria-label="Next three days">
				<SectionHeading label="Next three days" note="NOAA's 3-day forecast" />
				<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
					{outlook.length > 0 ? (
						<>
							<KpStrip
								bins={outlook}
								mode="outlook"
								ariaLabel={`NOAA's Kp outlook: ${outlook.length} bins from ${formatDayShort(
									outlook[0].t,
								)} to ${formatDayShort(outlook[outlook.length - 1].t)}.`}
							/>
							<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-copy-13 text-text-faint">
								<span className="flex items-center gap-1.5">
									<span aria-hidden="true" className="h-2.5 w-2.5 rounded-[2px] bg-brand/70" />
									estimated
								</span>
								<span className="flex items-center gap-1.5">
									<span aria-hidden="true" className="h-2.5 w-2.5 rounded-[2px] bg-brand/30" />
									predicted
								</span>
								<span className="flex items-center gap-1.5">
									<span aria-hidden="true" className="h-2.5 w-2.5 rounded-[2px] bg-destructive/80" />
									storm label
								</span>
							</div>
							<p className="mt-3 text-copy-13 text-text-muted">
								{outlookRange ? `${outlookRange}. ` : ""}
								{outlookPeak
									? `Outlook peak: Kp ${formatKp(outlookPeak.kp)} on ${formatUtcShort(
											outlookPeak.t,
										)}. `
									: ""}
								{outlookStorm.length > 0
									? `Storm-labeled bins: ${outlookStorm.length}.`
									: "No storm labels in the outlook."}
							</p>
						</>
					) : (
						<p className="text-copy-13 text-text-muted">
							No outlook bins in the feed right now.
						</p>
					)}
				</div>
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						Kp is the planetary K index: a 3-hour reading, 0 to 9, of how disturbed
						Earth&apos;s magnetic field is. NOAA issues a new bin every three hours, and
						the newest bins are estimates that can still be revised. Kp 5 and above is
						storm level; the G1-G5 labels on this page come from the feed itself, never
						computed here.
					</p>
					<p>
						The solar wind numbers are near-real-time: the proton speed and the
						north-south (Bz) component of the interplanetary magnetic field, measured
						by spacecraft at L1, about 1.5 million kilometers upstream of Earth, and
						typically minutes behind. F10.7 is the sun&apos;s radio flux at 10.7 cm, a
						standard solar activity measure. The outlook is NOAA&apos;s current call and
						changes as conditions evolve.
					</p>
					<p>
						The week strip and the outlook are NOAA SWPC&apos;s public products; the
						page re-reads them about once a minute and every reading keeps its own
						timestamp. When the feeds are unreachable, the page serves the last good
						snapshot and says so. Source: NOAA SWPC (public domain).
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
