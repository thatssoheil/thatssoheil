# ADR-0001 — Token tier-precedence law

**Status:** Accepted (2026-06-29)

## Context

The design system has three token tiers but no written rule about how they compose,
so components reached past the semantic layer to raw primitives (`var(--signal-500)`,
`text-foreground/40`, hardcoded `oklch`). That broke the retheme contract and let the
system drift (see `docs/audits/2026-06-29-design-system-gap-analysis.md`, risk #4).

## Decision

**Components consume semantics; semantics consume primitives. Never skip a tier.**

- **Tier 1 — primitives** (`--ink-*`, `--signal-*`, raw `oklch`): defined in `:root`
  in `globals.css`. **Only the semantic tier may reference them.**
- **Tier 2 — semantics** (`--background`, `--primary`, `--brand`, `--ring`,
  `--glass-*`, `--text-muted/-faint`, `--field-*`, …): per-theme in `:root`/`.dark`.
  This is the layer the product speaks to.
- **Tier 3 — Tailwind** (`@theme inline` `--color-*`, `--text-*`, `--radius-*`): the
  utilities. Product code uses these.

**In `src/components`, the following are forbidden** (lint-enforced, ADR-0006-style
governance / audit #4): raw hex/`oklch` literals · arbitrary `text-[…rem]` ·
`text-foreground/NN` for text (use `--text-muted`/`--text-faint`) · bare
`var(--signal-*)`/`var(--ink-*)` (use `--primary`/`--brand`/`--ring`/`--color-*`).

## Consequences

Swapping the six `--signal-*` values rethemes the whole product. Contrast and accent
behavior live in one place. The lint gate makes the law cheap to keep and expensive to
break.
