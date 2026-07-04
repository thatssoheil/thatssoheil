# Structural Grid Design

**Date:** 2026-07-04
**Branch:** `chore/ds-systematize`
**Status:** Proposed

## Problem

The page now has a deeper black field and cleaner glass sections, but the empty space between
sections can feel atmospheric without feeling intentionally structured. The site needs visible
structure that adds visual appeal without becoming a busy technical HUD.

## Direction

Add an architectural grid substrate: quiet layout rails and sparse rhythm lines that make the
page feel measured, composed, and intentional. The grid should support the existing header,
section, and footer widths rather than decorate each component separately.

## Decisions

- Use a global non-interactive grid layer mounted with the existing `SignalField` substrate.
- Align the strongest vertical rails to the shared `max-w-4xl` content width.
- Include a subtle center rail and sparse horizontal rhythm lines.
- Keep dark mode more visible and light mode much quieter.
- Keep the grid behind content and glass; it must never interfere with text readability.
- Fade the grid near viewport edges so it feels embedded in the page field.
- Do not add per-section grid backgrounds or one-off component treatments.

## Implementation Shape

- Add a small `StructureGrid` component under `src/components/signal-field/`.
- Mount it once in `src/app/layout.tsx`, adjacent to `SignalField`.
- Define grid color/opacity tokens in `src/app/globals.css` per theme.
- Implement the grid with CSS backgrounds/pseudo-elements, not canvas or JavaScript.
- Preserve pointer-events none and negative z-index layering.

## Visual QA

- Desktop dark hero: rails are visible but quieter than the hero name and header.
- Desktop dark Manifesto/Connect: glass panels remain dominant; grid reads around them, not through copy.
- Mobile dark: grid does not crowd the narrow layout or create moire-like noise.
- Light mode: grid is present only as a faint paper guide.
- Reduced motion: no new motion is introduced.
- Layout: no horizontal overflow; header, sections, and footer remain aligned.
