import type { Metadata } from "next";
import Link from "next/link";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
	title: "Playground",
	description:
		"Small, working versions of ideas in progress: a tokenized-assets tracker, a stablecoin float tracker, a volatility gauge, a Bitcoin network pulse, a seismic watch, a solar watch, a Tehran air panel, a daily chess puzzle, a dollar dry powder panel, a Hafez fal, a Euclidean rhythm machine, a logistic map dial, a night-side map of Earth, a free shelf of Project Gutenberg's most-downloaded books, a sugar-cubes check for packaged food and drink, a great-circle route viewer, a color-vision palette simulator, a Persian calendar, and weekly BTC and ETH macro notes. Live data, public method.",
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
		href: "/playground/air",
		title: "Tehran air",
		status: "Live",
		blurb:
			"The air in Tehran by the numbers: PM2.5 and PM10 right now, the past two days and today's rise and fall, and how the current hour sits against the WHO guideline.",
		meta: "Live reading, snapshot fallback",
	},
	{
		href: "/playground/chess",
		title: "Chess puzzle",
		status: "Live",
		blurb:
			"The day's puzzle from Lichess, solvable on the page: click a piece, then its destination, and find the line the position hides.",
		meta: "A new puzzle every day",
	},
	{
		href: "/playground/dry-powder",
		title: "Dollar dry powder",
		status: "Live",
		blurb:
			"Where the dollar system's spare cash sits by the numbers: the Treasury's account at the Federal Reserve and the overnight reverse repo pool, each against its history.",
		meta: "Live reading, snapshot fallback",
	},
	{
		href: "/playground/hafez-fal",
		title: "Hafez fal",
		status: "Live",
		blurb:
			"A draw from Hafez's Divan, live: hold a wish, then draw, and a random ghazal opens in the original Persian, exactly as Ganjoor serves it.",
		meta: "A random ghazal per draw",
	},
	{
		href: "/playground/rhythm-circle",
		title: "Rhythm circle",
		status: "Live",
		blurb:
			"Euclid's algorithm as an instrument: spread a few pulses evenly around a ring and hear the tresillo, the bossa nova, the aksak - the timeline patterns of world music, drawn by the same math.",
		meta: "Sound on - an instrument, not a feed",
	},
	{
		href: "/playground/logistic-map",
		title: "Logistic map",
		status: "Live",
		blurb:
			"One equation and one dial, from order into chaos: turn r and watch the orbit settle, split, and dissolve - with an island of order waiting past 3.82.",
		meta: "Computed in your browser - an instrument, not a feed",
	},
	{
		href: "/playground/night-side",
		title: "Night side",
		status: "Live",
		blurb:
			"Earth's day/night line right now: the night side shaded, the twilight bands along its edge, the sun's overhead point marked, and a readout for five cities.",
		meta: "Computed in your browser - an instrument, not a feed",
	},
	{
		href: "/playground/free-shelf",
		title: "Free shelf",
		status: "Live",
		blurb:
			"What the world is reading for free: Project Gutenberg's most-downloaded books across three windows, every cover one click from the full text.",
		meta: "Live reading, snapshot fallback",
	},
	{
		href: "/playground/sugar-cubes",
		title: "Sugar cubes",
		status: "Live",
		blurb:
			"How much sugar is actually in that: search any packaged food or drink and see its sugars as a stack of cubes, against the WHO's daily guideline.",
		meta: "Live reading, snapshot fallback",
	},
	{
		href: "/playground/great-circle",
		title: "Great circle",
		status: "Live",
		blurb:
			"Why flights curve on a map: pick any two of 4,133 airports with scheduled service and see the shortest path twice - bowed on the flat map, straight on the globe.",
		meta: "Computed in your browser - an instrument, not a feed",
	},
	{
		href: "/playground/color-vision",
		title: "Color vision",
		status: "Live",
		blurb:
			"What the web looks like through colorblind eyes: this site's own palette and a full hue circle, simulated through the 2009 reference model - pick a type and a severity.",
		meta: "Computed in your browser - an instrument, not a feed",
	},
	{
		href: "/playground/persian-calendar",
		title: "Persian calendar",
		status: "Live",
		blurb:
			"Today in Iran's calendar: the Shamsi date right now, the current month you can walk day by day, a countdown to Nowruz, and a two-way converter between the calendars.",
		meta: "Computed in your browser - an instrument, not a feed",
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
