import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { HafezFal } from "@/components/playground/hafez-fal";
import { getHafezData, getHafezFallbackSet } from "@/lib/playground/hafez-source";

// The page renders per request: the first draw comes live from Ganjoor (with
// a per-isolate cache in the source module) and is never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Hafez fal",
	description:
		"The classic Hafez fal, drawn live: hold a wish, then draw, and a random ghazal opens in the original Persian, exactly as Ganjoor serves it.",
	alternates: { canonical: "/playground/hafez-fal" },
};

export default async function HafezFalPage() {
	const data = await getHafezData();
	const fallbackSet = getHafezFallbackSet();

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Hafez fal"
			intro="The old Persian ritual of the fal: hold a wish, then draw, and a random ghazal of Hafez opens in the original Persian. The first draw arrives with the page; each redraw is fresh from Ganjoor's fal service."
			meta={<>Data: Ganjoor fal service (ganjoor.net) · text kept exactly as served</>}
		>
			<section aria-label="The draw">
				<SectionHeading label="The draw" note="a random ghazal per draw" />
				<HafezFal initial={data} fallbackSet={fallbackSet} />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						This page is a window onto an established ritual rather than a re-creation:
						Ganjoor&apos;s own fal service draws a random ghazal from Hafez&apos;s Divan, the
						way opening the book at random would. The draw is random every time; the page adds
						no reading and no advice.
					</p>
					<p>
						The first draw is fetched when the page loads and rendered with it; each redraw asks
						Ganjoor directly from your browser. When Ganjoor cannot be reached, the draw comes
						from a set of ghazals committed to this page and the label above the poem says so.
						The Persian text is kept exactly as served, diacritics and all.
					</p>
					<p>
						Data:{" "}
						<a
							href="https://api.ganjoor.net"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							Ganjoor&apos;s fal API
						</a>{" "}
						(keyless and public; the classical text is in the public domain). Draws are one
						request each, and the first draw is cached for about a minute per running instance.
						Attribution: &quot;Text from Ganjoor&quot;, with a link to the ghazal.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
