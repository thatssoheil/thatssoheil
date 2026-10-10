import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { Antipodes } from "@/components/playground/antipodes";

export const metadata: Metadata = {
	title: "Antipodes",
	description:
		"The other side of the Earth: pick any of 7,342 places and see the exact point opposite it - land or open ocean, the nearest place, and the numbers every pair shares.",
	alternates: { canonical: "/playground/antipodes" },
};

export default function AntipodesPage() {
	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Antipodes"
			intro="The antipode of a place is the exact other side of the Earth - the point you would reach by digging straight through the center. Pick any of the world's 7,342 mapped places and see where it lands: on land or open ocean, which place sits nearest to it, and the facts every pair shares - the same 20,015 km apart over the surface, half the circumference, with the local clock flipped by 12 hours."
			meta={
				<>
					Computed in your browser - an instrument, not a feed · 7,342 places from Natural Earth,
					public domain
				</>
			}
		>
			<section aria-label="The instrument">
				<SectionHeading label="The instrument" note="pick a place" />
				<Antipodes />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						An antipode is the point diametrically opposite on the globe: flip the latitude and shift the
						longitude by 180 degrees. Both points of a pair can never be seen together on a globe - they
						sit on exactly opposite sides - but a flat map shows them at once. Because most of the Earth
						is ocean, most antipodes land in water: on this page&apos;s own measurement, only about 13
						percent of the planet&apos;s land has land directly opposite it (published figures run about
						15 percent, depending on how islands and coastlines are counted).
					</p>
					<p>
						Distances are computed on a spherical Earth with a radius of 6,371.0088 km - the same
						convention as the great-circle piece. The surface distance between antipodes is always half
						the circumference, 20,015 km, and the straight path through the center is the diameter,
						12,742 km. The local solar clock flips exactly 12 hours: solar noon at one point is solar
						midnight at the other. No airliner can fly a full-load nonstop between antipodes - the
						longest-range jet in service, an A350-900ULR, covers about 18,000 km, roughly 90 percent of
						the distance.
					</p>
					<p>
						The place table holds 7,342 populated places from{" "}
						<a
							href="https://www.naturalearthdata.com/about/terms-of-use/"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							Natural Earth
						</a>{" "}
						(public domain, version 5.1.2), committed to the page with coordinates rounded to 3 decimals
						- about 100 meters per coordinate. The nearest-place readout is measured over the same table,
						so tiny settlements can be missing; a cross-check against Natural Earth&apos;s coarser 1:50m
						file found coordinates identical where both list a place. Pairs quoted in{" "}
						<a
							href="https://en.wikipedia.org/wiki/Antipodes_on_Earth"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							Antipodes on Earth
						</a>{" "}
						reproduce closely: Taipei and Asunción, about 80 km apart in the article, read 85.9 km on
						these coordinates. Land and ocean come from the same 1.5-degree grid the map draws (cells
						about 150 km across); near a coast the reading can flip - about 1 in 80 places checked
						against full-detail geography differs. Nothing is fetched at runtime, so nothing here goes
						stale.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
