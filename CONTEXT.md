# CONTEXT - Cloudflare-based design system

This context describes the design system that governs the site after the planned
rebuild. Read it before changing styling. ADRs in `docs/adr/` define the decisions;
this file is their working map.

## What it is

The site's visual system follows two Cloudflare source layers, applied by surface:

- **Kumo product layer:** product and interface surfaces use Kumo's semantic roles,
  interaction rules, and component conventions.
- **Cloudflare brand layer:** brand and story surfaces use the published brand colors
  and typographic roles. The brand layer complements Kumo; it does not replace product
  interface semantics.

The root page is the living consumer and visual reference. There is no separate `/ds`
showcase. `src/app/globals.css` is the canonical token source and Tailwind v4 consumes
its `@theme inline` layer.

## The tiers and the law

**Source values -> semantic roles -> Tailwind utilities. Components never skip a tier.**
This preserves the tier-precedence law from [ADR-0001](docs/adr/0001-tier-precedence.md),
re-mapped to Kumo's source names by
[ADR-0007](docs/adr/0007-cloudflare-based-design-system.md).

- **Source values:** Kumo theme values and official Cloudflare brand constants live in
  the canonical token source. Components do not contain raw color values.
- **Semantic roles:** site token names follow the published Kumo namespaces. Every
  token maps to a Kumo source name or an official brand constant; do not invent a Kumo
  name or claim a dashboard behavior without public source evidence.
- **Tailwind:** `@theme inline` exposes the semantic roles as the component-facing
  utility layer. Components consume these utilities or named semantic component APIs.

### Pinned Kumo roles

Color roles:

- `--color-kumo-canvas`
- `--color-kumo-base`
- `--color-kumo-elevated`
- `--color-kumo-recessed`
- `--color-kumo-control`
- `--color-kumo-brand`
- `--color-kumo-brand-hover`
- `--color-kumo-line`
- `--color-kumo-hairline`
- `--color-kumo-focus`

Text roles:

- `--text-color-kumo-default`
- `--text-color-kumo-link`
- `--text-color-kumo-brand`

**Important namespace trap:** `--color-kumo-brand` is the blue product action color;
`--text-color-kumo-brand` is orange brand text. They are different roles in different
namespaces. Keep them distinct. Other Kumo roles are available only when their source
names and use are verified; do not silently invent or promote them.

## Typography

Use Inter for proportional text and JetBrains Mono for code. The Cloudflare brand-guide
tracking and leading belong only to brand/story surfaces:

- Eyebrow: uppercase semibold, +5% tracking, 100% leading.
- Body: regular, -2% tracking, 120% leading.
- Headline: semibold, -3% tracking, 100% leading.
- Subheadline: medium, -3% tracking, 110% leading.
- URL: medium, -3% tracking, 100% leading.

Product and interface text follows Kumo's no-tracking rule. Interface content has a
14px minimum; headings and subheadings are 16px or larger. See
[ADR-0009](docs/adr/0009-typography.md).

## Material

Use layered, opaque semantic surfaces with precise hairlines and restrained control
shadows. Flat surfaces use hairline separation; an elevated surface may use the Kumo
line and its appropriate shadow, but never put a border and drop shadow on the same
card. Do not use translucency, blur, refraction, or decorative glass effects. See
[ADR-0008](docs/adr/0008-material-language.md).

## Theming

The root element uses `data-mode="light"` or `data-mode="dark"`; both modes are
first-class. System preference is the default and a manual toggle overrides it.
Components do not use Tailwind `dark:` variants; semantic tokens respond to `data-mode`.
System-first resolution is this site's policy, not a Kumo requirement. The time-scheduled
theme is retired. See
[ADR-0010](docs/adr/0010-theming.md).

## Token-family disposition

The old Signal Glass token families are retired and are not part of the vocabulary:

- `--signal-*` - retired.
- `--ink-*` - retired.
- `--glass-*` - retired.
- `--field-*` - retired.

The source-mapped Kumo namespaces above are the token vocabulary. No compatibility
aliases for the retired families are to be introduced. The former cipher wordmark,
Lexend and Geist Mono fonts, refraction effects, and time-scheduled theme are also
retired; the rebuild uses Inter, JetBrains Mono, and the `data-mode` contract.

## Key decisions

- [0001](docs/adr/0001-tier-precedence.md) tier-precedence law, re-mapped to Kumo.
- [0002](docs/adr/0002-glass-material.md) historical material decision, superseded by
  [ADR-0007](docs/adr/0007-cloudflare-based-design-system.md).
- [0003](docs/adr/0003-type-system.md) historical type decision, superseded by
  [ADR-0007](docs/adr/0007-cloudflare-based-design-system.md).
- [0004](docs/adr/0004-de-emphasis-text-tiers.md) source-backed semantic text roles.
- [0005](docs/adr/0005-signal-field-palette.md) historical palette decision,
  superseded by [ADR-0007](docs/adr/0007-cloudflare-based-design-system.md).
- [0006](docs/adr/0006-root-page-as-design-system-reference.md) root page as the
  living reference.
- [0007](docs/adr/0007-cloudflare-based-design-system.md) governing Kumo and brand layers.
- [0008](docs/adr/0008-material-language.md) material language.
- [0009](docs/adr/0009-typography.md) typography.
- [0010](docs/adr/0010-theming.md) theming.

Current scoping decisions are recorded in
[`docs/deliberately-omitted.md`](docs/deliberately-omitted.md). Historical audits and
specifications are records, not current implementation instructions.
