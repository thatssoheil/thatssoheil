import type { SectionId } from "@/lib/constants";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Scroll to a section, honouring reduced motion. The hero is pinned (GSAP
 * ScrollTrigger), so its element spans the whole pin range — scrollIntoView
 * would land at the end of that range, where the exit transition has played
 * out and the screen reads blank. Scroll to the absolute top instead to land
 * on the hero's start.
 */
export function jumpToSection(id: SectionId) {
	const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
	if (id === ("hero" satisfies SectionId)) {
		window.scrollTo({ top: 0, behavior });
		return;
	}
	document.getElementById(id)?.scrollIntoView({ behavior });
}
