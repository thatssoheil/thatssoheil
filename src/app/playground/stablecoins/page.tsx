import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { AreaChart } from "@/components/playground/area-chart";
import { getStablecoinData } from "@/lib/playground/stablecoin-source";
import {
	formatDateLong,
	formatDateShort,
	formatPct,
	formatUsdCompact,
} from "@/lib/playground/format";

// The page renders per request from the live feed (with a per-isolate cache in
// the source module) - never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Stablecoin float tracker",
	description:
		"The total value of stablecoins in circulation, read as the crypto market's dry powder: the current float, recent changes, and the full record since 2017.",
	alternates: { canonical: "/playground/stablecoins" },
};

export default async function StablecoinFloatPage() {
	const data = await getStablecoinData();
	const recent = data.history.slice(-365);

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Stablecoin float tracker"
			intro={
				"The crypto market's dry powder in a single number. The total value of stablecoins in circulation, its recent moves, and the full record since November 2017."
			}
			meta={
				<>
					Data: DefiLlama · as of {formatDateLong(data.latestDate)}
					{data.provenance === "snapshot"
						? " · showing the last good snapshot"
						: ""}
				</>
			}
		>
			<section aria-label="The reading" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<StatTile
					label="Stablecoin float"
					value={formatUsdCompact(data.latest)}
					hint="total circulating value"
				/>
				<StatTile
					label="7-day change"
					value={data.change7d === null ? "-" : formatPct(data.change7d)}
					hint="vs 7 days earlier"
				/>
				<StatTile
					label="30-day change"
					value={data.change30d === null ? "-" : formatPct(data.change30d)}
					hint="vs 30 days earlier"
				/>
				<StatTile
					label="From peak"
					value={formatPct(data.distanceFromPeakPct)}
					hint={`peak ${formatUsdCompact(data.peak.value)} on ${formatDateShort(data.peak.date)}`}
				/>
			</section>

			<section aria-label="The long view">
				<SectionHeading label="The long view" note="daily, November 2017 to today" />
				<div className="flex flex-col gap-3">
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							All time, log scale
						</span>
						<AreaChart
							points={data.history.map((point) => ({
								date: point.date,
								value: point.usd,
							}))}
							formatValue={formatUsdCompact}
							ariaLabel="Total stablecoin circulating value, daily since November 2017, log scale"
							scale="log"
						/>
					</div>
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							The last year
						</span>
						<AreaChart
							points={recent.map((point) => ({
								date: point.date,
								value: point.usd,
							}))}
							formatValue={formatUsdCompact}
							ariaLabel="Total stablecoin circulating value, daily, the last 365 days"
							height={140}
						/>
					</div>
				</div>
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						Total stablecoin circulation from DefiLlama&apos;s public aggregate
						feed, fetched by this site about every 30 minutes. When the feed is
						unreachable, the page serves the last good snapshot and says so.
					</p>
					<p>
						The figure is spot-checked against CoinGecko&apos;s stablecoin
						category; the two aggregators agree within about 1 percent, with
						small gaps from long-tail coverage.
					</p>
					<p>
						Stablecoin float is one read on the size of crypto&apos;s cash pile:
						it grows when dollars move into token form and shrinks when they
						move out. This page is a data reading, not investment advice.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
