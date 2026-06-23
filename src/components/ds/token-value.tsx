"use client";

import { useSyncExternalStore } from "react";

// One MutationObserver shared across all TokenValue instances — they all watch
// the same documentElement attributes (theme toggles). Listeners multiplex
// through a Set; the observer connects on the first subscriber and disconnects
// after the last, so N swatches cost one observer, not N.
const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function subscribe(callback: () => void) {
	listeners.add(callback);
	if (!observer) {
		observer = new MutationObserver(() => {
			for (const listener of listeners) listener();
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class", "style"],
		});
	}
	return () => {
		listeners.delete(callback);
		if (listeners.size === 0 && observer) {
			observer.disconnect();
			observer = null;
		}
	};
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
 * change via one shared observer); SSR renders a blank placeholder.
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
