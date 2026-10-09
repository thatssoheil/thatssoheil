import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { GreatCircle } from "@/components/playground/great-circle";

export const metadata: Metadata = {
	title: "Great circle",
	description:
		"Why flights curve on a map: pick any two of the world's 4,133 airports with scheduled service and see the shortest path twice - as a flat map draws it, and as the Earth does.",
	alternates: { canonical: "/playground/great-circle" },
};

export default function GreatCirclePage() {
	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Great circle"
			intro="The shortest path between two cities is not a straight line on a map. New York to London, drawn flat, bows north over the Atlantic - a straight line in latitude and longitude is not the shortest line on a sphere. Pick any two of the world's 4,133 airports with scheduled service and see the route twice: as the flat map draws it, bent, and as the Earth draws it, straight."
			meta={
				<>
					Computed in your browser - an instrument, not a feed · 4,133 airports from OurAirports,
					public domain
				</>
			}
		>
			<section aria-label="The instrument">
				<SectionHeading label="The instrument" note="pick two airports" />
				<GreatCircle />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						A great circle is the shortest path between two points on a sphere - the line a taut
						string would take across a globe. On a flat map it looks curved, because the map has to
						stretch the sphere to lay it out; on the Earth itself it is straight. That is why a long
						flight bends north on the seat-back map: the bend belongs to the map, not the route.
					</p>
					<p>
						Distances here are computed on a spherical Earth with a radius of 6,371.0088 km - the
						convention that matches published route distances to a tenth of a kilometer on the
						landmarks checked at build time (New York to London reads 5,539.8 km against a published
						5,540; Sydney to Los Angeles reads 12,061 against 12,061). The flight time is the distance
						divided by 850 km/h plus 30 minutes of taxi - a labeled estimate, not a schedule. The
						globe view is centered on the route&apos;s midpoint, which is exactly the angle that
						renders the path as a straight line.
					</p>
					<p>
						The airport table holds 4,133 airports with scheduled service and IATA codes, from{" "}
						<a
							href="https://ourairports.com/data/"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							OurAirports
						</a>{" "}
						(public domain), committed to the page with coordinates rounded to 3 decimals - about 100
						meters, worth at most about 130 meters on any route. A cross-check against{" "}
						<a
							href="https://openflights.org/data.html"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							OpenFlights
						</a>{" "}
						(a second open dataset) found the 3,744 shared codes agreeing to a median of 0.00 km; 55
						codes differ by more than 5 km, where an airport was reassigned or relocated - drift, not
						error. Nothing is fetched at runtime, so nothing here can go stale.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
