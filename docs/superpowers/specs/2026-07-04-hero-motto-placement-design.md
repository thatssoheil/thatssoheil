# Hero Motto Placement Design

**Date:** 2026-07-04
**Branch:** `chore/ds-systematize`
**Status:** Proposed

## Problem

The hero motto now matches the eyebrow font size, but its current placement keeps it too close to
the name. It reads like a leftover caption attached to the wordmark rather than an intentional
part of the new structural grid composition.

## Direction

Use the motto as a lower grid-caption. It should sit below the name with noticeably more breathing
room, closer to the next structural rhythm line, while remaining centered on the same vertical axis
as the eyebrow divider and the center grid rail.

## Decisions

- Keep the motto text and font-size aligned with the hero eyebrow.
- Preserve the motto as a single centered line.
- Move the motto downward enough that it reads as an architectural annotation, not a subtitle.
- Keep the motto above the scroll cue so the bottom of the hero does not feel crowded.
- Keep the motto visually quieter than the name and eyebrow; do not add new accent color.
- Do not change the name size, eyebrow layout, grid rail placement, header, or section spacing.

## Implementation Shape

- Adjust only the hero lockup spacing/classes in `src/components/sections/hero.tsx`.
- Prefer a responsive margin or translate value over structural markup changes.
- Maintain no horizontal overflow on narrow mobile widths.
- Keep the existing center-axis measurements intact for the eyebrow divider.

## Visual QA

- Mobile: the motto remains readable, centered, and above the scroll cue.
- Tablet: the motto aligns to the center rail and feels intentionally lower than the wordmark.
- Desktop: the hero reads as eyebrow, large name, then lower grid-caption motto.
- Dark and light modes: motto remains quiet and does not compete with the name.
- No horizontal overflow is introduced.
