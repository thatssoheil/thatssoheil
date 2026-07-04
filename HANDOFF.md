# HANDOFF — resume here

> Onboarding doc for continuing the hero-chat + design-system work on another machine.
> Delete before this branch merges. Updated 2026-06-30 (was 2026-06-29, Lift-era).

## TL;DR

You're on branch **`chore/ds-systematize`** in worktree
`thatssoheil.worktrees/signal-glass`. The tree is **green** (`pnpm test` =
`eslint . && tsc --noEmit && check:tokens`, plus `pnpm build`).

This session built the **integrated hero chat** end-to-end and shipped it (7 commits,
below). The earlier "Lift" / Radix-modal approaches are **both abandoned**. A
**whole-codebase `/code-review`** then ran — its findings are the triage backlog below.
**Nothing from the review is fixed yet; that's the next job.**

## Onboard (do this first)

1. `git fetch && git checkout chore/ds-systematize && git pull && pnpm install`
   - Branch is pushed; remote tip should be `b2eb691` (or later — see push state).
2. `pnpm dev` (usually http://localhost:3000) for live sanity-runs.
3. Read this file, then skim the hero-chat files under "How the hero chat works".
4. Resume at **"What's NEXT"** — triage the review findings.

> **Live chat needs `.dev.vars`** (the LLM backend binding). Without it, sending shows the
> inline "signal dropped" error state — but the interaction (expand, scroll-center, dim,
> focus) all work for eyeballing.

## Branch & push state

- Remote: `git@github.com:thatssoheil/thatssoheil.git`, branch `chore/ds-systematize`.
- **Verified pushed** via `git ls-remote` — remote tip == local HEAD `b2eb691`.
- ⚠️ **A second session on the home machine has been pushing to this branch all along.**
  Local tracking refs (`origin/…`) have been flaky as a result. **Always trust
  `git ls-remote origin chore/ds-systematize`.** `git fetch` first; if the remote moved
  past `b2eb691`, reconcile before working, and **close that other session.**
- MR flow (later): `chore/ds-systematize` → `feat/signal-glass` → eventually `dev`.
  Pushes are human-gated by default; pushes this session were authorized for handoff.

## What shipped this session — the hero chat (7 commits)

| commit | what |
|---|---|
| `80faf8a` | integrated inline chat — prompt bar grows into the conversation (replaces the modal) |
| `960e83b` | input pinned to the bottom of the expanded box (natural chat flow) |
| `ab76183` | fixed open height + shadcn ScrollArea transcript (box no longer grows) |
| `7d2e72f` | un-clip the box at the fold; scroll-to-center on open, back-to-hero on close |
| `18ad8ba` | keep focus in the composer after sending (no disable-on-busy blur) |
| `0ac805c` | generous hero–manifesto spacing; recede manifesto while chat is open |
| `b2eb691` | **BUILD(deps)** — dep bumps un-bundled from the feature commit (see caveat) |

### ⚠️ The `b2eb691` deps commit — decide keep/drop

Your other machine left **dependency bumps** uncommitted (next `16.2.9`, radix-ui `1.6.0`,
tailwindcss `4.3.1`, lucide, wrangler, `@opennextjs/cloudflare`, …). A `git add -A`
swallowed them into the spacing/dim feature commit; I **split them into `b2eb691`** so the
feature commit (`0ac805c`) stays clean. They're **installed and the build passes against
them**. **Drop `b2eb691` if the bump wasn't intended**, keep it otherwise.

## How the hero chat works (read before editing)

Centerpiece: **`src/components/hero/hero-chat.tsx`** (`<HeroChat />`, rendered by
`src/components/sections/hero.tsx`). One container, two states:

- **Closed** = the prompt bar (height `BAR_H` = `3.25rem`). **On send** the *same* box
  grows to a **fixed** open height (`OPEN_H` = `27rem`) via a `height` transition — it does
  not grow with content; the transcript scrolls inside it.
- Transcript on top (shadcn **ScrollArea**, collapses to 0 when closed), input **pinned to
  the bottom**; new messages append above the input.
- **Bottom-anchor trick**: Radix wraps ScrollArea content in a `display:table` div that
  fights `justify-end`; hero-chat overrides it via the stable
  `[&_[data-radix-scroll-area-viewport]>div]:!flex …!justify-end` selector — works **only
  because the box is fixed-height**. `src/components/ui/scroll-area.tsx` exposes a
  `viewportRef` so the hook keeps the latest message in view.
- **Overflow**: hero section uses **`overflow-x-clip`** (not `overflow-hidden`) so the open
  box can overflow the fold downward un-clipped, while the ambient plane still can't cause
  a horizontal scrollbar.
- **Scroll choreography**: open → smooth-scroll to center the final box (`scrollBoxToCenter`,
  aimed at `OPEN_H` since the wrapper position is stable); close → smooth-scroll to the
  hero top. Respects `prefers-reduced-motion`.
- **Recede the next section**: open toggles `data-chat-open` on `<html>`; the manifesto
  (`src/components/sections/manifesto.tsx`) dims via arbitrary-variant utilities
  (`[:root[data-chat-open]_&]:opacity-25 …blur-[2px] …pointer-events-none`) + `mt-[20vh]`.
- **Focus**: input stays enabled (only the submit button gates on `busy`); `submit()`
  refocuses it so you can fire messages back-to-back.
- Hook: **`src/hooks/use-hero-chat.ts`** (SSE). Backend: **`src/app/api/chat/route.ts`**.
  System prompt: `src/lib/ai-soheil/prompt.ts`.

All verified live in chrome-devtools (computed-style assertions): fixed 432px height,
dead-center on open, `justify-end` bottom-anchor, manifesto opacity 0.25→1, focus retained
through the busy window.

## In-progress: whole-codebase `/code-review` (high effort) — triage backlog

Six finder angles ran; **no crash-level bugs, all gates green.** Findings are real, ranked,
**none fixed yet.** (The deep chat-UI finder was still running at handoff — its scope is
hero-chat/scroll-area/manifesto/hero, already reflected above; re-dispatch if you want it.)

### Worth fixing

1. **[perf] Ambient `CipherText` re-renders the hero name ~36fps forever.**
   `src/hooks/use-cipher-animation.ts:112-120` + `cipher-engine.ts` ambient branch. In
   `ambient` mode the engine never sets `done`, so the 28ms interval calls `setDisplay`
   every tick for the page lifetime — re-rendering all 13 `<span>`s even while the name is
   static between flickers (3–6.5s apart). No dirty-check. → stop the interval while
   ambient-idle, or skip `setDisplay` when the snapshot is unchanged. **Shipped hero config.**
2. **[UX] 45s stream cap silently truncates long replies.** `src/app/api/chat/route.ts:63`.
   `AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)` is on the upstream fetch but the body is
   relayed live, so it bounds *total* stream time, not stall time. At T+45s a long answer is
   cut mid-sentence; client sees the stream close with `started===true` and falls to `idle`
   with no error. → per-chunk stall watchdog (reset on each chunk), or error on abort-after-start.
3. **[nav] "Connect" may never become the active nav section.**
   `src/hooks/use-active-section.ts:30-34`. The IntersectionObserver only ever *sets* on
   intersect (never clears) with a 5%-tall band (`-20%/-75%`); at max scroll `connect`
   (`min-h-[80dvh]` + footer) may not intersect, leaving the header stuck on "Manifesto".
   **Confirm in a browser** (scroll to bottom, watch the nav). → fall back to
   last-section-by-scroll-position or adjust the band.

### Quick wins / latent

4. **[leak, latent]** `src/hooks/use-hero-chat.ts` — no unmount cleanup; in-flight stream
   isn't aborted on unmount (leaked paid LLM call + setState-after-unmount). Low practical
   impact (hero never unmounts here); one-line fix:
   `useEffect(() => () => abortRef.current?.abort(), [])`.
5. **[convention]** `src/app/ds/page.tsx:626` hardcodes `oklch(0.64 0.16 210)` (exact dup of
   `--field-accent` dark value) + bare `var(--signal-500)` — an ADR-0001 violation that
   ships green because the eslint tier/glass law scopes only `src/components/**`, leaving
   **`src/app/**` unguarded** (`eslint.config.mjs:57-73`). → use `var(--field-accent)` /
   `var(--primary)`; consider widening the lint glob to `src/app/**` (exempt `/ds`).
6. **Notes (low):** `CipherText` `split("")` breaks astral/emoji into surrogates (ASCII-only
   shipped); `revealedHold` is dead config in ambient mode; `command-menu` `copyEmail`
   setTimeout has no cleanup + ⌘K has no target guard; `layout.tsx:103` stale `.js` FOUC
   comment (no-op); `surface.tsx:18` `refract` fallback comment is misleading (variant
   unused); chat backend trusts client `assistant` turns (soft injection defense), lacks
   `X-Accel-Buffering: no`, origin guard fails open when both `sec-fetch-site`+`origin`
   absent (by design).

## What's NEXT (in order)

1. `git fetch` — reconcile with any home-session commits past `b2eb691`; decide keep/drop
   on the `b2eb691` deps commit.
2. **Triage the review findings** above — at least #1 (perf) and #2 (stream cap); #3 needs a
   browser confirm first.
3. **Slice 2 T3** — collapse the ~40 type ramps → ~6–7 semantic roles, migrate product type,
   then enable the deferred arbitrary `text-[…rem]` lint rule.
4. **Slice 2 T4** — migrate remaining `text-foreground/NN` (≈11 in components) to the
   `--text-muted`/`--text-faint` tiers, then enable the deferred `text-foreground/[0-9]` rule.
5. **Slice 2 T5** — `voice.ts` charter (single-source persona voice + error/decline copy) +
   States layer (Spinner / `aria-busy`, `--disabled-opacity` exists, unify focus to
   `--ring-focus`).
6. **Slice 3** (later) — forced-colors + mobile/perf tier, layout primitives, drift-proof
   `/ds`, polish. Plan: `docs/superpowers/plans/2026-06-29-ds-systematize.md`.

## What was already DONE before this session (context)

- **Signal Glass** liquid-glass migration (P0–P3): field, glass material, app-wide glass,
  Chromium refraction, `/ds` docs.
- **Two council audits** (`docs/audits/`): site audit (6.5/10) + DS gap analysis (4.7/10).
- **Audit remediation:** contrast tiers, sheen, identity single-source, scrambled-H1 fix,
  retry bug, `/api/chat` origin guard + timeouts, OG/robots/sitemap, Now/content data layer
  + AI persona.
- **DS Slice 1** (truth + governance): honest fonts (`--font-mono` = real Geist Mono),
  retheme contract, ADRs 0001–0005, `CONTEXT.md`, `docs/deliberately-omitted.md`, the
  hard-fail lint gate (`eslint.config.mjs`) + token-coverage test (`scripts/check-tokens.mjs`).
- **Slice 2 T1** `<Surface>` primitive; **T2** chat/UI primitives (`Input`, `IconButton`,
  `ui/` barrel) + inline-glass lint ban. (T2's Radix-modal chat is superseded by this
  session's integrated chat.)

## Verify (every change)

```bash
pnpm exec tsc --noEmit        # types
pnpm exec eslint .            # DS tier/glass lint gate (Next 16 removed `next lint`)
node scripts/check-tokens.mjs # token coverage
pnpm build                    # prod build (also regenerates .next/types)
pnpm dev                      # live at :3000
```

## Gotchas / house rules (enforced)

- **Lint gate (ADR-0001, `eslint.config.mjs`):** in `src/components`, NO bare
  `var(--signal-*)/var(--ink-*)`, NO raw `oklch(`/`rgba(` literals, NO inline glass classes
  (compose `<Surface>`/`surfaceVariants`; `ui/` + `signal-field/` exempt). Two rules are
  deferred until T3/T4: `text-foreground/NN` and arbitrary `text-[…rem]`.
  ⚠️ The gate currently scopes only `src/components/**` — `src/app/**` is a blind spot (see
  review finding #5).
- **The dev server does NOT hot-reload `globals.css` `@layer`/token edits** — restart
  `pnpm dev` after authored-CSS structural changes. Tailwind utilities on components
  recompile fine. (Why the manifesto dim is utilities, not a `globals.css` rule.)
- **Stale `.next` types:** after deleting a route, `pnpm build` once or `tsc` reports a
  phantom missing-module error.
- **`radix-ui` is the unified meta package** — import `{ ScrollArea as ScrollAreaPrimitive }
  from "radix-ui"`, not per-primitive packages.
- **Trust `git ls-remote`** over local tracking refs on this branch (concurrent session).
- **Token-coverage:** every `var(--token)` in `src/**` must be defined in `globals.css`
  (runtime font vars allow-listed).

## Repo facts

Next 16 (App Router, RSC) · React 19 · TS strict · Tailwind v4 (CSS-first `@theme`) · GSAP
3.15 (+ Flip) · OpenNext/Cloudflare. Fonts: Lexend (sans + eyebrow register), Geist Mono
(`--font-mono` + the cipher wordmark via `--font-cipher`). Dark-default + kept-correct
light theme. Deeper context: `CONTEXT.md`, `docs/audits/`, `docs/superpowers/`.
