# Mobile UX polish — Step 1: Full-bleed hero name

**Date:** 2026-06-24
**Branch:** `feat/mobile-ux-polish`
**Status:** Approved (design)

## Context

On phones the hero `<h1>` ("Soheil" / "Fakour") renders at the `clamp()` floor
(`3.25rem`), so it fills only ~60% of the viewport width. The right side is dead
space, and the eyebrow (`FRONTEND DEVELOPER · PRODUCT CURATOR`) is visually wider
than the name — an inverted hierarchy where the label out-shouts the name.

## Goal

Make the name **full-bleed on mobile**: the two stacked words touch both screen
edges, turning the dead space into a bold editorial statement and restoring the
name as the dominant element.

## Scope

- **Hero `<h1>` only.**
- **Mobile only (`< 640px`, i.e. below Tailwind `sm`).** Desktop (`>= sm`) is
  unchanged — same `clamp(3.25rem, 12vw, 11rem)`, same gutter, same `max-w-6xl`.
- Out of scope for this step (queued as later commits in the same PR): name↔label
  spacing rhythm, collapsed-nav discoverability, section paddings.

## Design

### Layout — "name bleeds, labels keep gutter"

- The name breaks out of the horizontal gutter and **touches both screen edges**.
- The eyebrow and the tagline block **keep today's `px-6` margin**, creating a
  deliberate tension: huge type breaking the grid while the quiet labels stay
  inside it.

### Edge-to-edge fill (robust, no font-metric math)

- Each word becomes a **full-width flex row** whose 6 monospace characters are
  spread with `justify-content: space-between` — first char flush left, last char
  flush right, at every phone width, independent of the font's exact advance ratio.
- Font size on mobile ≈ `26vw` so the glyphs are large and the residual
  inter-char gaps are hairline (reads as lightly tracked mono, on-aesthetic).
- Rejected alternatives: pure `vw` + `letter-spacing` (fragile — depends on exact
  Geist Mono metrics and leaves a trailing-space artifact); JS fit-to-width
  (needless complexity for a constant monospace ratio — YAGNI).

### CipherText preservation

- The animated `CipherText` component renders each char as an `inline-block` span
  and its flash uses `transform: scale` (no reflow). Wrapping each word in a
  `flex`/`space-between` row on mobile does not disturb the decode/ambient
  animation; on `sm+` the word reverts to its natural inline flow.

### Implementation outline (`src/components/sections/hero.tsx`)

- `data-hero-content`: drop the base `px-6`, keep `sm:px-8 md:px-12 lg:px-16` →
  zero horizontal padding on mobile so the name can reach the edges.
- Inner wrapper: `max-w-none sm:max-w-6xl` → full viewport width on mobile.
- Eyebrow `<p>` and tagline `<div>`: add `px-6 sm:px-0` → they keep the gutter on
  mobile, inherit the parent gutter on desktop.
- `<h1>`: `text-[26vw] sm:text-[clamp(3.25rem,12vw,11rem)]` (tune the vw with
  screenshots).
- Each `<CipherText>` word: add a responsive class so the word is
  `flex w-full justify-between` on mobile and reverts (`sm:block sm:w-auto`) on
  desktop. (CipherText already forwards `className` to its wrapper element.)

## Guardrails / edge cases

- Neither "Soheil" nor "Fakour" has descenders, so nothing clips at the edges.
- The section is `overflow-hidden`, containing the subtle flash `scale` at the
  right edge (and `scale` is layout-neutral anyway).
- The `< sm` → `>= sm` size change is a deliberate breakpoint; the jump is only
  visible while resizing a desktop window, never on a real device.
- Reduced-motion path is untouched.

## Verification

- Real-device-width screenshots at **360 / 390 / 430px**, in **dark (default) and
  light** themes, confirming both words kiss both edges with even spacing and
  remain legible / vertically centered.
- Hard gate: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all green.
