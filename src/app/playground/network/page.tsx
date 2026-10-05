import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { FeeHistogram } from "@/components/playground/fee-histogram";
import { getNetworkPulseData } from "@/lib/playground/network-source";
import {
	formatDateShort,
	formatDateTimeUtc,
	formatPct,
	formatUsdCents,
} from "@/lib/playground/format";

// The page renders per request from the live API (with a per-isolate cache in
// the source module) - never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Bitcoin network pulse",
	description:
		"The Bitcoin network itself, read live: what a transaction costs right now, how full the mempool is, and when the next difficulty change lands. Source: mempool.space.",
	alternates: { canonical: "/playground/network" },
};

/** A standard SegWit payment: one input, two outputs, about 141 vB. */
const TYPICAL_TRANSFER_VBYTES = 141;

function formatSats(value: number): string {
	return `${Math.round(value).toLocaleString("en-US")} sats`;
}

function formatBlockAge(timestampSec: number, asOfMs: number): string {
	const minutes = Math.max(0, Math.round((asOfMs - timestampSec * 1000) / 60_000));
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes} min ago`;
	const hours = Math.floor(minutes / 60);
	return `${hours} h ${minutes % 60} min ago`;
}

export default async function BitcoinNetworkPulsePage() {
	const data = await getNetworkPulseData();
	const asOfMs = Date.parse(data.asOf);
	const transferFastest = data.fees.fastest * TYPICAL_TRANSFER_VBYTES;
	const transferEconomy = data.fees.economy * TYPICAL_TRANSFER_VBYTES;
	const usdOf = (satsAmount: number) => (satsAmount / 1e8) * data.priceUsd;
	const daysToRetarget = Math.max(
		0,
		Math.round((data.difficulty.retargetAt - asOfMs) / 86_400_000),
	);

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Bitcoin network pulse"
			intro="The Bitcoin network itself: what a transaction costs right now, how full the mempool is, and when the next difficulty change lands."
			meta={
				<>
					Data: mempool.space · as of {formatDateTimeUtc(data.asOf)}
					{data.provenance === "snapshot" ? " · showing the last good snapshot" : ""}
				</>
			}
		>
			<section aria-label="What a transaction costs">
				<SectionHeading label="What a transaction costs" note="sat/vB, live estimate" />
				<div className="flex flex-col gap-3">
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<StatTile
							label="Next block"
							value={`${data.fees.fastest} sat/vB`}
							hint="about 10 minutes"
						/>
						<StatTile
							label="About 30 minutes"
							value={`${data.fees.halfHour} sat/vB`}
							hint="about 3 blocks"
						/>
						<StatTile
							label="About 1 hour"
							value={`${data.fees.hour} sat/vB`}
							hint="about 6 blocks"
						/>
						<StatTile
							label="No rush"
							value={`${data.fees.economy} sat/vB`}
							hint="whenever it clears"
						/>
					</div>
					<div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
						<p className="text-copy-14 text-text-muted">
							A typical transfer (one input, two outputs, about 141 vB) costs about{" "}
							<span className="text-foreground">{formatSats(transferFastest)}</span> (
							{formatUsdCents(usdOf(transferFastest))}) at the next-block rate, or{" "}
							{formatSats(transferEconomy)} ({formatUsdCents(usdOf(transferEconomy))}) with
							no rush.
						</p>
					</div>
				</div>
			</section>

			<section aria-label="The backlog">
				<SectionHeading label="The backlog" note="unconfirmed, live" />
				<div className="flex flex-col gap-3">
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<StatTile
							label="Waiting transactions"
							value={data.mempool.count.toLocaleString("en-US")}
							hint="unconfirmed, in the mempool"
						/>
						<StatTile
							label="Backlog size"
							value={`${(data.mempool.vsize / 1e6).toFixed(1)} MvB`}
							hint="of block space"
						/>
						<StatTile
							label="Fees offered"
							value={`${(data.mempool.totalFee / 1e8).toFixed(4)} BTC`}
							hint="sum across the queue"
						/>
					</div>
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<span className="mb-3 block text-label-12 uppercase tracking-[0.14em] text-text-faint">
							Waiting volume by fee band
						</span>
						<FeeHistogram
							buckets={data.histogram}
							ariaLabel={`Waiting transaction volume by fee-rate band, sat/vB; total about ${(data.mempool.vsize / 1e6).toFixed(1)} MvB`}
						/>
					</div>
				</div>
			</section>

			<section aria-label="Next difficulty change">
				<SectionHeading label="Next difficulty change" note="estimated, moves until the retarget" />
				<div className="flex flex-col gap-3">
					<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
						<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
							<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
								Epoch progress
							</span>
							<span className="text-label-12-mono text-text-muted">
								{data.difficulty.progressPercent.toFixed(1)}%
							</span>
						</div>
						<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
							<div
								className="h-full rounded-full bg-brand"
								style={{
									width: `${Math.min(Math.max(data.difficulty.progressPercent, 0), 100)}%`,
								}}
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<StatTile
							label="Estimated change"
							value={formatPct(data.difficulty.changePercent)}
							hint={`last retarget ${formatPct(data.difficulty.previousChangePercent, 2)}`}
						/>
						<StatTile
							label="Blocks to go"
							value={data.difficulty.remainingBlocks.toLocaleString("en-US")}
							hint="of 2,016 this epoch"
						/>
						<StatTile
							label="Expected"
							value={formatDateShort(new Date(data.difficulty.retargetAt).toISOString())}
							hint={`about ${daysToRetarget} days away`}
						/>
					</div>
				</div>
			</section>

			<section aria-label="Recent blocks">
				<SectionHeading label="Recent blocks" note="newest first" />
				<div className="rounded-xl border border-border bg-card px-4 py-1 sm:px-6 sm:py-2">
					<div className="flex flex-col">
						{data.blocks.map((block) => (
							<div
								key={block.height}
								className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t border-border py-2.5 first:border-t-0"
							>
								<span className="text-copy-13-mono text-foreground">
									{block.height.toLocaleString("en-US")}
								</span>
								<span className="text-copy-13 text-text-muted">
									{formatBlockAge(block.timestamp, asOfMs)}
								</span>
								<span className="text-copy-13 text-text-muted">
									{block.txCount.toLocaleString("en-US")} txs
								</span>
								<span className="text-copy-13-mono text-text-muted">
									{(block.size / 1e6).toFixed(2)} MvB
								</span>
							</div>
						))}
					</div>
				</div>
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						Fee estimates, mempool state, and block data come from mempool.space&apos;s
						public API, fetched by this site about every minute. When the API is
						unreachable, the page serves the last good snapshot and says so. Source:
						mempool.space.
					</p>
					<p>
						Fees are quoted in satoshis per virtual byte (sat/vB) for a confirmation
						target: the next block is about 10 minutes, about 30 minutes is about 3
						blocks, and about 1 hour is about 6 blocks. The no-rush estimate is a slower
						rate for transactions with no deadline; the relay floor is currently{" "}
						{data.fees.minimum} sat/vB, the cheapest rate nodes will relay at all. The
						typical transfer assumes a standard SegWit payment of about 141 vB (one
						input, two outputs); the dollar figure uses the BTC price from the same
						feed.
					</p>
					<p>
						The difficulty adjustment is Bitcoin&apos;s automatic retarget every 2,016
						blocks, about two weeks; the estimate moves as blocks arrive until the
						change locks in. The backlog chart bands the waiting volume by fee rate, in
						sat/vB. This page is a data reading, not investment advice.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
