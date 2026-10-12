import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { MACRO_NOTES } from "@/data/playground/macro-notes";
import { formatDateLong } from "@/lib/playground/format";
import { Link } from "@/components/ui";

export const metadata: Metadata = {
	title: "BTC and ETH macro notes",
	description:
		"A weekly crypto macro regime read from a backtested model: phase, signals, and what would change the picture.",
	alternates: { canonical: "/playground/macro" },
};

const REPO_URL = "https://github.com/thatssoheil/crypto-macro-analysis";

export default function MacroNotesPage() {
	const [latest, ...archive] = MACRO_NOTES;

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="BTC and ETH macro notes"
			intro="A weekly read of the crypto macro regime from a backtested model. The method and code are public; the notes change when the regime changes."
			meta={
				<>
					Latest note: {formatDateLong(latest.date)}; data through{" "}
					{formatDateLong(latest.dataThrough)}.
				</>
			}
		>
			<article aria-label="Latest note" className="flex flex-col gap-8">
				<header className="max-w-2xl">
					<p className="text-label uppercase  text-kumo-default opacity-70">
						{formatDateLong(latest.date)}
					</p>
					<h2 className="mt-2 text-display text-kumo-default">{latest.title}</h2>
					<p className="mt-4 text-body text-kumo-default opacity-80">{latest.summary}</p>
				</header>

				<section aria-label="Verdict" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<StatTile label="BTC" value={latest.verdict.btc} />
					<StatTile label="ETH" value={latest.verdict.eth} />
					<StatTile label="BTC score" value={latest.verdict.btcScore} hint="-3 to +3, weighted" />
					<StatTile label="ETH score" value={latest.verdict.ethScore} hint="-3 to +3, weighted" />
					<StatTile label="Stance" value={latest.verdict.stance} />
					<StatTile label="Phase" value={latest.verdict.phase} />
				</section>

				{latest.sections.map((section) => (
					<section key={section.label} className="max-w-2xl">
						<h3 className="text-heading text-kumo-default">{section.label}</h3>
						<div className="mt-3 flex flex-col gap-3">
							{section.body.map((paragraph, index) => (
								<p key={index} className="text-body text-kumo-default opacity-80">
									{paragraph}
								</p>
							))}
						</div>
					</section>
				))}
			</article>

			<section aria-label="Archive">
				<SectionHeading label="Archive" />
				{archive.length > 0 ? (
					<ul className="flex flex-col">
						{archive.map((note) => (
							<li
								key={note.date}
								className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-kumo-hairline py-3 first:border-t-0"
							>
								<span className="text-body-sm text-kumo-default">{note.title}</span>
								<span className="text-code text-kumo-default opacity-70">
									{formatDateLong(note.date)}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-body-sm text-kumo-default opacity-70">
						This is the first note. A new read lands every week.
					</p>
				)}
			</section>

			<section aria-label="Method">
				<SectionHeading label="Method" />
				<div className="flex max-w-2xl flex-col gap-3 text-body-sm text-kumo-default opacity-70">
					<p>
						The model combines 14 weighted signals across liquidity, risk appetite,
						crypto internals, and inflation into one regime score. The validated execution rule behind these notes is a 200-day
						moving-average trend filter, backtested on full-cycle data; the
						score itself is context, not a trigger.
					</p>
					<p>
						The code, input data, and backtests are public:{" "}
						<Link
							href={REPO_URL}
							target="_blank"
							rel="noreferrer"
							className="text-kumo-link transition-opacity hover:opacity-75"
						>
							crypto-macro-analysis on GitHub
						</Link>
						.
					</p>
					<p>These notes are a reading of the data, not investment advice.</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
