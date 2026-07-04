import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// ─── Design-system tier-precedence gate (ADR-0001) ───
// Components consume semantics, never primitives. Rules ERROR so the law can't rot.
// Selectors are shared so the glass block can extend (not replace) the tier block.
// Still deferred (turn on in Slice 2/T3-T4 once clean): text-foreground/NN and
// arbitrary text-[…rem] sizes.
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
		ignores: ["src/components/ui/**", "src/components/signal-field/**"],
		rules: {
			"no-restricted-syntax": ["error", ...tierSelectors, ...glassSelectors],
		},
	},
];

export default config;
