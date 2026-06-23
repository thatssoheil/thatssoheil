"use client";

import { useSyncExternalStore } from "react";

// Re-read whenever the document's class/style changes (e.g. theme toggle), so
// theme-dependent tokens stay accurate.
function subscribe(callback: () => void) {
	const observer = new MutationObserver(callback);
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class", "style"],
	});
	return () => observer.disconnect();
}

function readToken(name: string): string {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(`--${name}`)
		.trim();
}

/**
 * Renders a CSS custom property's resolved value, read live from the document
 * at runtime — so the /ds reference never drifts from `globals.css`. Uses
 * `useSyncExternalStore` (correct on first client render, re-reads on theme
 * change); SSR renders a blank placeholder.
 */
export function TokenValue({ name }: { name: string }) {
	const value = useSyncExternalStore(
		subscribe,
		() => readToken(name),
		() => "",
	);

	return (
		<span className="font-mono text-[10px] text-foreground/30 break-all">
			{value || " "}
		</span>
	);
}
