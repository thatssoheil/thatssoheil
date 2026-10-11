import type { ReactNode } from "react";

import type { SectionId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui";

const sectionPanelKind = {
	manifesto: {
		section: "mt-stable-screen-gap",
		accent: "bg-cf-brand-ruby",
	},
	connect: {
		section: "",
		accent: "bg-cf-brand-mango",
	},
} as const;

type SectionPanelKind = keyof typeof sectionPanelKind;

type SectionPanelProps = {
	id: SectionId;
	kind: SectionPanelKind;
	ariaLabel: string;
	eyebrow: ReactNode;
	heading: ReactNode;
	intro: ReactNode;
	introNote?: ReactNode;
	children: ReactNode;
};

export function SectionPanel({
	id,
	kind,
	ariaLabel,
	eyebrow,
	heading,
	intro,
	introNote,
	children,
}: SectionPanelProps) {
	const recipe = sectionPanelKind[kind];

	return (
		<section
			id={id}
			className={cn("relative w-full", recipe.section)}
			aria-label={ariaLabel}
		>
			<div className="mx-auto grid min-h-stable-screen w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 py-20 sm:px-8 sm:py-24 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16 md:px-12 md:py-32 lg:px-16">
				<Separator className="col-span-full" aria-hidden="true" />

				<div className="max-w-xl">
					<span
						aria-hidden="true"
						className={cn("mb-7 block h-1.5 w-12 rounded-full", recipe.accent)}
					/>
					<p className="brand-eyebrow text-kumo-default">{eyebrow}</p>
					<h2 className="brand-headline mt-4 text-[clamp(2.75rem,5vw,4.5rem)] text-kumo-default">
						{heading}
					</h2>
					<p className="brand-subheadline mt-6 max-w-xl text-kumo-default">{intro}</p>
					{introNote ? (
						<p className="brand-body mt-4 max-w-xl text-kumo-default opacity-80">
							{introNote}
						</p>
					) : null}
				</div>

				<div className="min-w-0">{children}</div>
			</div>
		</section>
	);
}
