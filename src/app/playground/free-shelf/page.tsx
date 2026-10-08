import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { FreeShelf } from "@/components/playground/free-shelf";
import { getFreeShelfData } from "@/lib/playground/free-shelf-source";
import { formatDateShort, formatDateTimeUtc } from "@/lib/playground/format";

// The page renders per request from the live chart (with a per-isolate cache
// in the source module) - never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Free shelf",
	description:
		"Project Gutenberg's most-downloaded books: what the world is reading for free, in three windows, covers and all. Every entry opens the full text.",
	alternates: { canonical: "/playground/free-shelf" },
};

export default async function FreeShelfPage() {
	const data = await getFreeShelfData();
	const chartDate = data.chartModified ?? data.asOf;

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Free shelf"
			intro="Project Gutenberg's most-downloaded books: what the world is reading for free, in three windows - yesterday, the last 7 days, the last 30 days. Every cover opens the book's page, where the full text waits."
			meta={
				<>
					Data: Project Gutenberg · chart generated {formatDateTimeUtc(chartDate)}
					{data.provenance === "snapshot"
						? ` · showing the committed snapshot (read ${formatDateShort(data.asOf)})`
						: ""}
				</>
			}
		>
			<section aria-label="The shelf">
				<SectionHeading label="The shelf" note="top 20 per window" />
				<FreeShelf data={data} />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						This page reads Project Gutenberg&apos;s own most-downloaded chart. The library
						is the oldest on the internet, all of it public domain and free to read; its
						chart publishes three windows - yesterday, the last 7 days, and the last 30
						days - and the windows tell different stories, so the toggle switches between
						them. The ranking is PG&apos;s, shown as PG shows it.
					</p>
					<p>
						Downloads are PG&apos;s own counters, with PG&apos;s counting rules: multiple
						downloads from the same address on the same day count once, and addresses that
						pull more than 100 books in a day are treated as robots and excluded. The chart
						regenerates about once a day; this page re-reads it at most once an hour and
						labels the chart&apos;s own generation time. When PG cannot be reached, the
						page serves a committed snapshot and says so.
					</p>
					<p>
						Covers come from PG&apos;s own cover cache; a book without one shows a plain
						tile. Every entry links to the book&apos;s landing page on gutenberg.org - the
						full text is free there. Data:{" "}
						<a
							href="https://www.gutenberg.org/browse/scores/top"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							Project Gutenberg
						</a>{" "}
						(public domain). The page identifies itself politely and reads one chart page
						per hour at most - a reading list, not a downloader.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
