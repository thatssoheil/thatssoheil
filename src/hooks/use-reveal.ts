"use client";

import { gsap } from "@/lib/gsap";
import { useMotion } from "@/hooks/use-motion";
import { MOTION_EASE } from "@/lib/motion";

/**
 * Scroll-triggered reveal for a section. Returns a ref to spread onto the
 * scope element; any descendant marked `data-reveal` fades/rises in with a
 * stagger when the section scrolls into view. Honours reduced motion.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
	return useMotion<T>({
		full: (scope) => {
			gsap.from("[data-reveal]", {
				opacity: 0,
				y: 28,
				duration: 0.6,
				ease: MOTION_EASE,
				stagger: 0.12,
				scrollTrigger: { trigger: scope.current, start: "top 75%", once: true },
			});
		},
		reduced: (scope) => {
			gsap.from("[data-reveal]", {
				opacity: 0,
				duration: 0.3,
				stagger: 0.05,
				scrollTrigger: { trigger: scope.current, start: "top 85%", once: true },
			});
		},
	});
}
