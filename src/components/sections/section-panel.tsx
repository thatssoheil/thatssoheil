import type { ReactNode } from "react";

import type { SectionId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Surface } from "@/components/ui/surface";

const sectionPanelKind = {
	manifesto: {
		section:
			"mt-stable-screen-gap transition-[opacity,filter] duration-500 ease-[var(--ease-signature)] motion-reduce:transition-none [:root[data-chat-open]_&]:opacity-25 [:root[data-chat-open]_&]:blur-[2px] [:root[data-chat-open]_&]:pointer-events-none",
		frame: "px-5 py-20 sm:px-8 sm:py-24 md:px-12 lg:px-16",
		wash:
			"bg-[radial-gradient(70%_58%_at_22%_24%,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_68%)]",
		heading: "text-fluid-36-48",
		intro:
			"font-sans text-sm leading-relaxed tracking-wide text-text-muted sm:text-base",
	},
	connect: {
		section: "",
		frame: "px-5 pb-16 pt-40 sm:px-8 sm:py-28 md:px-12 md:py-24 lg:px-16",
		wash:
			"bg-[radial-gradient(60%_72%_at_78%_54%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_72%)]",
		heading: "text-fluid-36-60",
		intro: "font-light text-lg leading-relaxed text-text-muted",
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
	children: ReactNode;
};

export function SectionPanel({
	id,
	kind,
	ariaLabel,
	eyebrow,
	heading,
	intro,
	children,
}: SectionPanelProps) {
	const recipe = sectionPanelKind[kind];

	return (
		<section
			id={id}
			className={cn(
				"relative min-h-stable-screen w-full overflow-hidden",
				recipe.section,
			)}
			aria-label={ariaLabel}
		>
			<div
				className={cn(
					"flex min-h-stable-screen items-center justify-center",
					recipe.frame,
				)}
			>
				<Surface
					variant="panel"
					radius="lg"
					className="relative isolate mx-auto grid w-full max-w-4xl gap-10 overflow-hidden p-6 text-left sm:p-12 md:p-16"
				>
					<div
						aria-hidden="true"
						className={cn("pointer-events-none absolute inset-0", recipe.wash)}
					/>

					<div className="relative z-10">
						<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
							{eyebrow}
						</p>

						<h2
							className={`mt-3 ${recipe.heading} font-sans font-light tracking-tight text-foreground`}
						>
							{heading}
						</h2>

						<p className={cn("mt-5 max-w-xl", recipe.intro)}>{intro}</p>
					</div>

					<div className="relative z-10">{children}</div>
				</Surface>
			</div>
		</section>
	);
}
