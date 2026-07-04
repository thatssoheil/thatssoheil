# Dark Mode Visual Polish Design

**Date:** 2026-07-04
**Branch:** `chore/ds-systematize`
**Status:** Implemented

## Problem

Light mode feels more resolved than dark mode because paper gives Signal Glass visible edges,
while dark mode collapses too much of the field and glass into near-black.

## Direction

Dark mode becomes a deep optical glass environment: neutral-black, subtly blue/teal in the field,
stronger edge light, calmer display cipher, and more varied panel composition.

## Decisions

- Retune dark tokens at the semantic layer, not per component.
- Keep light mode effectively unchanged.
- Keep glass solid-by-default and progressive-enhanced.
- Preserve the hero square's text-relative geometry.
- Lower display cipher blur severity without changing the accessible text model.
- Break centered-card repetition in Manifesto and Connect without adding new sections.

## Visual QA

- Desktop dark hero: glass edges visible; background reads deep, not flat black.
- Desktop light hero: still airy and paper-like.
- Mobile dark hero: header island remains inset; wordmark does not smear heavily.
- Desktop footer/connect: footer island reads as a bottom bookend, not a full-width bar.
- Reduced motion: cipher and field remain safe.
