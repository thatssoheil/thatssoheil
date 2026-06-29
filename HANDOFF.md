# HANDOFF — resume here

> Working handoff for continuing the Signal Glass design-system work on another machine.
> Delete this file before the branch merges. Written 2026-06-29.

## TL;DR

You're on branch **`chore/ds-systematize`**. The tree is **green** (`pnpm test` =
`eslint . && tsc --noEmit && check:tokens`, plus `pnpm build`). The next concrete job is
**implement "The Lift"** (the hero chat) per
[`docs/superpowers/plans/2026-06-29-hero-chat-lift.md`](docs/superpowers/plans/2026-06-29-hero-chat-lift.md) —
design approved live, plan written, **not yet executed**.

## How to onboard (do this first)

1. `git fetch && git checkout chore/ds-systematize && pnpm install`
2. Read, in order: this file → [`CONTEXT.md`](CONTEXT.md) → the two audits in
   [`docs/audits/`](docs/audits/) → the active plans/specs in `docs/superpowers/`.
3. `pnpm dev` (usually :3000) for the live sanity-runs the plans call for.
4. Resume by executing the Lift plan inline (superpowers:executing-plans), then Slice-2
   T3–T5 (below).

## Branch chain (all pushed to origin)

`dev` → `feat/hero-chat-ui` (PR #16) → `feat/signal-glass` → **`chore/ds-systematize`** (here).
Each carries the prior in its history; `chore/ds-systematize` has everything. Pushes are
normally human-gated — this push was explicitly authorized for the handoff.

## What's DONE on this branch

- **Signal Glass** liquid-glass migration (P0–P3): the field, the glass material, app-wide
  glass, Chromium refraction, `/ds` docs. (Earlier on `feat/signal-glass`.)
- **Two council audits** (in `docs/audits/`): the site audit (6.5/10) and the
  **design-system gap analysis** (4.7/10 — "a beautiful theme, not yet a system").
- **Audit remediation** (the site-audit "Now" bucket): contrast tiers, sheen, identity
  single-source, scrambled-H1 fix, retry bug, /api/chat origin guard + timeouts, OG +
  robots + sitemap, the Now/content data layer → page + AI persona.
- **DS systematization Slice 1** (truth + governance): honest fonts (`--font-mono` is now
  **real Geist Mono**; eyebrows are a Lexend register), true retheme contract, ADRs
  0001–0005 + `CONTEXT.md` + `docs/deliberately-omitted.md`, and the **hard-fail lint
  gate** (`eslint.config.mjs`) + **token-coverage test** (`scripts/check-tokens.mjs`).
- **Slice 2 T1** — `<Surface>` primitive; panels/menu/header routed through it.
- **Slice 2 T2** — chat/UI primitives (`Input`, `IconButton`, `PromptBar`, `ui/index.ts`
  barrel) + **inline-glass lint ban**. NOTE: T2 also rebuilt the chat as a Radix modal
  (`chat-dialog.tsx`) — **that modal is REJECTED and superseded by "The Lift"** (below).

## What's NEXT (in order)

1. **Implement "The Lift"** — plan: `docs/superpowers/plans/2026-06-29-hero-chat-lift.md`,
   spec: `docs/superpowers/specs/2026-06-29-hero-chat-lift-design.md`. 6 tasks: register
   GSAP Flip → `useViewportInset` → `useChatLift` (the morph timeline, proven) → revise
   `chat-panel.tsx` → refactor `hero.tsx` → **delete `chat-dialog.tsx` + `hero-chat.tsx`**.
   The hero name morphs (GSAP Flip) into a contained glass card's header; no full-page
   modal. `cipher-settle` is free via `ambient={!active}`. Reduced-motion = instant.
   - WIP already on the branch: `src/components/hero/chat-panel.tsx` (the draft the plan's
     Task 4 revises). The `/lift-mock` throwaway that validated the motion was deleted.
2. **Slice 2 T3** — collapse the ~40 type ramps → ~6–7 semantic roles, migrate product
   type, then **enable the deferred `arbitrary text-[…rem]` lint rule**.
3. **Slice 2 T4** — migrate the remaining `text-foreground/NN` (≈11 in components) to the
   `--text-muted`/`--text-faint` tiers, then **enable the deferred `text-foreground/[0-9]`
   lint rule**.
4. **Slice 2 T5** — `voice.ts` charter (single-source the persona voice + error/decline
   copy) + States layer (Spinner / `aria-busy`, the `--disabled-opacity` token already
   exists, unify focus to `--ring-focus`).
5. **Slice 3** (later) — forced-colors + mobile/perf tier, layout primitives, drift-proof
   `/ds`, polish (Icon primitive, brand-blue unify). See the DS plan
   `docs/superpowers/plans/2026-06-29-ds-systematize.md`.

## Gotchas / house rules (enforced)

- **Lint gate (ADR-0001, `eslint.config.mjs`):** in `src/components`, NO bare
  `var(--signal-*)/var(--ink-*)`, NO raw `oklch(`/`rgba(` color literals, NO inline glass
  classes (compose `<Surface>`/`surfaceVariants`; `ui/` + `signal-field/` are exempt).
  Two rules are **intentionally deferred** and turn on in T3/T4 once clean:
  `text-foreground/NN` for text, and arbitrary `text-[…rem]` sizes.
- **Verify before every commit:** `pnpm test` (lint + tsc + token-coverage) + `pnpm build`.
  The `lint` script is `eslint .` (Next 16 removed `next lint`).
- **Token-coverage** (`scripts/check-tokens.mjs`): every `var(--token)` in `src/**` must be
  defined in `globals.css` (runtime font vars allow-listed). It catches dangling tokens.
- **Stale `.next` types:** after deleting a route, `pnpm build` once to regenerate
  `.next/types` or `tsc` reports a phantom missing-module error.
- **Pushing stays human-gated** by default (this handoff push was explicitly approved).
  Never force-push; the MR flow is `chore/ds-systematize` → `feat/signal-glass` →
  eventually `dev`.

## Repo facts

Next 16 (App Router, RSC) · React 19 · TS strict · Tailwind v4 (CSS-first `@theme`) · GSAP
3.15 (+ Flip) · OpenNext/Cloudflare. Fonts: Lexend (sans + eyebrow register), Geist Mono
(`--font-mono` + the cipher wordmark via `--font-cipher`). Dark-default + a kept-correct
light theme.
