import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { NightSide } from "@/components/playground/night-side";
import { BAND_ROWS } from "@/lib/playground/night-side";

export const metadata: Metadata = {
	title: "Night side",
	description:
		"Earth's day/night line right now: the night side shaded, the twilight bands along its edge, the sun's overhead point marked, and a readout for five cities - computed in your browser.",
	alternates: { canonical: "/playground/night-side" },
};

export default function NightSidePage() {
	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Night side"
			intro="Half of Earth is always in daylight and half in night, and the line between them - the terminator - is where every sunrise and sunset on the planet is happening this minute. The map below is the world as it is right now: land as a dot field, the night side shaded, the twilight bands along the edge, and the sun's overhead point marked. It moves on its own."
			meta={
				<>
					No data feed - computed in your browser from the clock · After the Astronomical
					Almanac&apos;s low-precision solar formulas
				</>
			}
		>
			<section aria-label="The instrument">
				<SectionHeading label="The instrument" note="the day/night line, right now" />
				<NightSide />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						Each dot is a cell of land about 1.5 degrees wide, from a mask generated once from
						Natural Earth&apos;s 110m land layer (public domain) and committed to the page. The
						shading is the sun&apos;s altitude: the night side is where the sun is below the
						horizon, and the bands along its edge are the three twilight stages - civil, nautical,
						and astronomical - each marking how far below the horizon the sun has sunk. The ring
						marks the subsolar point, where the sun is directly overhead. The terminator sweeps 15
						degrees of longitude every hour.
					</p>
					<p>
						The sun&apos;s position is computed in your browser from your clock using the
						Astronomical Almanac&apos;s low-precision solar formulas (about 0.01 degrees, valid
						1950-2050). Nothing is fetched at runtime, so nothing here can go stale. The extremes
						fall out of the same math: in June the day side reaches past the Arctic Circle while
						the night side swallows Antarctica, and the whole shape flips with the seasons.
					</p>
				</div>
				<div className="mt-4 max-w-2xl overflow-hidden rounded-xl border border-border bg-card">
					<table className="w-full border-collapse text-left">
						<thead>
							<tr className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
								<th className="px-4 py-2.5 font-normal sm:px-6">Band</th>
								<th className="px-4 py-2.5 font-normal sm:px-6">Sun altitude</th>
							</tr>
						</thead>
						<tbody>
							{BAND_ROWS.map((row) => (
								<tr key={row.band} className="border-t border-alpha-200">
									<td className="px-4 py-2.5 text-copy-13 text-foreground sm:px-6">
										{row.label}
									</td>
									<td className="px-4 py-2.5 text-copy-13-mono text-text-muted sm:px-6">
										{row.range}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className="mt-3 max-w-2xl text-copy-13 text-text-faint">
					Solar position after the{" "}
					<a
						href="https://aa.usno.navy.mil/faq/sun_approx"
						target="_blank"
						rel="noreferrer"
						className="text-brand transition-opacity hover:opacity-75"
					>
						Astronomical Almanac&apos;s low-precision formulas
					</a>{" "}
					(page C5; USNO&apos;s public mirror). Land mask from{" "}
					<a
						href="https://www.naturalearthdata.com/about/terms-of-use/"
						target="_blank"
						rel="noreferrer"
						className="text-brand transition-opacity hover:opacity-75"
					>
						Natural Earth
					</a>{" "}
					(public domain). The map and the readout were verified at build time against published
					landmarks: the solstice declination, the half-and-half day fraction, and sunrise and
					sunset times within about two minutes of two independent services.
				</p>
			</section>
		</PlaygroundShell>
	);
}
