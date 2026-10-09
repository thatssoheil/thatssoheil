import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { ColorVision } from "@/components/playground/color-vision";

export const metadata: Metadata = {
	title: "Color vision",
	description:
		"What the web looks like through colorblind eyes: a full hue circle and this site's own palette, simulated through the 2009 Machado-Oliveira-Fernandes model - pick a type and a severity.",
	alternates: { canonical: "/playground/color-vision" },
};

export default function ColorVisionPage() {
	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Color vision"
			intro="About 1 in 12 men and 1 in 200 women see color differently. Pick a type - protan, deutan, or tritan - and a severity, and watch a full hue circle and this site's own palette transform through the Machado, Oliveira and Fernandes 2009 model, side by side with normal vision."
			meta={
				<>
					Computed in your browser - an instrument, not a feed · Machado, Oliveira and Fernandes, 2009
				</>
			}
		>
			<section aria-label="The instrument">
				<SectionHeading label="The instrument" note="pick a type and a severity" />
				<ColorVision />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						Color vision deficiency is not one condition but a family: the cone cells that carry red,
						green, or blue sensitivity are shifted, and colors most eyes tell apart converge. This
						page simulates it with the model of Machado, Oliveira and Fernandes (2009) - the modern
						reference model, which covers both the partial (anomalous) and complete forms in one
						framework. Its 33 precomputed matrices - three types times eleven severity steps - are
						applied in linear light: the color is decoded from sRGB, the matrix acts, and the result
						is re-encoded. Severity blends the two nearest tables linearly, the way the
						authors&apos; own page teaches.
					</p>
					<p>
						The subjects: a full hue circle at fixed lightness and chroma, where the collapse is
						widest; this site&apos;s own palette, read live from the rendered design tokens (the
						swatches follow the current theme - the site flips light and dark by the hour); and any
						color you bring from a native picker. Hex readouts come from the browser&apos;s own
						resolution of each color: the palette values are read back from a canvas after the
						browser paints them, so the numbers are what this site actually renders.
					</p>
					<p>
						The matrices come from the authors&apos; published table, captured 2026-10-09 and pinned
						by content hash; the model is described in{" "}
						<a
							href="https://doi.org/10.1109/TVCG.2009.113"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							Machado, Oliveira and Fernandes (2009)
						</a>
						, IEEE Transactions on Visualization and Computer Graphics 15(6):1291-1298. Nothing is
						fetched at runtime, so nothing here can go stale.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
