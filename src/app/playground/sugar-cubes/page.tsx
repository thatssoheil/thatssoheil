import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { SugarCubes } from "@/components/playground/sugar-cubes";
import { getSugarData } from "@/lib/playground/sugar-source";
import { formatDateShort, formatDateTimeUtc } from "@/lib/playground/format";
import type { SugarData } from "@/lib/playground/types";

// The page renders per request from the live search (with a per-isolate
// cache in the source module) - never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Sugar cubes",
	description:
		"How much sugar is actually in that: search any packaged food or drink and see its sugars as a stack of cubes - per 100 grams, per serving when the label says, against the WHO's 25 g daily guideline. Open Food Facts, keyless and open.",
	alternates: { canonical: "/playground/sugar-cubes" },
};

function metaLine(data: SugarData) {
	if (data.mode === "search") {
		return (
			<>
				Data: Open Food Facts (ODbL) · fetched {formatDateTimeUtc(data.asOf)}
				{data.totalCount === null ? "" : ` · ${data.totalCount.toLocaleString("en-US")} matches`} for &quot;
				{data.query}&quot;
			</>
		);
	}
	if (data.query !== "") {
		return (
			<>
				Data: Open Food Facts (ODbL) · live search unavailable -{" "}
				{data.fallback === "match" ? "showing the curated entry" : "showing the curated set"} from the committed
				snapshot ({formatDateShort(data.asOf)})
			</>
		);
	}
	return (
		<>
			Data: Open Food Facts (ODbL) · curated set from the committed snapshot ({formatDateShort(data.asOf)})
		</>
	);
}

function sectionNote(data: SugarData): string {
	if (data.mode === "search") {
		const count = data.totalCount === null ? data.results.length : data.totalCount.toLocaleString("en-US");
		return `${count} matches for "${data.query}"`;
	}
	if (data.query === "") return `${data.results.length} curated items · search for anything`;
	return data.fallback === "match" ? `curated entry for "${data.query}"` : "curated set · live search unavailable";
}

export default async function SugarCubesPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const params = await searchParams;
	const raw = params.q;
	const query = typeof raw === "string" ? raw : Array.isArray(raw) ? (raw[0] ?? "") : "";
	const data = await getSugarData(query);

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Sugar cubes"
			intro="Search any packaged food or drink and see its sugar as a stack of cubes - one cube is about 4 grams. Each stack sits against the WHO's line for the day: under 25 grams of free sugars, about six cubes."
			meta={metaLine(data)}
		>
			<section aria-label="The check">
				<SectionHeading label="The check" note={sectionNote(data)} />
				<SugarCubes key={data.query} data={data} />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						Every product comes from{" "}
						<a
							href="https://world.openfoodfacts.org"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							Open Food Facts
						</a>
						, a community database of packaged food and drink - millions of entries, written and checked
						by volunteers, open to everyone. The sugars figures are the ones on each product&apos;s
						nutrition panel as the database has it; nothing here is estimated. Each result opens its own
						entry, where the number can be checked at the source.
					</p>
					<p>
						One cube is about 4 grams of sugar (brand cubes run 2.5 to 5 grams).{" "}
						<a
							href="https://www.who.int/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake-among-adults-and-children"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							The WHO suggests
						</a>{" "}
						keeping free sugars under 25 grams a day - about six cubes - and each card shows the
						product&apos;s sugars against that line. Free sugars are the added sugars plus those in honey,
						syrups, and fruit juice.
					</p>
					<p>
						The page reads Open Food Facts live on every search - submitted searches only, because the
						database&apos;s rules forbid search-as-you-type - caches each query&apos;s result for an hour,
						and identifies itself politely. When the database cannot be reached, the page serves a
						committed snapshot of a curated set and says so. Data: Open Food Facts (ODbL, keyless and
						open); images unused.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
