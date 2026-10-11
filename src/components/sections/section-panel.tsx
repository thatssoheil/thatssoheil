"use client";

import type { ReactNode } from "react";

import type { SectionId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui";

const sectionPanelKind = {
	manifesto: {
		section: "mt-stable-screen-gap transition-opacity duration-500 ease-out motion-reduce:transition-none",
		frame: "px-5 py-20 sm:px-8 sm:py-24 md:px-12 lg:px-16",
		heading: "text-display",
		intro: "text-body leading-relaxed text-kumo-default opacity-80",
		introNote: "text-body-sm leading-relaxed text-kumo-default opacity-70",
	},
	connect: {
		section: "",
		frame: "px-5 pb-16 pt-40 sm:px-8 sm:py-28 md:px-12 md:py-24 lg:px-16",
		heading: "text-display",
		intro: "text-body leading-relaxed text-kumo-default opacity-80",
		introNote: "text-body-sm leading-relaxed text-kumo-default opacity-70",
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
			className={cn("relative min-h-stable-screen w-full overflow-hidden", recipe.section)}
			aria-label={ariaLabel}
		>
			<div
				className={cn(
					"flex min-h-stable-screen items-center justify-center",
					recipe.frame,
				)}
			>
				<Surface
					layer="base"
					className="relative isolate mx-auto grid w-full max-w-4xl gap-10 overflow-hidden rounded-lg p-6 text-left shadow-xs ring ring-kumo-line sm:p-12 md:p-16"
				>
					<div className="relative z-10" data-reveal>
						<p className="text-eyebrow text-kumo-link">{eyebrow}</p>
						<h2 className={`mt-3 ${recipe.heading} font-light text-kumo-default`}>
							{heading}
						</h2>
						<p className={cn("mt-5 max-w-xl", recipe.intro)}>{intro}</p>
						{introNote ? (
							<p className={cn("mt-3 max-w-xl", recipe.introNote)}>{introNote}</p>
						) : null}
					</div>

					<div className="relative z-10" data-reveal>
						{children}
					</div>
				</Surface>
			</div>
		</section>
	);
}
