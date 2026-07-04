# Hero Motto Placement Design

**Date:** 2026-07-04
**Branch:** `chore/ds-systematize`
**Status:** Proposed

## Problem

The hero motto now matches the eyebrow font size, but its current placement keeps it too close to
the name. It reads like a leftover caption attached to the wordmark rather than an intentional
part of the new structural grid composition. The motto also has conceptual weight ("Coding vision
into existence") that is not yet expressed visually.

## Direction

Use the motto as a bottom-center hero caption above the centered scroll cue. It should sit on the
same vertical axis as the eyebrow divider, name, center grid rail, and scroll cue. The motto should
appear readable immediately, then random individual characters should briefly cipher and decipher
in a quiet loop while the user is visiting. The first word should also alternate between "Coding"
and "Prompting"; the cipher transition is the window where the word length can expand or contract
without feeling like a layout jump. A very subtle spectral sheen should occasionally pass through
the motto, implying agentic AI flow without turning the hero into a rainbow effect.

## Decisions

- Keep the motto text and font-size aligned with the hero eyebrow.
- Preserve the motto as a single centered line.
- Move the motto out of the name lockup and place it above the centered scroll cue.
- Keep the motto visually quieter than the name and eyebrow; do not add new accent color.
- Reuse the existing cipher engine visual language, but do not replay the name's page-load decode
  on the motto.
- The motto should begin settled/readable, then ambient random single-character cipher pulses should
  continue over time.
- Alternate the first word between `Coding` and `Prompting` in a loop.
- During first-word swaps, use a cipher/decode transition so the character-count change feels
  intentional.
- Add a CSS-only low-opacity spectral sheen that comes and goes slowly after load.
- Disable both ambient cipher pulses and animated sheen for reduced-motion users.
- Do not change the name size, eyebrow layout, grid rail placement, header, or section spacing.

## Implementation Shape

- Adjust only the hero lockup spacing/classes in `src/components/sections/hero.tsx`.
- Move the motto paragraph outside the centered name lockup and position it with the existing
  bottom-center hero controls.
- Extend the existing cipher text path with a settled-first ambient mode instead of creating a
  second animation system.
- Render the motto with `CipherText` as a paragraph (`as="p"`) in settled-first ambient mode.
- Add a focused hero motto component that owns the timed `Coding`/`Prompting` phrase swap and
  remounts the cipher text during swaps.
- Add a small global CSS class in `src/app/globals.css` for the subtle sheen, gated by
  `prefers-reduced-motion`.
- Maintain no horizontal overflow on narrow mobile widths.
- Keep the existing center-axis measurements intact for the eyebrow divider.

## Visual QA

- Mobile: the motto remains readable, centered, and above the scroll cue without touching it.
- Tablet: the motto aligns to the center rail and reads as the label for the scroll cue area.
- Desktop: the hero reads as eyebrow and large name, then a bottom-center motto/cue pair.
- Dark and light modes: motto remains quiet and does not compete with the name.
- Motion: motto is readable on load; random single-character cipher pulses continue quietly; the
  first word alternates between `Coding` and `Prompting` through a cipher transition.
- Reduced motion: users see a stable readable motto with no swapping, no ambient pulses, and no
  shimmer.
- Sheen: spectral color is subtle, intermittent, and never applied to the name or eyebrow.
- No horizontal overflow is introduced.
