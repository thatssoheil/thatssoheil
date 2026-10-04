import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { MACRO_NOTES } from "@/data/playground/macro-notes";
import { formatDateLong } from "@/lib/playground/format";

export const metadata: Metadata = {
	title: "BTC and ETH macro notes",
	description:
		"A weekly crypto macro regime read from a backtested engine: phase, signals, and what would change the picture.",
	alternates: { canonical: "/playground/macro" },
};

const REPO_URL = "https://github.com/thatssoheil/crypto-macro-analysis";

export default function MacroNotesPage() {
	const [latest, ...archive] = MACRO_NOTES;

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="BTC and ETH macro notes"
			intro="A weekly read of the crypto macro regime from a backtested engine. The method and the code are public; the notes change when the regime does."
			meta={
				<>
					Latest note: {formatDateLong(latest.date)} · engine data through{" "}
					{formatDateLong(latest.dataThrough)}
				</>
			}
		>
			<article aria-label="Latest note" className="flex flex-col gap-8">
				<header className="max-w-2xl">
					<p className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
						{formatDateLong(latest.date)}
					</p>
					<h2 className="mt-2 text-heading-32 text-foreground">{latest.title}</h2>
					<p className="mt-4 text-copy-16 text-text-muted">{latest.summary}</p>
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
						<h3 className="text-heading-20 text-foreground">{section.label}</h3>
						<div className="mt-3 flex flex-col gap-3">
							{section.body.map((paragraph, index) => (
								<p key={index} className="text-copy-16 text-text-muted">
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
								className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-alpha-200 py-3 first:border-t-0"
							>
								<span className="text-copy-14 text-foreground">{note.title}</span>
								<span className="text-label-12-mono text-text-faint">
									{formatDateLong(note.date)}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="text-copy-13 text-text-faint">
						This is the first note. A new read lands every week.
					</p>
				)}
			</section>

			<section aria-label="Method">
				<SectionHeading label="Method" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						The engine scores 14 weighted signals across liquidity, risk
						appetite, crypto internals, and inflation into a single regime
						score. The validated execution rule behind these notes is a 200-day
						moving-average trend filter, backtested on full-cycle data; the
						score itself is context, not a trigger.
					</p>
					<p>
						The code, the data pipeline, and the backtests are public:{" "}
						<a
							href={REPO_URL}
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							crypto-macro-analysis on GitHub
						</a>
						.
					</p>
					<p>These notes are a reading of the data, not investment advice.</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
