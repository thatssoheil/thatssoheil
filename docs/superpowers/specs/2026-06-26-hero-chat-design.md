# AI-Soheil hero chat — ask, don't scroll

**Date:** 2026-06-26
**Branch:** `feat/ai-soheil-hero-chat`
**Status:** Approved (design)

## Context

The chat *backend* is already built and live-tested: [`/api/chat`](../../../src/app/api/chat/route.ts)
(streaming SSE proxy to FreeLLMAPI, rate-limit, payload caps),
[`useHeroChat`](../../../src/hooks/use-hero-chat.ts) (thread + `idle → decoding →
streaming → error` state machine), the first-person
[`buildSystemPrompt`](../../../src/lib/ai-soheil/prompt.ts) persona, and the shared
[types/caps](../../../src/lib/ai-soheil/types.ts). What does **not** exist is the
chat **UI**: [hero.tsx](../../../src/components/sections/hero.tsx) is still the fully
static cipher hero ("the only motion is the name's cipher loop").

This step builds that UI. The thesis: the hero invites a conversation instead of a
scroll — *there is no resume here; ask.*

A throwaway eyeball mock was built at `/hero-chat-mock` (route
`src/app/hero-chat-mock/`) to validate look and feel with canned/fake-streamed
data. It is **not** part of this feature and is deleted before merge.

## Goal

Add a professional chat UI to the hero that reuses the existing backend unchanged,
stays faithful to the cipher/"signal" aesthetic, and reads as the page's primary
call to action — without disturbing the static cipher wordmark that anchors the hero.

## Decisions (validated in the mock)

| Dimension | Choice |
|---|---|
| Entry model | **Ask-bar under the name** — the cipher hero stays the headliner; an input + starter chips sit beneath the tagline |
| First-send behavior | **Focused takeover** — the conversation opens in a layer that owns the screen |
| Takeover layer | **Dimmed, non-modal** — the site sits dimmed + blurred behind; page scroll stays live; `Esc`/✕ dismiss |
| Starters | **Curated chips** — 4 short prompts that send + open the layer |
| Reply reveal | **Cipher `decoding` shimmer → plain stream** — maps 1:1 to the hook's `decoding → streaming` states |
| Message style | **Softer bubbles** — user = signal-tinted *outline* bubble; assistant = plain prose + signal-dot `soheil` label |

## Scope

- **In:** a new `src/components/hero/` UI cluster that consumes `useHeroChat`,
  wired into `hero.tsx` beneath the tagline; resting ask-bar + chips; the dimmed
  non-modal chat overlay; cipher decoding loader; message rows; error/rate-limit
  inline states; reduced-motion + a11y handling; mobile layout.
- **Out (YAGNI):** any backend change; conversation persistence/history across
  visits; markdown rendering (the prompt forbids markdown); multi-thread/sessions;
  analytics; the `/hero-chat-mock` route (deleted before merge).
- **Untouched:** the static cipher name, `HeroPlane`, eyebrow, tagline, and
  `ScrollCue` in `hero.tsx`; `/api/chat`, `useHeroChat`, `prompt.ts`, `types.ts`.

## Design

### Architecture (orchestrator + non-modal dimmed layer)

```
src/components/hero/
  hero-chat.tsx      # orchestrator: owns useHeroChat() + resting|active state + input handoff
  ask-bar.tsx        # resting: text input + 4 starter chips
  chat-overlay.tsx   # dimmed non-modal layer: header wordmark, transcript, input, ✕
  chat-message.tsx   # one row: user = softer signal-tinted bubble · assistant = prose + signal-dot label
  cipher-loader.tsx  # the 'decoding' shimmer; reuses cipher-engine's randomGlyph
```

`hero.tsx` renders the existing static block, then `<HeroChat />` immediately under
the tagline. `HeroChat` is the only stateful piece; the others are presentational
and receive props/callbacks.

### Resting state — `ask-bar.tsx`

- A single rounded input ("ask me anything — no resume here") with a signal-fill
  send button, plus 4 starter chips below: **What do you build? · Are you
  available? · Why frontend? · How do you work?**
- Submitting the input or tapping a chip calls `onSend(text)`.
- Chips are real buttons (keyboard-focusable); the input is a `<form>` (Enter sends).

### Takeover — `chat-overlay.tsx` (dimmed, non-modal)

- On the first `onSend`, `HeroChat` sets state `active` and mounts the overlay as a
  `position: fixed inset-0` layer at `z-[var(--z-modal)]` (110, above the header at
  50), with `bg-background/55 backdrop-blur-2xl` so the dimmed, blurred site shows
  behind.
- **Non-modal:** the body is **not** scroll-locked and no focus trap is installed —
  the visitor can still scroll to Manifesto/Connect behind the layer. `Esc` and the
  ✕ button both dismiss back to the resting hero.
- Layer chrome: a top bar with the shrunk cipher wordmark "Soheil Fakour" +
  `ask · don't scroll` eyebrow and the ✕; a scrollable transcript (max reading
  column ~42rem); a pinned input at the bottom.

### Message rows — `chat-message.tsx`

- **User:** right-aligned bubble with a *softer* signal-tinted outline —
  `border` at `color-mix(in oklch, var(--signal-500) 45%, transparent)` over a
  `~14%` signal fill, foreground text. (Not the solid bright blue.)
- **Assistant:** left-aligned plain prose, preceded by a monospace `soheil` label
  with a glowing signal dot. No bubble. Sentence-case, matching the prompt's voice.

### Reply reveal — `cipher-loader.tsx`

- While `status === 'decoding'` (request sent, no token yet), render a short run of
  scrambling glyphs in `--font-cipher`, signal-tinted with a signal glow, beside a
  `soheil` label — reusing `randomGlyph` from
  [`cipher-engine`](../../../src/components/matrix/cipher-engine.ts).
- On the first streamed token (`status === 'streaming'`), the loader is replaced by
  the assistant prose row, which streams plainly (token-by-token from the hook). No
  per-glyph cipher on the reply body — legibility wins there.

### State & data flow

- `HeroChat` calls `useHeroChat()` and keeps one extra bit of local UI state:
  `view: 'resting' | 'active'`.
- `send(text)`: if `view === 'resting'`, set `view='active'`; then call the hook's
  `send(text)`. The resting bar's current value seeds the first message; thereafter
  the overlay's own input drives the thread.
- `status` (from the hook) selects what the transcript tail shows:
  `decoding → cipher-loader`, `streaming/idle → assistant prose`.
- ✕ / `Esc` → `view='resting'` and the hook's `reset()` (aborts any in-flight
  stream, clears the thread).

### Edge states

- `error === 'signal_dropped'` → an inline line in Soheil's voice ("signal
  dropped — try again") with a retry control; never a red toast.
- `error === 'rate_limited'` (HTTP 429) → inline "too many — give it a moment".
- Empty/whitespace input is ignored (the hook already guards via `busyRef`).
- Reaching `MAX_MESSAGES`/`MAX_TOTAL_CHARS` (server caps) surfaces as
  `signal_dropped` — acceptable; no special UI this step.

### Accessibility & motion

- Non-modal semantics: no `aria-modal`, no focus trap. On open, move focus to the
  overlay input; on close, restore focus to the ask-bar input. `Esc` closes.
- An `aria-live="polite"` region wraps the transcript so streamed replies are
  announced; the cipher shimmer is `aria-hidden` with a visually-hidden "decoding"
  label.
- `prefers-reduced-motion` (via the existing
  [`useReducedMotion`](../../../src/hooks/use-reduced-motion.ts)): skip the shimmer
  scramble (static "decoding" + dots) and the fade/translate transitions.

### Mobile

- Overlay sized with `100dvh`/`100svh`; input pinned above the on-screen keyboard;
  chips wrap; transcript scrolls internally. A single `backdrop-blur` layer keeps
  the dimmed effect cheap on phones.

## Guardrails / edge cases

- The resting ask-bar must not push the cipher name off a short viewport — keep the
  hero content vertically centered and let the bar/chips sit in the lower third;
  verify at 360–430px heights.
- The dimmed `fixed` layer is not clipped by the hero's `overflow-hidden`: a fixed
  descendant escapes ancestor clipping unless an ancestor establishes a containing
  block (`transform`/`filter`/`will-change`). The hero sets none, and the mock
  confirmed full-viewport rendering — but if a future ancestor adds a transform,
  portal the overlay to `document.body`.
- Switching theme (light/dark) must keep the user bubble and shimmer legible —
  both source from `--signal-*`/`--brand`, which are already theme-tuned.
- The hook ignores sends while `busyRef` is set, so double-submits and chip-spam are
  safe.

## Verification

- **Hard gate (no test suite in this repo — verify via tooling):**
  `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` all green.
- **Live behavior:** with the real backend bound, exercise `/` (not the mock):
  send a typed message and a chip, confirm `decoding` shimmer → streamed reply,
  multi-turn, ✕/`Esc` dismiss, and scroll-to-sections while open.
- **Backend smoke:** `curl` `/api/chat` with a minimal `{messages:[…]}` body
  confirms SSE still streams (regression check — backend unchanged).
- **Screenshots:** dark (default) + light, desktop + 390px mobile, for resting and
  active states.
- **Cleanup:** `rm -rf src/app/hero-chat-mock` before merge.
