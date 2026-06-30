/**
 * Jump to a section by href (e.g. "#manifesto") or bare id (e.g. "manifesto").
 * The hero special-cases to window.scrollTo — more reliable than scrollIntoView
 * on the first element. All other sections use scrollIntoView.
 */
export function jumpToSection(href: string) {
	const id = href.startsWith("#") ? href.slice(1) : href;
	if (id === "hero") {
		window.scrollTo({ top: 0 });
		return;
	}
	document.getElementById(id)?.scrollIntoView();
}
