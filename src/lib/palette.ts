/**
 * Shared static palette for generated assets whose renderer cannot resolve CSS
 * custom properties. The brand hex values mirror the official constants in
 * `src/app/globals.css` (`--cf-brand-*`); keep both definitions in sync.
 * Neutral RGB values are static renderings of the adopted Kumo light roles.
 */
export const CF_BRAND_COLORS = {
	tangerine: "#F6821F",
	ruby: "#FF6633",
	mango: "#FBAD41",
} as const;

export const OG_PALETTE = {
	canvas: "rgb(251, 251, 251)", // --color-kumo-canvas: oklch(98.75% 0 0)
	base: "rgb(255, 255, 255)", // --color-kumo-base: white
	hairline: "rgb(233, 233, 233)", // --color-kumo-hairline: oklch(93.5% 0 0)
	text: "rgb(24, 24, 27)", // --text-color-kumo-default: oklch(21% 0.006 285.885)
} as const;
