import type { SectionId } from "@/lib/constants";
import { MANIFESTO } from "@/data/manifesto";
import { SectionPanel } from "@/components/sections/section-panel";
import { textRole, typeRole } from "@/components/ui/typography";

export function ManifestoSection() {
	return (
		<SectionPanel
			id={"manifesto" satisfies SectionId}
			kind="manifesto"
			ariaLabel="Manifesto"
			eyebrow={MANIFESTO.label}
			heading={MANIFESTO.heading}
			intro={MANIFESTO.subheading}
		>
			<div className="flex flex-col gap-8 sm:gap-10">
				{MANIFESTO.paragraphs.map((p, index) => (
					<div
						key={p.label}
						className="relative grid gap-3 pt-6 first:pt-0 sm:grid-cols-[8.75rem_minmax(0,1fr)]"
					>
						{index > 0 ? (
							<span
								aria-hidden="true"
								className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--alpha-300),transparent)]"
							/>
						) : null}
						<p className={`whitespace-nowrap pt-[0.35em] text-text-faint ${typeRole.manifestoEntryLabel}`}>
							{p.label}
						</p>
						<p className={`text-left text-base leading-relaxed sm:text-lg ${textRole.muted}`}>
							{p.body}
						</p>
					</div>
				))}
			</div>
		</SectionPanel>
	);
}
