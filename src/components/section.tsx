"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { SectionId } from "@/lib/constants";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
	/** The scroll-target id (must match a SECTIONS entry). */
	sectionId: SectionId;
	/** If true, the section fills at least the full viewport height. */
	fullHeight?: boolean;
}

/**
 * Consistent section wrapper.
 * Provides padding, max-width centering, and scroll-snap alignment.
 */
const Section = forwardRef<HTMLElement, SectionProps>(
	({ sectionId, fullHeight = false, className, children, ...props }, ref) => (
		<section
			ref={ref}
			id={sectionId}
			className={cn(
				"relative w-full scroll-mt-16",
				"px-6 py-24 sm:px-8 md:px-12 lg:px-16",
				"snap-start",
				fullHeight && "min-h-[100dvh] flex flex-col justify-center",
				className,
			)}
			{...props}
		>
			<div className="mx-auto w-full max-w-5xl">{children}</div>
		</section>
	),
);
Section.displayName = "Section";

export { Section };
