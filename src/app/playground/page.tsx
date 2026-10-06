import type { Metadata } from "next";
import Link from "next/link";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
	title: "Playground",
	description:
		"Small, working versions of ideas in progress: a tokenized-assets tracker, a stablecoin float tracker, a volatility gauge, a Bitcoin network pulse, a seismic watch, a solar watch, and weekly BTC and ETH macro notes. Live data, public method.",
	alternates: { canonical: "/playground" },
};

const EXPERIMENTS = [
	{
		href: "/playground/rwa",
		title: "Tokenized assets tracker",
		status: "Live",
		blurb:
			"The real-world-asset sector by the numbers: who is issuing, how much actually trades, and the race between venues wrapping the same stocks on different chains.",
		meta: "Refreshes about every 30 minutes",
	},
	{
		href: "/playground/stablecoins",
		title: "Stablecoin float tracker",
		status: "Live",
		blurb:
			"The crypto market's dry powder by the numbers: total stablecoin circulation, recent moves, and the full record since 2017.",
		meta: "Refreshes about every 30 minutes",
	},
	{
		href: "/playground/volatility",
		title: "Volatility gauge",
		status: "Live",
		blurb:
			"Crypto's fear gauge by the numbers: Bitcoin and Ethereum implied volatility, the day's move, and where each sits against its history since 2021.",
		meta: "Live reading, snapshot fallback",
	},
	{
		href: "/playground/network",
		title: "Bitcoin network pulse",
		status: "Live",
		blurb:
			"The Bitcoin network itself by the numbers: what a transaction costs right now, how full the mempool is, and when the next difficulty change lands.",
		meta: "Live reading, snapshot fallback",
	},
	{
		href: "/playground/seismic",
		title: "Seismic watch",
		status: "Live",
		blurb:
			"The week's significant earthquakes by the numbers: how many shook the planet, the largest event, and the latest ones, from the USGS feed.",
		meta: "Live reading, snapshot fallback",
	},
	{
		href: "/playground/solar",
		title: "Solar watch",
		status: "Live",
		blurb:
			"Earth's space weather by the numbers: the planetary K index right now, the past week of geomagnetic activity, and NOAA's three-day outlook.",
		meta: "Live reading, snapshot fallback",
	},
	{
		href: "/playground/macro",
		title: "BTC and ETH macro notes",
		status: "Weekly",
		blurb:
			"A weekly regime read from a backtested macro engine: the current phase, the signals behind it, and what would change the picture.",
		meta: "A new note every week",
	},
] as const;

export default function PlaygroundPage() {
	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Playground"
			intro="Small, working versions of ideas I keep coming back to. Live data, public method, honest labels."
		>
			<section aria-label="Experiments" className="grid gap-3 sm:grid-cols-2">
				{EXPERIMENTS.map((experiment) => (
					<Link
						key={experiment.href}
						href={experiment.href}
						className="group flex flex-col justify-between gap-6 rounded-xl border border-border bg-card px-5 py-5 transition-colors hover:border-alpha-500 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
					>
						<div className="flex flex-col gap-2.5">
							<div className="flex items-start justify-between gap-3">
								<span className="text-heading-20 text-foreground">{experiment.title}</span>
								<Badge variant="outline" className="mt-1 text-text-faint">
									{experiment.status}
								</Badge>
							</div>
							<p className="text-copy-14 text-text-muted">{experiment.blurb}</p>
						</div>
						<span className="text-label-12-mono text-text-faint">{experiment.meta}</span>
					</Link>
				))}
			</section>

			<p className="text-copy-13 text-text-faint">
				New experiments get added when they earn their place.
			</p>
		</PlaygroundShell>
	);
}
