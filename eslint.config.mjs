import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// ─── Design-system tier-precedence gate (ADR-0001) ───
// Components consume semantics, never primitives. Rules ERROR so the law can't rot.
// Selectors are shared so the glass block can extend (not replace) the tier block.
const tierSelectors = [
	{
		selector: "Literal[value=/var\\(--(signal|ink)-/]",
		message:
			"Tier law (ADR-0001): no bare --signal-*/--ink-* in components - use semantic token utilities.",
	},
	{
		selector: "TemplateElement[value.raw=/var\\(--(signal|ink)-/]",
		message:
			"Tier law (ADR-0001): no bare --signal-*/--ink-* in components - use semantic token utilities.",
	},
	{
		selector: "Literal[value=/(oklch|rgba?)\\(/]",
		message:
			"Tier law (ADR-0001): no raw color literals in components - use a semantic token.",
	},
	{
		selector: "TemplateElement[value.raw=/(oklch|rgba?)\\(/]",
		message:
			"Tier law (ADR-0001): no raw color literals in components - use a semantic token.",
	},
];

const rawHexSelectors = [
	{
		selector: "Literal[value=/#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\\b/i]",
		message:
			"Tier law (ADR-0001): raw hex colors belong only in the canonical token file.",
	},
	{
		selector:
			"TemplateElement[value.raw=/#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\\b/i]",
		message:
			"Tier law (ADR-0001): raw hex colors belong only in the canonical token file.",
	},
];

const backdropSelectors = [
	{
		selector: "Literal[value=/\\bbackdrop-filter\\s*:/]",
		message:
			"Kumo material rule: do not add backdrop-filter declarations in components.",
	},
	{
		selector: "TemplateElement[value.raw=/\\bbackdrop-filter\\s*:/]",
		message:
			"Kumo material rule: do not add backdrop-filter declarations in components.",
	},
	{
		selector: "Property[key.name='backdropFilter']",
		message:
			"Kumo material rule: do not add backdrop-filter declarations in components.",
	},
];

const backdropUtilitySelectors = [
	{
		selector: "Literal[value=/\\bbackdrop-(blur|filter|saturate)(-|\\b)/]",
		message:
			"Kumo material rule: do not add backdrop-filter utilities.",
	},
	{
		selector:
			"TemplateElement[value.raw=/\\bbackdrop-(blur|filter|saturate)(-|\\b)/]",
		message:
			"Kumo material rule: do not add backdrop-filter utilities.",
	},
];

const darkVariantSelectors = [
	{
		selector: "Literal[value=/\\bdark:/]",
		message:
			"ADR-0010: do not use Tailwind dark: variants - use data-mode semantic tokens.",
	},
	{
		selector: "TemplateElement[value.raw=/\\bdark:/]",
		message:
			"ADR-0010: do not use Tailwind dark: variants - use data-mode semantic tokens.",
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

const productSurfaceSelectors = [
	{
		selector: "ImportSpecifier[imported.name='surfaceVariants']",
		message:
			"ADR-0002: product modules should use a named surface role, not surfaceVariants directly.",
	},
];

const config = [
	{
		ignores: ["cloudflare-env.d.ts", ".open-next/**", ".next/**"],
	},
	...coreWebVitals,
	...typescript,

	// Tier law, raw-hex tokens, and explicit backdrop-filter declarations across
	// components. The one functional color-input value is handled below.
	{
		files: ["src/components/**/*.{ts,tsx}"],
		ignores: ["src/components/playground/color-vision.tsx"],
		rules: {
			"no-restricted-syntax": [
				"error",
				...tierSelectors,
				...rawHexSelectors,
				...backdropSelectors,
			],
		},
	},

	// Legacy dark: variants remain only in ui/ until R2 replaces those primitives.
	// The command menu retains one old backdrop-blur utility until R2 migration.
	// Glass classes are internal to the old primitives and field; other product
	// surfaces use semantic roles and opaque materials.
	{
		files: ["src/components/**/*.{ts,tsx}"],
		ignores: [
			"src/components/ui/**",
			"src/components/signal-field/**",
			"src/components/command-menu.tsx",
			"src/components/playground/color-vision.tsx",
		],
		rules: {
			"no-restricted-syntax": [
				"error",
				...tierSelectors,
				...rawHexSelectors,
				...glassSelectors,
				...productSurfaceSelectors,
				...productTextSelectors,
				...darkVariantSelectors,
				...backdropUtilitySelectors,
			],
		},
	},

	// This existing value is an input default for <input type="color">, not CSS.
	// R2 owns its migration; keep other tier checks active here until then.
	{
		files: ["src/components/playground/color-vision.tsx"],
		rules: {
			"no-restricted-syntax": [
				"error",
				...tierSelectors,
				...backdropSelectors,
			],
		},
	},
];

export default config;
