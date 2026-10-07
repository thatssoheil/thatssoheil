import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { AreaChart } from "@/components/playground/area-chart";
import { DryPowderReading } from "@/components/playground/dry-powder-reading";
import { getDryPowderData } from "@/lib/playground/dry-powder-source";
import { formatDateLong, formatUsdBillions } from "@/lib/playground/format";
import type { DryPowderReadingSeries, DryPowderSeriesData } from "@/lib/playground/types";

export const metadata: Metadata = {
	title: "Dollar dry powder",
	description:
		"Where the dollar system's spare cash sits: the Treasury General Account at the Federal Reserve and the overnight reverse repo pool, each against its full history. Live reading, snapshot fallback.",
	alternates: { canonical: "/playground/dry-powder" },
};

/** The reading tiles need the headline numbers only; the history stays server-side. */
function toReading(series: DryPowderSeriesData): DryPowderReadingSeries {
	const { latest, latestDate, change7d, change30d, peak, distanceFromPeakPct } = series;
	return { latest, latestDate, change7d, change30d, peak, distanceFromPeakPct };
}

export default function DryPowderPage() {
	const data = getDryPowderData();

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Dollar dry powder"
			intro="The dollar system's spare cash, by the numbers: the Treasury's checking account at the Federal Reserve and the overnight reverse repo pool, each against its own history."
			meta={
				<>
					Data: U.S. Treasury Fiscal Data and the Federal Reserve Bank of New York · TGA
					since 2005, RRP since 2013
				</>
			}
		>
			<section aria-label="The reading">
				<SectionHeading label="The reading" note="balances in U.S. dollars" />
				<DryPowderReading tga={toReading(data.tga)} rrp={toReading(data.rrp)} />
			</section>

			<section aria-label="The long view">
				<SectionHeading label="The long view" note="daily balances" />
				<div className="flex flex-col gap-3">
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							Treasury General Account
						</span>
						<AreaChart
							points={data.tga.history}
							formatValue={formatUsdBillions}
							ariaLabel="Treasury General Account balance, daily since October 2005"
						/>
					</div>
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							Reverse repo pool
						</span>
						<AreaChart
							points={data.rrp.history}
							formatValue={formatUsdBillions}
							ariaLabel="Overnight reverse repo pool balance, daily since January 2013"
						/>
					</div>
				</div>
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						The Treasury General Account is the U.S. government&apos;s checking
						account at the Federal Reserve: receipts flow in, payments flow out.
						The daily closing balance comes from the Treasury&apos;s Daily
						Treasury Statement (published by 4:00pm ET the following business
						day) through its FiscalData API.
					</p>
					<p>
						The reverse repo pool is cash that money-market funds and others park
						at the Federal Reserve overnight against Treasury collateral. It
						peaked at {formatUsdBillions(data.rrp.peak.value)} on{" "}
						{formatDateLong(data.rrp.peak.date)} and has drained to near zero
						since - the quiet story behind reserve-drain commentary. The series
						comes from the New York Fed&apos;s reverse repo operations.
					</p>
					<p>
						Both series render from a committed snapshot and upgrade to a live
						reading in your browser, fetched directly from the Treasury and New
						York Fed APIs; when a fetch cannot run, that series&apos; snapshot
						stands. The snapshot rendered here was generated on{" "}
						{formatDateLong(data.asOf)}. Balances are rounded for display. This
						page is a data reading, not investment advice.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
