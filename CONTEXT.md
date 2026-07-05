# CONTEXT — Signal Glass

The design context the docs reference (it used to be promised but missing). Read this
before touching styling.

## What it is

**Signal Glass** — a small, code-first design system for this site: a neutral-black void,
one signal-blue accent, a living "field" the glass refracts, and the cipher wordmark.
It lives in **`src/app/globals.css`** plus a handful of `src/components/ui/*`
primitives. The **root page is the living consumer and reference**; there is no
separate `/ds` showcase. No JS config, no Figma source — Tailwind v4 consumes
`globals.css` directly.

## The tiers (and the law)

Primitives → semantics → Tailwind utilities, **never skipping** — see
[ADR-0001](docs/adr/0001-tier-precedence.md), enforced by the lint gate.

- **Primitives** (`:root`): `--ink-*`, `--signal-*`, raw `oklch`.
- **Semantics** (`:root` / `.dark`): `--background/foreground/card/primary/brand/ring`,
  `--glass-*`, `--text-muted/-faint`, `--field-*`, shadows, gradients, eases/durations.
- **Tailwind** (`@theme inline`): `--color-*`, `--text-*`, `--radius-*`, fonts.

## Key decisions (ADRs)

- [0001](docs/adr/0001-tier-precedence.md) tier-precedence law
- [0002](docs/adr/0002-glass-material.md) glass: solid-by-default + scoped refraction
- [0003](docs/adr/0003-type-system.md) honest fonts + a thin semantic ramp
- [0004](docs/adr/0004-de-emphasis-text-tiers.md) de-emphasis text tiers
- [0005](docs/adr/0005-signal-field-palette.md) the field's named second hue
- [0006](docs/adr/0006-root-page-as-design-system-reference.md) root page as the
  design-system reference

## Fonts

`--font-sans` = **Lexend** (UI + the uppercase eyebrow register). `--font-mono` = **real
Geist Mono** (code + `-mono` ramps). Cipher wordmark = `--font-cipher` (Geist Mono).

## Where the system is going

The system is now sized to the stable personal site: the product is the proof. Future
changes should deepen the root page and its primitives, not rebuild a parallel design
gallery. Historical audit plans remain in `docs/audits/` and `docs/superpowers/`;
current non-goals are recorded in
[`docs/deliberately-omitted.md`](docs/deliberately-omitted.md).
