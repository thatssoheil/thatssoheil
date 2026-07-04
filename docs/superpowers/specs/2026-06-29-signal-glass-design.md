# Signal Glass — immersive liquid-glass migration

**Date:** 2026-06-29
**Branch:** `feat/signal-glass` (cut off `feat/hero-chat-ui`, not `dev`)
**Status:** Approved (design)

## Context

The site is a near-black void (`--ink-950`) with a signal-blue accent and a cipher
wordmark — restrained, dark-first, content-led. Apple's "Liquid Glass" (iOS 26 /
macOS Tahoe, WWDC 2025) is a *native* OS material; Apple never shipped it to the web,
and even on-device walked back its translucency across three revisions for legibility
([NN/g](https://www.nngroup.com/articles/liquid-glass/),
[Six Colors](https://sixcolors.com/post/2025/11/soaping-up-liquid-glass-less-transparency-more-contrast/)).

A full investigation (see the session research) established three constraints that
shape this design:

1. **Glass is a lens — it dies over a flat dark void.** Blurring near-uniform dark
   pixels yields more uniform dark; the panel reads as flat grey, and text contrast
   is worst-case. Glass *demands* color and gentle motion behind it.
2. **The convincing refraction is Chromium-only** (`backdrop-filter: url(#svg)` via
   `feDisplacementMap`); Safari/Firefox fall back to flat blur. WebGL refraction
   (Igloo Inc, Maxime Heckel) is bespoke and has no DOM/text/fallback.
3. **Legible glass = less glass.** `prefers-reduced-transparency` has ~70% support
   and **none in Firefox**, so glass must be a progressive enhancement that is
   solid/legible by default. Linear shipped its own glass and *rejected* refraction
   precisely because it harms dense, text-heavy reading
   ([Linear](https://linear.app/now/linear-liquid-glass)).

## Decision

Adopt **"Signal Glass"** — the immersive, app-wide hybrid:

| Dimension | Choice |
|---|---|
| Substrate | **Signal mesh-field** — slow-drifting signal-hued radial-gradient blobs over the ink void (a near-black aurora). Gives glass real color to refract; extends the signal identity. |
| Field scope | **Global base layer** — one fixed, full-viewport field in the app shell; the whole site sits on it. |
| Field visibility | **Continuous + glass panels (immersive)** — the field is visible top-to-bottom; *every* content surface (hero, manifesto, connect, chrome) floats as legible glass over it. |
| Glass model | **Linear-style legible glass** (blur + rim + sheen), solid-by-default; **no** site-wide refraction. |
| The "wow" | **One contained refraction moment** at chat-open (Chromium-only progressive enhancement, graceful blur fallback). |
| Motion technique | **CSS-animated layered radial-gradients** (GPU transforms) — not canvas/WebGL. Cheap, cross-browser, SSR-safe, trivially reduced-motion-gated. WebGL is a deliberate non-goal (possible future). |

## Goal

A continuous living signal-field behind the entire site, with all content floating as
legible glass over it — head-turning and immersive, while staying cross-browser,
performant, and WCAG-AA legible, and *extending* (not erasing) the cipher/signal
identity.

## Migration phases

Each phase ships in a legible state — the site is never broken mid-migration.

- **P0 — Foundation (this slice).** Mount the global `SignalField`; define the glass
  design tokens + `.glass` utility + both a11y fallbacks; soften the hero background so
  the field reads through. Reading sections **keep their solid backgrounds for now**
  (temporary) so no text goes unreadable before its glass panel exists. Visible result:
  the field drifts behind the hero.
- **P1 — Go glass, app-wide.** Convert chrome (header, ask-bar, chat overlay, command
  menu) **and** the reading panels (manifesto, connect) to `.glass` over the field.
  The field becomes continuous top-to-bottom. Each panel contrast-proofed.
- **P2 — The wow.** Real refraction at chat-open via SVG `feDisplacementMap`, gated
  behind `@supports` + reduced-motion/transparency, falling back to P1 glass.
- **P3 — Polish.** Card/badge/button glass variants where they earn it; document the
  glass tokens on the `/ds` page.

This spec defines the end state and **fully specifies P0**. P1–P3 are sketched here for
direction and get their own plans.

## Design — P0

### Architecture (three isolated pieces)

```
src/components/signal-field/
  signal-field.tsx     # the fixed, full-viewport living mesh-field (client)
src/app/layout.tsx      # mount SignalField once as the base layer
src/app/globals.css     # glass tokens + .glass utility + field tuning vars
src/components/sections/hero.tsx  # soften bg so the field reads through
```

### `SignalField`

- A `fixed inset-0` element mounted once in the app shell, **below all content**
  (`-z` / its own low layer), `pointer-events-none`, `aria-hidden`.
- Renders 3–4 absolutely-positioned **radial-gradient blobs** in signal hues over the
  ink void, softly blurred, drifting slowly on GPU `transform` (and/or `opacity`)
  via CSS `@keyframes`. Composition is deterministic (no `Math.random()` at render —
  honour the repo clock/RNG rules and SSR safety).
- **Theme-tuned:** dark = dim signal aurora on near-black (the showpiece);
  light = a very faint signal wash on paper (restraint).
- **Reduced motion:** `prefers-reduced-motion: reduce` → a **static** composition
  (animations off), consistent with the existing motion gating in `globals.css`.

### Glass design tokens (`globals.css`, per theme)

Defined in P0, applied to surfaces in P1+. Names are indicative:

- `--glass-bg` — translucent fill (the **legible default** opacity level)
- `--glass-bg-solid` — the opaque fallback fill (reduced-transparency / `@supports`-not)
- `--glass-blur` — backdrop blur radius
- `--glass-saturate` — backdrop saturation boost (manufactures color from the field)
- `--glass-rim` — bright edge/border color (the "lit slab" highlight)
- `--glass-sheen` — specular overlay gradient color
- `--glass-shadow` — soft outer drop

A single reusable **`.glass` utility** (a Tailwind v4 `@utility` or a composed class)
applies fill + `backdrop-filter: blur() saturate()` + rim border + sheen + shadow,
using logical properties for borders.

### A11y contract (baked in from P0)

- **`prefers-reduced-transparency: reduce`** → `.glass` swaps to `--glass-bg-solid`
  and drops `backdrop-filter`.
- **`@supports not (backdrop-filter: ...)`** → same solid fallback. Because Firefox
  lacks the reduced-transparency query entirely, the solid fill is the **default
  baseline** and glass is the progressive enhancement layered on top.
- **`prefers-reduced-motion: reduce`** → `SignalField` static.
- **Contrast:** hero text over the field must hold **WCAG 2.2 AA** (4.5:1 body /
  3:1 large). Verify with measured values, not assumption; dim the field or lift the
  panel backing until it passes.

### Background re-layer (P0)

The page background becomes the field. The hero's current opaque
`--gradient-hero` softens to a translucent vignette so the field reads through it.
Manifesto/Connect keep solid `bg-background` in P0 (they convert to glass in P1).

## P0 scope boundary

- **In:** `SignalField` + mount + hero background re-layer (field visible behind hero);
  glass tokens + `.glass` utility + both a11y fallbacks; light/dark tuning;
  reduced-motion handling.
- **Out (later phases):** glass on any chrome or reading panel (P1); the Chromium
  refraction at chat-open (P2); card/badge/button glass variants (P3); WebGL.
- **Untouched in P0:** the cipher wordmark, `HeroPlane`, eyebrow, tagline, ask-bar
  behaviour, the chat backend/overlay logic, manifesto/connect content.

## Guardrails (immersive model)

- **Reading panels = near-solid glass** (high-opacity backing, low blur, rim + sheen)
  so body text stays AA over the moving field — text lives on near-opaque glass, never
  clear glass.
- **Perf:** the field is cheap CSS gradients; heavy `backdrop-blur` is reserved for the
  hero/overlay chrome, not long scrolling text columns. Watch for the scroll
  "flicker-top" artifact on any blurred panel; keep blurred area small.
- **Field stays dim and slow** behind text, richer and freer in the hero.
- **Cross-browser:** ship `-webkit-backdrop-filter`; remember `filter`/`backdrop-filter`/
  `transform` on an ancestor creates a containing block for fixed descendants (the chat
  overlay is portaled to `<body>` partly for this reason).

## Verification (P0)

No test suite in this repo — verify via tooling and observation:

- **Hard gate:** `eslint .`, `pnpm exec tsc --noEmit`, `pnpm build` all green.
- **Behaviour:** the field drifts behind the hero in dark **and** light; reading
  sections stay calm/solid (P0); `prefers-reduced-motion` → field static;
  `prefers-reduced-transparency` path exercised once tokens are applied (P1).
- **Contrast:** measure hero text against the field — confirm AA.
- **Screenshots:** dark + light, desktop + 390px mobile.

## Out of scope / non-goals

- WebGL / shader refraction (bespoke, no fallback).
- Site-wide refraction (Chromium-only; reserved for the single P2 moment).
- Any backend, content, or routing change.
