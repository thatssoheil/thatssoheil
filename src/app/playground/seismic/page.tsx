import type { Metadata } from "next";
import Link from "next/link";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { getSeismicData } from "@/lib/playground/seismic-source";
import { formatDateTimeUtc } from "@/lib/playground/format";

// The page renders per request from the live feed (with a per-isolate cache in
// the source module) - never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Seismic watch",
	description:
		"The week's significant earthquakes, read live: how many shook the planet, the largest event, and the latest ones. Source: USGS Earthquake Hazards Program.",
	alternates: { canonical: "/playground/seismic" },
};

/** How many of the newest events the list shows. */
const LIST_LIMIT = 15;

function formatMag(mag: number): string {
	return `M ${mag.toFixed(1)}`;
}

function formatQuakeAge(timeIso: string, asOfMs: number): string {
	const minutes = Math.round((asOfMs - Date.parse(timeIso)) / 60_000);
	if (!Number.isFinite(minutes)) return "";
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		const rest = minutes % 60;
		return rest === 0 ? `${hours} h ago` : `${hours} h ${rest} min ago`;
	}
	const days = Math.floor(hours / 24);
	return days === 1 ? "1 day ago" : `${days} days ago`;
}

export default async function SeismicWatchPage() {
	const data = await getSeismicData();
	const asOfMs = Date.parse(data.asOf);
	const latestEvents = data.events.slice(0, LIST_LIMIT);

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Seismic watch"
			intro="The week's significant earthquakes, live: how many shook the planet, the largest event, and the latest ones."
			meta={
				<>
					Data: USGS Earthquake Hazards Program · as of {formatDateTimeUtc(data.asOf)}
					{data.provenance === "snapshot" ? " · showing the last good snapshot" : ""}
				</>
			}
		>
			<section aria-label="This week">
				<SectionHeading label="This week" note="past 7 days, M4.5 and above" />
				<div className="flex flex-col gap-3">
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<StatTile
							label="Quakes, past 7 days"
							value={data.count.toLocaleString("en-US")}
							hint="magnitude 4.5 and above"
						/>
						<StatTile
							label="At M5.0 and above"
							value={data.m5plus.toLocaleString("en-US")}
							hint="of this week's quakes"
						/>
						<StatTile
							label="At M6.0 and above"
							value={data.m6plus.toLocaleString("en-US")}
							hint={data.m6plus === 0 ? "none this week" : "of this week's quakes"}
						/>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<Link
							href={data.largest.url}
							target="_blank"
							rel="noreferrer"
							className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-alpha-500 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
						>
							<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
								Largest this week
							</span>
							<span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
								<span className="text-heading-24 text-foreground">
									{formatMag(data.largest.mag)}
								</span>
								<span className="text-copy-13 text-text-muted">
									{formatQuakeAge(data.largest.time, asOfMs)}
								</span>
							</span>
							<span className="text-copy-13 text-text-muted">{data.largest.place}</span>
							<span className="text-copy-13 text-text-faint">
								{Math.round(data.largest.depthKm)} km deep
							</span>
						</Link>
						<Link
							href={data.latest.url}
							target="_blank"
							rel="noreferrer"
							className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-alpha-500 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
						>
							<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
								Most recent
							</span>
							<span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
								<span className="text-heading-24 text-foreground">
									{formatMag(data.latest.mag)}
								</span>
								<span className="text-copy-13 text-text-muted">
									{formatQuakeAge(data.latest.time, asOfMs)}
								</span>
							</span>
							<span className="text-copy-13 text-text-muted">{data.latest.place}</span>
							<span className="text-copy-13 text-text-faint">
								{Math.round(data.latest.depthKm)} km deep
							</span>
						</Link>
					</div>
				</div>
			</section>

			<section aria-label="Latest quakes">
				<SectionHeading label="Latest quakes" note="newest first" />
				<div className="rounded-xl border border-border bg-card px-4 py-1 sm:px-6 sm:py-2">
					<div className="flex flex-col">
						{latestEvents.map((event) => (
							<Link
								key={event.url}
								href={event.url}
								target="_blank"
								rel="noreferrer"
								className="group flex flex-wrap items-baseline gap-x-4 gap-y-0.5 border-t border-border py-2.5 transition-colors first:border-t-0 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
							>
								<span className="w-14 shrink-0 text-copy-13-mono text-foreground">
									{formatMag(event.mag)}
								</span>
								<span className="min-w-0 flex-1 text-copy-13 text-text-muted group-hover:text-foreground">
									{event.place}
								</span>
								<span className="shrink-0 text-copy-13-mono text-text-faint">
									{Math.round(event.depthKm)} km deep
								</span>
								<span className="shrink-0 text-copy-13 text-text-faint">
									{formatQuakeAge(event.time, asOfMs)}
								</span>
							</Link>
						))}
					</div>
				</div>
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						The list is the USGS M4.5+ feed: every earthquake of magnitude 4.5 and
						above in the past 7 days, a rolling window that USGS updates every minute.
						This is the USGS cut of a very active planet, not everything that shook -
						smaller quakes happen constantly and never appear here. The list below
						shows the {LIST_LIMIT} most recent; the counts above cover the full week.
					</p>
					<p>
						Magnitudes and depths are the USGS network&apos;s readings; depths are
						kilometers below the surface, and times are UTC. Each row links to the
						event&apos;s own page at USGS. When the feed is unreachable, the page serves
						the last good snapshot and says so. Source: USGS Earthquake Hazards
						Program.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
