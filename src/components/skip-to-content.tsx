"use client";

/**
 * Skip-to-content link for keyboard / screen-reader users.
 * Visible only on focus.
 */
export function SkipToContent() {
	return (
		<a
			href="#main-content"
			className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
		>
			Skip to content
		</a>
	);
}
