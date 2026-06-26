import type { SectionId } from "@/lib/constants";

/**
 * Jump to a section. The site is static (no smooth-scroll transition), so this
 * lands instantly. The hero is a plain full-height section now, so scrolling to
 * the absolute top lands on its start.
 */
export function jumpToSection(id: SectionId) {
	if (id === ("hero" satisfies SectionId)) {
		window.scrollTo({ top: 0 });
		return;
	}
	document.getElementById(id)?.scrollIntoView();
}
