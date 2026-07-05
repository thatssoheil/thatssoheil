# ADR-0002 — Glass material: solid-by-default + scoped refraction

**Status:** Accepted (2026-06-29)

## Context

"Liquid glass" on the web is a legibility and performance hazard: translucency drops
contrast below AA on varied backdrops (Apple walked it back across three OS revisions),
and real `feDisplacementMap` refraction renders only in Chromium. See
`docs/superpowers/specs/2026-06-29-signal-glass-design.md`.

## Decision

- **Glass is solid by default.** Translucency + blur apply *only* inside
  `@supports (backdrop-filter)` **and** `@media not (prefers-reduced-transparency: reduce)`.
  The failure mode is "less pretty," never "unreadable."
- **Reading content uses near-solid `.glass-panel`**, not clear glass.
- **Dark glass has no visible rim.** Light mode keeps the rim because it reads as a
  clean physical edge on paper. Dark mode uses fill + shadow only; a bright stroke
  makes the panels feel boxed instead of suspended.
- **Refraction is one contained moment** — the chat takeover, Chromium-only
  (JS engine-detected via `useRefractionSupported`), with a plain-blur fallback. It is
  **not** a site-wide material.
- **No enrichment** (elevation tiers, grain, tint, chromatic aberration) until a real
  surface needs it. Build the API and a perf budget first.

## Consequences

Cross-browser, AA-legible, and cheap on most surfaces. The "wow" is reserved, not
sprayed. Dark surfaces separate through material fill and shadow rather than a hard
outline. Enrichment is a future ADR, gated on a concrete need.
