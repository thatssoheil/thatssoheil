import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// ─── Design-system tier-precedence gate (ADR-0001) ───
// Components consume semantics, never primitives. Rules ERROR so the law can't rot.
// Selectors are shared so the glass block can extend (not replace) the tier block.
const tierSelectors = [
	{
		selector: "Literal[value=/var\\(--(signal|ink)-/]",
		message:
			"Tier law (ADR-0001): no bare --signal-*/--ink-* in components — use --primary / --brand / --ring / a semantic --color-*.",
	},
	{
		selector: "TemplateElement[value.raw=/var\\(--(signal|ink)-/]",
		message:
			"Tier law (ADR-0001): no bare --signal-*/--ink-* in components — use --primary / --brand / --ring / a semantic --color-*.",
	},
	{
		selector: "Literal[value=/(oklch|rgba?)\\(/]",
		message:
			"Tier law (ADR-0001): no raw color literals in components — use a semantic token (masks may use #000/#fff/transparent).",
	},
	{
		selector: "TemplateElement[value.raw=/(oklch|rgba?)\\(/]",
		message:
			"Tier law (ADR-0001): no raw color literals in components — use a semantic token (masks may use #000/#fff/transparent).",
	},
];

const productTextSelectors = [
	{
		selector: "Literal[value=/\\btext-foreground\\/[0-9]/]",
		message:
			"ADR-0004: no text-foreground/NN for product text — use text-text-muted, text-text-faint, or text-foreground.",
	},
	{
		selector: "TemplateElement[value.raw=/\\btext-foreground\\/[0-9]/]",
		message:
			"ADR-0004: no text-foreground/NN for product text — use text-text-muted, text-text-faint, or text-foreground.",
	},
	{
		selector: "Literal[value=/\\btext-\\[[0-9.]+(?:rem|px)\\]/]",
		message:
			"ADR-0003: no numeric arbitrary text sizes in product modules — use a named typography role.",
	},
	{
		selector:
			"TemplateElement[value.raw=/\\btext-\\[[0-9.]+(?:rem|px)\\]/]",
		message:
			"ADR-0003: no numeric arbitrary text sizes in product modules — use a named typography role.",
	},
];

// Glass classes are internal to the primitives — product surfaces go through <Surface>
// (ADR-0002). Banned everywhere except the primitives (ui/) and the field that defines
// them. `(?<!-)` lets `var(--glass-rim)` through (that's a token, not a class).
const glassSelectors = [
	{
		selector: "Literal[value=/(?<!-)\\bglass(-(panel|edge|strong|refract))?\\b/]",
		message:
			"ADR-0002: no inline glass classes in product — compose <Surface> / surfaceVariants instead.",
	},
	{
		selector:
			"TemplateElement[value.raw=/(?<!-)\\bglass(-(panel|edge|strong|refract))?\\b/]",
		message:
			"ADR-0002: no inline glass classes in product — compose <Surface> / surfaceVariants instead.",
	},
];

const config = [
	{
		ignores: ["cloudflare-env.d.ts", ".open-next/**", ".next/**"],
	},
	...coreWebVitals,
	...typescript,

	// Tier law on ALL components (incl. the primitives themselves).
	{
		files: ["src/components/**/*.{ts,tsx}"],
		rules: {
			"no-restricted-syntax": ["error", ...tierSelectors],
		},
	},

	// Glass ban on product components only — the primitives in ui/ and the field in
	// signal-field/ are where glass legitimately lives. Repeats tierSelectors because
	// flat-config replaces (not merges) a rule's options for matching files.
	{
		files: ["src/components/**/*.{ts,tsx}"],
		ignores: [
			"src/components/ui/**",
			"src/components/signal-field/**",
			"src/components/ds/**",
		],
		rules: {
			"no-restricted-syntax": [
				"error",
				...tierSelectors,
				...glassSelectors,
				...productTextSelectors,
			],
		},
	},
];

export default config;
