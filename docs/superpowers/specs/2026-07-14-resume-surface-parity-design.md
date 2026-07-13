# Résumé Surface Parity Design

**Date:** 2026-07-14  
**Branch:** `feat/ats-resume`  
**Status:** Approved direction; awaiting written-spec review

## Context

The root page is the living reference for the site's Signal Glass design system. Its Manifesto and Connect reading panels both use the shared `Surface` primitive with the panel material, edge treatment, and large sanctioned radius. The résumé page uses the same primitive for the document, but overrides its radius in local CSS. Its export box recreates only part of the material with local border, background, radius, and shadow declarations.

This creates visible drift in corner geometry and depth even though all three surfaces belong to the same reading-panel family.

## Decision

The résumé document and export box will inherit the same outer surface recipe as the Manifesto and Connect panels:

- `Surface`
- `variant="panel"`
- the default edge treatment
- `radius="lg"`

The résumé document will keep its existing dimensions, spacing, typography, and semantic structure. The export box will keep its existing dimensions, content, button behavior, and normal-flow placement below the document.

Local declarations that duplicate or override the shared surface material will be removed. Layout-only declarations remain local.

## Visual Scope

The shared treatment includes:

- large sanctioned corner radius;
- near-solid reading-panel fill;
- responsive backdrop blur where supported;
- light-mode rim and sheen;
- dark-mode fill-and-shadow separation;
- shared soft drop shadow and depth.

The résumé surfaces will not inherit the Manifesto or Connect radial wash. Those washes are section-specific decoration, while the résumé is a dense reading and application document that benefits from a quieter canvas.

No new animation is introduced. These are persistent reading surfaces, so material consistency matters more than entrance choreography.

## Component Changes

### Résumé document

`ResumeDocument` will explicitly request the large panel radius from `Surface`. The local `.paper` rule will stop setting `border-radius`.

### Export controls

`ExportControls` will render its outer container through `Surface` with the same panel and large-radius recipe. The local `.toolbar` rule will stop setting its own border, radius, background, and box shadow. Flex layout, spacing, sizing, and button styles remain unchanged.

## Print Behavior

Print output remains unchanged:

- the export box stays hidden;
- the résumé paper continues to remove border, radius, background material, and shadow under `@media print`;
- the document remains two A4 pages with the existing linear ATS-readable content.

## Verification

Implementation is complete when:

1. Manifesto, Connect, résumé paper, and export box resolve to the same `Surface` panel/edge/large-radius recipe on screen.
2. The résumé paper and export box retain their current widths and placement.
3. Light and dark themes show consistent depth and edge behavior.
4. Mobile full-width behavior remains intact.
5. The exported PDF remains two A4 pages with unchanged extracted text.
6. Lint, typecheck, résumé contract checks, tests, and production build pass.

## Non-Goals

- redesigning résumé content or typography;
- adding section washes, gradients, motion, or hover elevation;
- changing the export workflow;
- changing the root-page panels or the global material tokens;
- introducing a new surface variant or elevation tier.
