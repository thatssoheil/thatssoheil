import type { SectionId } from "@/lib/constants";
import { MANIFESTO } from "@/data/manifesto";
import { SectionPanel } from "@/components/sections/section-panel";
import { Separator, typeRole } from "@/components/ui";

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
				{MANIFESTO.paragraphs.map((paragraph, index) => (
					<div
						key={paragraph.label}
						className="relative grid gap-3 pt-6 first:pt-0 sm:grid-cols-[8.75rem_minmax(0,1fr)]"
					>
						{index > 0 ? (
							<Separator className="absolute inset-x-0 top-0" aria-hidden="true" />
						) : null}
						<p className={`pt-1 text-kumo-default ${typeRole.manifestoEntryLabel}`}>
							{paragraph.label}
						</p>
						<p className="brand-body text-left text-kumo-default">
							{paragraph.body}
						</p>
					</div>
				))}
			</div>
		</SectionPanel>
	);
}
