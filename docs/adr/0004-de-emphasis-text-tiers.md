# ADR-0004 — De-emphasis text tiers (no ad-hoc opacity)

**Status:** Accepted (2026-06-29)

## Context

Quiet/secondary text was set with ad-hoc `text-foreground/NN` opacities. Alpha-over-light
and alpha-over-dark aren't symmetric, so dark-tuned values silently failed WCAG AA in
light mode (audit #2, #7) — and the contrast couldn't be certified because it depended
on whatever pixels sat behind.

## Decision

Two measured, per-theme semantic tiers replace ad-hoc opacity for **text**:

- **`--text-muted`** — body de-emphasis, measured ≥ ~7:1.
- **`--text-faint`** — quiet/decorative copy, measured ≥ 4.5:1 (still AA).

`text-foreground/NN` is **banned for text** in `src/components` (lint, ADR-0001).
Opacity remains fine for non-text (hairlines, decorative fills).

## Consequences

Contrast is certifiable and theme-correct by construction. The eyebrow/tagline that
previously failed AA now pass in both themes without a visible change to the design.
