import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { LogisticMap } from "@/components/playground/logistic-map";
import { FEIGENBAUM_DELTA, ONSET_TABLE } from "@/lib/playground/logistic";

export const metadata: Metadata = {
	title: "Logistic map",
	description:
		"One equation and one dial, from order into chaos: the logistic map's period-doubling cascade, computed in your browser. Drag r and watch orbits settle, split, and dissolve - and an island of order return.",
	alternates: { canonical: "/playground/logistic-map" },
};

export default function LogisticMapPage() {
	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Logistic map"
			intro="One equation, x -> r*x*(1-x), and one dial. At low r every orbit settles to a single value; push r past 3.0 and the orbit splits in two, then four, then eight - and at r about 3.57 order dissolves into chaos. Keep turning and an island of order returns. Drag the dial and watch the orbit respond."
			meta={<>No data feed - the map is computed in the page · After May, 1976</>}
		>
			<section aria-label="The instrument">
				<SectionHeading label="The instrument" note="one dial - order into chaos" />
				<LogisticMap />
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						The logistic map is the canonical model of how a simple rule makes
						complicated behavior: x(t+1) = r*x(t)*(1-x(t)), where each value is the
						next generation as a fraction of the maximum and r is the growth rate.
						Robert May&apos;s 1976 paper showed that this one line covers stable
						points, cycles of every length, and full chaos - and that the route
						between them, period doubling, runs at the same universal rate in fluid
						flows, electronic circuits, and heart cells.
					</p>
					<p>
						The atlas is computed in your browser: each column is one r, and its dots
						are where the orbit visits after a burn-in. The readout measures the cycle
						length from the orbit itself as you turn the dial; right at an onset it
						can read the next period a hair early while the orbit is still settling,
						so once the dial settles the page runs a deeper search, and the landmark
						stops read the post-onset value. Nothing is fetched at runtime, so
						nothing here can go stale.
					</p>
					<p>
						Every value in the table below was verified against the page&apos;s own
						machinery at build time - the deepest onsets within a few parts per
						million of the published values. The cascade&apos;s universal rate is
						Feigenbaum&apos;s delta = {FEIGENBAUM_DELTA}...
					</p>
				</div>
				<div className="mt-4 max-w-2xl overflow-hidden rounded-xl border border-border bg-card">
					<table className="w-full border-collapse text-left">
						<thead>
							<tr className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
								<th className="px-4 py-2.5 font-normal sm:px-6">Onset</th>
								<th className="px-4 py-2.5 font-normal sm:px-6">r</th>
								<th className="px-4 py-2.5 font-normal sm:px-6">Closed form</th>
							</tr>
						</thead>
						<tbody>
							{ONSET_TABLE.map((row) => (
								<tr key={row.name} className="border-t border-alpha-200">
									<td className="px-4 py-2.5 text-copy-13 text-foreground sm:px-6">
										{row.name}
									</td>
									<td className="px-4 py-2.5 text-copy-13-mono text-text-muted sm:px-6">
										{row.r}
									</td>
									<td className="px-4 py-2.5 text-copy-13-mono text-text-faint sm:px-6">
										{row.exact ?? "-"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className="mt-3 max-w-2xl text-copy-13 text-text-faint">
					Landmarks after{" "}
					<a
						href="https://www.nature.com/articles/261459a0"
						target="_blank"
						rel="noreferrer"
						className="text-brand transition-opacity hover:opacity-75"
					>
						May, 1976
					</a>
					, &quot;Simple mathematical models with very complicated dynamics&quot;, Nature
					261, 459-467;{" "}
					<a
						href="https://doi.org/10.1007/BF01020332"
						target="_blank"
						rel="noreferrer"
						className="text-brand transition-opacity hover:opacity-75"
					>
						Feigenbaum, 1978
					</a>
					, J. Stat. Phys. 19, 25-52;{" "}
					<a
						href="https://doi.org/10.1080/00029890.1975.11994008"
						target="_blank"
						rel="noreferrer"
						className="text-brand transition-opacity hover:opacity-75"
					>
						Li &amp; Yorke, 1975
					</a>
					, &quot;Period Three Implies Chaos&quot;, Amer. Math. Monthly 82(10), 985-992.
				</p>
			</section>
		</PlaygroundShell>
	);
}
