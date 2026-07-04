# Audit remediation — Signal Glass council report

**Date:** 2026-06-29
**Branch:** `feat/signal-glass`
**Source:** [docs/audits/2026-06-29-signal-glass-council-audit.md](../../audits/2026-06-29-signal-glass-council-audit.md)
**Status:** Approved (autopilot — owner granted blanket allowance)

## Context

The 36-agent council graded the site **6.5/10**: craft is high (Engineering 7.7), but
two cheap blockers gate the whole site — every hireable fact is trapped in `README.md`
and never reaches a visitor or the AI persona (#1), and the low-opacity text tier fails
WCAG AA in both themes (#2) — alongside a cluster of small correctness/hardening gaps.
This spec turns the audit's **Now** bucket into implementation, and records **Next/Later**
for follow-up.

## Goal

Land every `Now`-bucket priority: the site can finally *say* what it's built to say
(content + identity), holds WCAG AA on real copy, stops shipping a duplicate-turn chat
bug, protects its paid endpoint, and stops 404-ing every social share — without
regressing the glass craft the council praised.

## Scope — Now bucket (this spec)

Each item: the fix and the files. Verify gate after each: `eslint .` · `tsc --noEmit`
· `pnpm build` green (no test harness yet — added in Later/#13).

### #8 — Sheen inversion (S)
`--glass-sheen` derives from `--foreground`, so in light mode the top-inner highlight
paints a **dark** smudge (the opposite of glass). Re-derive the sheen from white in
both themes; keep the rim foreground-derived.
*Files:* `src/app/globals.css` (`--glass-sheen` in `:root` + `.dark`).

### #2 — Contrast token tiers (M)
Replace ad-hoc `text-foreground/30…/45` (fails 1.4.3, worst in light) with two measured
per-theme semantic tiers. Add `--text-muted` (≥4.5:1 body) and `--text-faint`
(≥3:1, large/decorative only) to `:root` and `.dark`, expose as `--color-text-muted` /
`--color-text-faint` in `@theme`, and swap the offending usages to `text-text-muted` /
`text-text-faint`.
*Files:* `globals.css`; `sections/hero.tsx`, `sections/manifesto.tsx`,
`sections/connect.tsx`, and any other `/30–/45` info text.

### #9 — Single-source identity (S)
Role string, tagline casing, JSON-LD `jobTitle`, `twitter:creator`, and `.com` vs
`.website` all disagree. Make `src/lib/constants.ts` the single source: one canonical
`ROLE`, `TAGLINE`, `jobTitle`, handle, and correct `url`; derive every surface from it.
Drop unsupported "WebGPU"/"creative technologist" keywords.
*Files:* `lib/constants.ts`, `components/json-ld.tsx`, `app/layout.tsx`,
`sections/hero.tsx`, `data/manifesto.ts` (role phrase).

### #7 — Scrambled-H1 accessible name (S)
The H1 (the name) renders as deterministic garbage glyphs in no-JS/crawler HTML. Make
the real name the text source of truth (visually-hidden real text + `aria-hidden`
cipher overlay, or seed the cipher's initial display with the real characters so SSR
HTML is correct).
*Files:* `components/sections/hero.tsx`, `components/matrix/cipher-text.tsx`
(+ `use-cipher-animation` initial state).

### #4 — Retry duplicate-turn + stable keys (S)
`handleRetry` re-`send()`s the last user content, which re-appends a user turn on top of
the committed failed one. Add a `retry()` to the hook that replays
`messagesRef.current` instead of appending; assign an `id` per message at creation and
key the transcript on it.
*Files:* `src/hooks/use-hero-chat.ts`, `components/hero/hero-chat.tsx`,
`components/hero/chat-overlay.tsx` (key), `lib/ai-soheil/types.ts` (id on message type
if needed — keep `ChatMessage` wire-shape intact; use a separate UI id).

### #5 — `/api/chat` origin guard + timeouts (S)
Reject cross-origin calls (`Sec-Fetch-Site` not same-origin/same-site; fallback: `Origin`
host vs `SITE.url`). Wrap the upstream fetch in `AbortSignal.timeout(...)`. Add a client
inactivity watchdog that aborts to `error='signal_dropped'`.
*Files:* `src/app/api/chat/route.ts`, `src/hooks/use-hero-chat.ts`.

### #6 — og image + robots + sitemap (S)
Generate the missing OG image with `next/og` (`app/opengraph-image.tsx`) so shares stop
404-ing; add `app/robots.ts` (allow all, disallow `/ds` + `/api`, link sitemap) and
`app/sitemap.ts`.
*Files:* `src/app/opengraph-image.tsx` (new), `src/app/robots.ts` (new),
`src/app/sitemap.ts` (new); reconcile `metadata.openGraph.images` if needed.

### #1 — Content data layer → page + prompt (M)
The README facts (medical-AI work, prior roles, stack, Oman, availability) reach nobody.
Add a typed `now`/`projects`/`status` data source, render a concise **Now / Work** block
on the page, and thread the same facts into `buildSystemPrompt()` so the persona can
answer "what do you build?"/"are you available?" truthfully.
*Files:* `src/data/now.ts` (new, the facts — derived from README), a section/block
component (e.g. extend Manifesto or a small `Now` block), `src/lib/ai-soheil/prompt.ts`,
`src/data/manifesto.ts` if the block lives there.

## Out of scope (recorded — Next / Later, own specs)

- **Next:** #3 chat takeover → Radix Dialog (semantics, focus trap/return, scroll lock,
  44px targets, enter/exit choreography, clean live regions) · #10 focusing frame +
  fed refraction (wire `--gradient-hero`, structured field behind chrome only) ·
  #11 pause field when occluded / in-view gating.
- **Later:** #12 DS↔product reconciliation + honest `font-mono` · #13 safety net
  (Vitest, `app/error.tsx`, security headers, fix `lint` script) · #14 Firefox/Safari
  glass fail-open · #15 LLM-relay privacy disclosure · #16 voice/icon reconciliation.

## Verification

- Per item: `eslint .` / `tsc --noEmit` / `pnpm build` green.
- #2: re-check the previously-failing text now clears AA in both themes.
- #1/#9: the page renders the new facts; `buildSystemPrompt()` includes them; identity
  reads consistently across hero, JSON-LD, and metadata.
- #6: `/opengraph-image`, `/robots.txt`, `/sitemap.xml` resolve in the build output.
- #4: a failed send + retry shows the user turn once.
