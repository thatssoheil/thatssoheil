# ADR-0004 - Semantic text roles and de-emphasis

**Status:** Accepted (2026-06-29); re-checked under ADR-0007 (2026-10-11)

## Context

Text color must remain semantic and theme-correct. Ad hoc opacity on text makes its
contrast depend on the surface behind it and can silently lower legibility.

## Decision

Use source-backed Kumo text roles rather than raw colors or opacity utilities. The
pinned roles are:

- `--text-color-kumo-default` for default text.
- `--text-color-kumo-link` for inline links.
- `--text-color-kumo-brand` for brand text; this role is orange, unlike the blue
  `--color-kumo-brand` action color.

Use additional Kumo text roles only when their names and behavior are verified in the
published source. Do not invent aliases or use alpha opacity to create a text tier.

## Consequences

Text remains tied to explicit semantic intent and the selected theme. Contrast checks
can evaluate named roles instead of arbitrary alpha-over-surface combinations.
