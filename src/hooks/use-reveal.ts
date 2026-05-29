"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Scroll-triggered reveal for a section. Returns a ref to spread onto the
 * scope element; any descendant marked `data-reveal` fades/rises in with a
 * stagger when the section scrolls into view. Honours reduced motion.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
	const scope = useRef<T>(null);

	useGSAP(
		() => {
			const mm = gsap.matchMedia();

			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.from("[data-reveal]", {
					opacity: 0,
					y: 28,
					duration: 0.6,
					ease: "power2.out",
					stagger: 0.12,
					scrollTrigger: { trigger: scope.current, start: "top 75%", once: true },
				});
			});

			mm.add("(prefers-reduced-motion: reduce)", () => {
				gsap.from("[data-reveal]", {
					opacity: 0,
					duration: 0.3,
					stagger: 0.05,
					scrollTrigger: { trigger: scope.current, start: "top 85%", once: true },
				});
			});
		},
		{ scope },
	);

	return scope;
}
