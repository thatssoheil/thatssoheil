import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { AreaChart } from "@/components/playground/area-chart";
import { VolatilityReading } from "@/components/playground/volatility-reading";
import { getVolatilityData } from "@/lib/playground/volatility-source";

export const metadata: Metadata = {
	title: "Volatility gauge",
	description:
		"Bitcoin and Ethereum implied volatility (Deribit DVOL): the current reading, the day's move, and where each sits against its history since March 2021.",
	alternates: { canonical: "/playground/volatility" },
};

export default function VolatilityPage() {
	const data = getVolatilityData();

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Volatility gauge"
			intro="Crypto's fear gauge: Bitcoin and Ethereum implied volatility from the options market, the day's move, and where each sits against its own history since March 2021."
			meta={<>Data: Deribit DVOL · daily closes since March 2021</>}
		>
			<section aria-label="The reading">
				<SectionHeading label="The reading" note="daily closes since March 2021" />
				<VolatilityReading
					btc={{
						level: data.btc.latest,
						dayChangePct: data.btc.dayChangePct,
						percentile: data.btc.percentile,
						closes: data.btc.history.map((point) => point.value),
					}}
					eth={{
						level: data.eth.latest,
						dayChangePct: data.eth.dayChangePct,
						percentile: data.eth.percentile,
						closes: data.eth.history.map((point) => point.value),
					}}
					snapshotDate={data.asOf}
				/>
			</section>

			<section aria-label="The long view">
				<SectionHeading label="The long view" note="daily closes, March 2021 to today" />
				<div className="flex flex-col gap-3">
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							Bitcoin implied volatility
						</span>
						<AreaChart
							points={data.btc.history}
							formatValue={(value) => value.toFixed(1)}
							ariaLabel="Bitcoin implied volatility, daily closes since March 2021"
						/>
					</div>
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							Ethereum implied volatility
						</span>
						<AreaChart
							points={data.eth.history}
							formatValue={(value) => value.toFixed(1)}
							ariaLabel="Ethereum implied volatility, daily closes since March 2021"
						/>
					</div>
				</div>
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						Bitcoin and Ethereum implied volatility from Deribit&apos;s DVOL
						index: the options market&apos;s 30-day forward volatility read,
						daily closes since March 2021. The page renders from a committed
						snapshot and upgrades to a live reading in your browser, fetched
						directly from Deribit&apos;s public API; when that fetch cannot
						run, the snapshot stands.
					</p>
					<p>
						Day change compares the latest close with the previous day&apos;s
						close. The percentile is the share of daily closes since March
						2021 at or below the current reading; a low percentile means
						volatility is cheap against its own history.
					</p>
					<p>
						DVOL is quoted in annualized volatility points, the same register
						as the VIX. The index reads consistently with near-at-the-money
						option quotes on Deribit&apos;s own book. This page is a data
						reading, not investment advice.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
