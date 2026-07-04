# Hero chat — "The Lift"

**Date:** 2026-06-29
**Branch:** `chore/ds-systematize`
**Status:** Approved (design validated live via the `/lift-mock` throwaway prototype)

## Context

The Slice-2 chat takeover was rebuilt as a full-page Radix modal; the owner rejected
that feel. New direction: on first prompt, the hero **square** elevates *above* the
name and becomes the conversation, with a smooth, device-friendly transition — **not**
a full-page modal. The core motion was prototyped at `/lift-mock` and approved.

## Decisions (locked)

- **Name-morph:** the hero name is the shared element — it shrinks and flies up into the
  card's header via **GSAP Flip** (free since 3.12; repo is on 3.15).
- **Contained centered card** (`min(92vw,40rem) × min(80svh,34rem)`), floating with the
  field + frosted surroundings visible around it — never a takeover.
- **Keyboard-aware everywhere:** one centered-card metaphor on all devices; on phones it
  shifts up via `visualViewport` so the composer clears the on-screen keyboard.

## Design

### Architecture

Orchestration lifts into **`HeroSection`** (owns `active`, `value`, `useHeroChat`) so it
can coordinate three actors:

- **The name** — one `CipherText` h1, the FLIP subject. It is an **overlay** element
  (absolutely positioned, `z` above the card header) animated between two invisible
  layout anchors: `#name-home` (resting, large, centered in the hero) and `#name-slot`
  (in the card header, small). `Flip.fit(name, anchor, { scale: true })` morphs it.
- **`ChatPanel`** — the lifted glass card (`<Surface variant=strong|refract edge radius=lg>`):
  the header (with the name slot), the transcript, the `PromptBar` composer.
- **Chrome** — eyebrow, tagline, ask-bar, `HeroPlane` square, scroll cue → fade out on
  active (the square gets an `active` prop; the rest live in a `#hero-chrome` group).

### Motion (one `useGSAP` timeline)

- **Open:** `Flip.fit(name → #name-slot, ~0.55s, power3.inOut)`; card `scale 0.9→1` +
  `autoAlpha 0→1` + `y 18→0` + growing `--shadow-elevated` (~0.5s, power3.out); chrome
  `autoAlpha→0` (~0.3s); square `autoAlpha→0` (~0.45s).
- **Close:** reverse — `Flip.fit(name → #name-home)`; card sinks (`scale 0.9, autoAlpha 0,
  y 18`); chrome + square fade back.
- **Mount:** `Flip.fit(name → #name-home, duration 0)` so the overlay snaps onto its
  resting box.
- **Resize:** re-fit the name to its current anchor (home if resting, slot if active) so
  the overlay tracks layout.
- **Reduced motion:** all `Flip.fit`/tweens run at `duration 0` (instant crossfade),
  gated via the existing reduced-motion seam.

### The cipher

Resting, the name ambiently re-ciphers. On morph it **settles to plain "Soheil Fakour"**
in the header (a header shouldn't scramble); resumes ambient on close. `CipherText` gets
a `settled` prop (or the orchestrator pauses ambient while `active`).

### Close / settle

**Esc**, **✕**, and **click-outside-the-card** all settle it back. Focus returns to the
ask-bar input.

### Mobile + keyboard

Card height `min(80svh,34rem)`; a `useViewportInset` hook reads `window.visualViewport`
and applies an upward translate equal to the keyboard inset while the composer is
focused, so the reply field stays visible; `env(safe-area-inset-bottom)` padded.

### Accessibility

`role="dialog" aria-modal="false"` (contained, non-modal — matches the "not a takeover"
intent), `inert` when closed, focus-in on open, `aria-live="polite"` transcript, Esc +
focus-return.

## Code delta

- **Refactor** `src/components/sections/hero.tsx` to own the lift orchestration + the
  `#hero-chrome` group + the name overlay/anchors.
- **Revise** `src/components/hero/chat-panel.tsx` (the draft) so the name lands in a
  header *slot* (remove the duplicate header wordmark); wire `active` transforms.
- **New:** `src/hooks/use-viewport-inset.ts`; the Flip wiring (a `useChatLift` hook or
  inline `useGSAP` in HeroSection); register `Flip` in `src/lib/gsap.ts`.
- **`HeroPlane`** gets an `active` prop (fade).
- **Delete:** `src/components/hero/chat-dialog.tsx` (the Radix modal) and the
  `src/app/lift-mock/` throwaway.
- **Keep:** the primitives (`Input`/`IconButton`/`PromptBar`/`Surface`), `ask-bar`,
  `useHeroChat`, `ChatMessageRow`, `CipherLoader`, refraction.
- **Supersedes:** the earlier `feat(chat): Rebuild takeover as a true-modal Radix Dialog`
  commit (the modal is replaced; its primitives survive).

## Verification

- `eslint .` / `tsc --noEmit` / `pnpm build` / token-coverage green.
- Live: open via ask-bar + a starter chip → name morphs to header, card lifts; Esc / ✕ /
  click-outside settle it back; focus returns to the ask-bar. Reduced-motion → instant.
  Mobile (≤430px): composer clears the keyboard; touch targets ≥44px.
- The send path hits the real backend (error path locally — expected).
