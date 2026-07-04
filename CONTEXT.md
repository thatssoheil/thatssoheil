# CONTEXT — Signal Glass

The design context the docs reference (it used to be promised but missing). Read this
before touching styling.

## What it is

**Signal Glass** — a small, code-first design system for this site: a neutral-black void,
one signal-blue accent, a living "field" the glass refracts, and the cipher wordmark.
It lives almost entirely in **`src/app/globals.css`**; the living showcase is **`/ds`**
(`src/app/ds/page.tsx`). No JS config, no Figma source — Tailwind v4 consumes
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

## Fonts

`--font-sans` = **Lexend** (UI + the uppercase eyebrow register). `--font-mono` = **real
Geist Mono** (code + `-mono` ramps). Cipher wordmark = `--font-cipher` (Geist Mono).

## Where the system is going

Maturity today is mid (see `docs/audits/2026-06-29-design-system-gap-analysis.md`). The
work is making the product **built from** the system; the plan is
`docs/superpowers/plans/2026-06-29-ds-systematize.md`. Non-goals are recorded in
[`docs/deliberately-omitted.md`](docs/deliberately-omitted.md).
