# Env-Enabled Ask Console Design

**Date:** 2026-07-06
**Branch:** `feat/env-enabled-chat`
**Status:** Approved direction; awaiting spec review

## Context

The site already has a streaming chat path:

- `src/app/api/chat/route.ts` proxies OpenAI-compatible SSE to `AI_SOHEIL_API_URL`.
- `src/hooks/use-hero-chat.ts` owns the thread, stream parsing, retry, abort, and error states.
- `src/lib/ai-soheil/prompt.ts` builds a first-person system prompt from `NOW`, `MANIFESTO`, and links.
- `src/components/hero/hero-chat.tsx` currently renders the whole chat inline under the hero.
- `src/components/command-menu.tsx` already provides the hidden glass command surface opened by Cmd+K.

The new goal is not to add another chat backend. It is to make the chat feel intentional on the site: the hero shows only a minimal prompt bar, while the conversation itself lives out of sight until invited.

## Goal

Ship an env-enabled public chat that opens from a smooth, hero-aligned prompt bar into a dedicated Ask Console, backed by a repo-local typed knowledge dictionary so answers about Soheil are precise, reviewable, and versioned with the website.

## Decisions

| Dimension | Choice |
| --- | --- |
| Placement | **Shared Ask Console**: the hero bar opens a dedicated centered chat surface that visually belongs with Cmd+K but is not the command list. |
| Secondary entry | Cmd+K includes an “Ask Soheil” action/mode that opens the same console. |
| Hero footprint | Only a slim prompt bar and small starter affordances; no expanded transcript inside the hero. |
| Knowledge source | Repo-local typed dictionary rendered into the system prompt. |
| Backend | Existing `/api/chat` route, OpenAI-compatible `/v1/chat/completions`, streaming SSE. |
| Env behavior | Chat is public only when both client and server flags opt in. |
| Scope discipline | No auth, analytics, persistence, markdown renderer, vector search, or external CMS in this slice. |

## UX Design

### Hero Prompt Bar

The hero should read as a refined personal site first, not a chatbot page. The visible chat footprint is a single quiet prompt bar under the cipher name and role treatment, styled with the existing glass and signal tokens. It accepts text and sends on Enter. Starter prompts remain available but should feel lighter than the primary bar.

On submit, the page opens the Ask Console and forwards the submitted text into the existing `useHeroChat().send(text)` flow. The prompt bar remains the visible invitation, not the transcript container.

### Ask Console

The console is a centered, contained surface using the command menu’s glass vocabulary: dark/light theme-aware material, restrained signal accent, tight typography, and a scrollable transcript. It is dedicated to chat, so it has a transcript, pinned composer, close control, and status/error row instead of command groups.

The console is not a literal Cmd+K result list. This avoids overloading the command menu search input as a chat composer. It should feel like a sibling surface to Cmd+K: same family, different job.

Expected interactions:

- Hero prompt submit opens the console and sends the first message.
- Cmd+K can expose an “Ask Soheil” action that opens the console with an empty composer.
- Escape and close settle the console and return focus to the previous entry point.
- The transcript uses the existing assistant/user row language: user is a quiet signal outline; assistant is plain prose under the `soheil` label.
- Reduced-motion users get instant open/close and no decorative shimmer dependency.

## Knowledge Dictionary

Create a repo-local data module at `src/data/ai-soheil.ts`, with typed sections that can be reviewed like product copy:

- `identity`: name, role, location/travel context, preferred framing.
- `currentWork`: current focus, availability, stack, what he is looking for.
- `background`: backend origin, travel/channel-management work, move to frontend.
- `projects`: notable projects or categories he can discuss.
- `principles`: curation, prototype-first work, frontend as product decision surface.
- `contact`: email and canonical links.
- `boundaries`: topics the assistant should decline or redirect.
- `qa`: optional precise answers for common visitor questions.

`buildSystemPrompt()` renders this dictionary along with the existing `NOW`, `MANIFESTO`, and constants. The prompt should tell the model to answer only from this source of truth, admit when the dictionary does not contain an answer, and redirect off-topic requests back to Soheil’s work.

This keeps the first version simple: no embeddings, no retrieval, no CMS, no runtime fetch. The dictionary can later become the input to retrieval if it outgrows a prompt.

## Env Contract

The chat has two gates:

- `NEXT_PUBLIC_ENABLE_CHAT === "true"` controls whether client chat entry points render.
- `ENABLE_CHAT === "true"` controls whether `/api/chat` accepts requests.

The UI should avoid presenting a working prompt bar when the server flag is intentionally off in a known deploy configuration. Documentation and `.dev.vars.example` should make the two-flag requirement explicit, including local development values.

The server continues to require `AI_SOHEIL_API_URL` and `AI_SOHEIL_API_KEY`. The upstream remains OpenAI-compatible at `/v1/chat/completions`, with streaming enabled.

## Architecture

Keep boundaries small:

- `src/components/hero/hero-chat.tsx` becomes the hero entry, not the full transcript host.
- A new console component at `src/components/ai-soheil/ask-console.tsx` owns the dialog/surface layout and transcript rendering.
- A small shared state boundary coordinates whether the console is open and what initial prompt to send. This can be a local provider near the root page if both `HeroSection` and `CommandMenu` need to open it.
- `useHeroChat` remains the streaming state machine and should not absorb layout concerns.
- `src/data/ai-soheil.ts` owns factual knowledge; `prompt.ts` owns prompt rendering.
- `starters.ts` stays the source for starter prompts unless the dictionary’s `qa` section becomes the better home.

## Error Handling

- `429` remains `rate_limited`: show “too many. give it a moment.”
- Failed upstream, disabled server, malformed stream, or timeout remain `signal_dropped`: show “signal dropped. try again.”
- If the client flag is disabled, no hero prompt or Ask action renders.
- If the API returns 404 because the server flag is disabled, the console should treat it as unavailable rather than leaking implementation details.

## Accessibility

- The Ask Console uses a real dialog with a labelled title, predictable focus return, and `aria-modal="true"` while open.
- Cmd+K continues to work for command navigation. Opening the Ask Console from Cmd+K should close the command list first.
- The transcript should remain `aria-live="polite"` and should not announce every decorative glyph.
- Buttons use icons where familiar, with accessible labels.
- Touch targets stay at least 44px on mobile.

## Visual Direction

Tone: refined minimalism with signal-glass restraint. The memorable moment is not a big chatbot widget; it is the handoff from a quiet hero prompt into a hidden console that feels like a private terminal for asking about Soheil.

Use the existing site system:

- `surfaceRole.commandMenuPanel` and related glass tokens as the material baseline.
- Existing `Input`, `IconButton`, `ScrollArea`, `ChatMessageRow`, and `CipherLoader` where they still fit.
- No generic gradient chat bubble UI.
- No permanent floating chat button.
- No transcript taking over the hero layout.

## Verification

Automated:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Behavioral:

- With both flags true, hero prompt opens the Ask Console and streams from the custom v1 endpoint.
- Cmd+K “Ask Soheil” opens the same console.
- With `NEXT_PUBLIC_ENABLE_CHAT=false`, chat entry points are absent.
- With `ENABLE_CHAT=false`, `/api/chat` returns disabled behavior and the UI handles it gracefully.
- The dictionary answers common questions about work, availability, background, principles, and contact without inventing facts.
- Off-topic asks are declined briefly and redirected.
- Desktop and mobile layouts keep text readable and controls aligned with the hero and command menu.
