import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
	{
		ignores: ["cloudflare-env.d.ts", ".open-next/**", ".next/**"],
	},
	...coreWebVitals,
	...typescript,

	// ─── Design-system tier-precedence gate (ADR-0001) ───
	// Components consume semantics, never primitives. These rules ERROR so the law
	// can't silently rot. Only violation classes that are already clean are enabled
	// here; the text-opacity + arbitrary-text-size rules turn on in Slice 2 once the
	// type migration clears them (see docs/superpowers/plans/2026-06-29-ds-systematize.md).
	{
		files: ["src/components/**/*.{ts,tsx}"],
		rules: {
			"no-restricted-syntax": [
				"error",
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
			],
		},
	},
];

export default config;
