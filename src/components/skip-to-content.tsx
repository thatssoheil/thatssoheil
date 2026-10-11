"use client";

import { Link } from "@/components/ui";

/**
 * Skip-to-content link for keyboard / screen-reader users.
 * Visible only on focus.
 */
export function SkipToContent() {
	return (
		<Link
			href="#main-content"
			variant="plain"
			className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[var(--z-overlay)] focus:rounded-lg focus:bg-kumo-canvas focus:px-4 focus:py-2 focus:text-sm focus:text-kumo-default focus:no-underline focus:ring-2 focus:ring-kumo-focus focus:outline-none"
		>
			Skip to content
		</Link>
	);
}
