"use client";

import { useScrollProgress } from "@/hooks/use-scroll-progress";

/**
 * Thin progress bar fixed at the very top of the viewport.
 */
export function ScrollProgress() {
	const progress = useScrollProgress();

	return (
		<div
			aria-hidden
			className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-foreground/60 transition-transform duration-100 ease-out"
			style={{ transform: `scaleX(${progress})` }}
		/>
	);
}
