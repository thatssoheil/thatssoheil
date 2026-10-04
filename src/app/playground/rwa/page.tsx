import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { AreaChart } from "@/components/playground/area-chart";
import { IssuersTable } from "@/components/playground/issuers-table";
import { TokensTable } from "@/components/playground/tokens-table";
import { WrapperRace } from "@/components/playground/wrapper-race";
import { getRwaData } from "@/lib/playground/rwa-source";
import {
	formatDateTimeUtc,
	formatNumberCompact,
	formatUsdCompact,
} from "@/lib/playground/format";

// The page renders per request from the live feed (with a per-isolate cache in
// the source module) — never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Tokenized assets tracker",
	description:
		"The tokenized-assets sector as it actually trades: issuers, flows, and the wrapper race between venues listing the same stocks on different chains.",
	alternates: { canonical: "/playground/rwa" },
};

export default async function RwaTrackerPage() {
	const data = await getRwaData();
	const topIssuers = data.issuers.slice(0, 15);
	const topTokens = data.tokens.slice(0, 20);
	const activeIssuers = data.issuers.filter((issuer) => issuer.volume24h > 0).length;

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Tokenized assets tracker"
			intro="The real-world-asset sector as it actually trades. Issuers, flows, and the race between venues wrapping the same stocks on different chains."
			meta={
				<>
					Data: Birdeye public feed · as of {formatDateTimeUtc(data.asOf)}
					{data.provenance === "snapshot"
						? " · showing the last good snapshot"
						: ""}
				</>
			}
		>
			<section aria-label="Sector totals" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<StatTile
					label="24-hour volume"
					value={formatUsdCompact(data.totals.volume24h)}
					hint="all tracked venues"
				/>
				<StatTile
					label="Market cap"
					value={formatUsdCompact(data.totals.marketCap)}
					hint="combined"
				/>
				<StatTile
					label="Tokenized assets"
					value={formatNumberCompact(data.totals.assets)}
					hint={`across ${data.totals.issuers} issuers`}
				/>
				<StatTile
					label="Active issuers"
					value={`${activeIssuers}`}
					hint={`of ${data.totals.issuers} tracked`}
				/>
			</section>

			<section aria-label="The long view">
				<SectionHeading label="The long view" note="daily, December 2023 to today" />
				<div className="flex flex-col gap-3">
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							Daily volume
						</span>
						<AreaChart
							points={data.history.map((point) => ({
								date: point.date,
								value: point.volume,
							}))}
							formatValue={formatUsdCompact}
							ariaLabel="Daily tokenized-asset trading volume since December 2023"
						/>
					</div>
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							Tokenized assets
						</span>
						<AreaChart
							points={data.history.map((point) => ({
								date: point.date,
								value: point.assets,
							}))}
							formatValue={formatNumberCompact}
							ariaLabel="Cumulative tokenized assets across tracked issuers since December 2023"
							height={140}
						/>
					</div>
				</div>
			</section>

			<section aria-label="Issuers">
				<SectionHeading
					label="Issuers"
					note={`ranked by 24-hour volume · ${data.totals.issuers} tracked`}
				/>
				<IssuersTable issuers={topIssuers} />
			</section>

			<section aria-label="Wrapper race">
				<SectionHeading
					label="Wrapper race"
					note="same asset, competing wrappers"
				/>
				<WrapperRace groups={data.wrappers} />
			</section>

			<section aria-label="Top tokens">
				<SectionHeading
					label="Top tokens"
					note="by 24-hour volume, all chains"
				/>
				<TokensTable tokens={topTokens} />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						Issuer and flow data comes from Birdeye&apos;s public beta feed,
						fetched by this site about every 30 minutes. When the feed is
						unreachable, the page serves the last good snapshot and says so.
					</p>
					<p>
						Headline volumes are spot-checked against DexScreener. Turnover
						(volume divided by liquidity) is very high on some venues, which can
						point to market-making or wash activity rather than organic demand.
						Read the big numbers with that in mind.
					</p>
					<p>This page is a data reading, not investment advice.</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
