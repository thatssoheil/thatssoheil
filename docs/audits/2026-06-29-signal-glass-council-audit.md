---
date: 2026-06-29
topic: Signal Glass website (full-site liquid-glass migration)
branch: feat/signal-glass
method: 36-agent council audit (30 specialist lenses → 5 domain chairs → editor synthesis)
overall: 6.5/10
scores:
  design: 6.9
  engineering: 7.7
  accessibility: 6.4
  content-growth: 5.4
  quality-risk-platform: 6.8
remediation: docs/superpowers/specs/2026-06-29-audit-remediation-design.md
---

# Signal Glass Website Audit — Council Report

## Executive summary

Soheil, this is genuinely senior-grade work, and the council means that — not as a courtesy. The Signal Glass material system (`src/app/globals.css:416-466`), the restraint of one typeface plus one accent, the cipher motif, the honestly-gated Chromium refraction, and the production-discipline streaming chat (`src/hooks/use-hero-chat.ts`) all clear the "template" bar with room to spare. The problem is a single, consistent pattern across all five councils: **your most ambitious ideas are defined but not landed**, and they cluster on two surfaces — the chat takeover and the de-emphasis text tier — plus one content failure that caps everything. The site is a beautiful identity page that cannot answer the two questions that convert ("what have you shipped?" and "are you available?") because every concrete fact is trapped in `README.md`, it fails its own WCAG AA on real positioning copy, and its centerpiece chat is modal in look but non-modal in behavior. **Overall grade: 6.5/10 — a strong 7 on craft, dragged down by a hollow content system and a cluster of unfinished hardening.** The single most important thing to do next: **promote the README "Now" facts (medical-AI work, availability, Oman) into a data layer that feeds both the rendered page and the AI prompt** — it's wiring, not writing, and it unblocks the whole site's purpose.

## Scorecard

| Domain | Avg score /10 | One-line verdict |
|---|---|---|
| Design & Experience | 6.9 | Tasteful, disciplined, senior craft; the most ambitious moments are defined but not staged. |
| Engineering | 7.7 | Best-in-class CSS glass and honest progressive enhancement; defects concentrate in the chat layer. |
| Accessibility | 6.4 | One of the more a11y-literate glass builds reviewed — but not AA-conformant as shipped. |
| Content & Growth | 5.4 | Excellent voice, hollow content system; the proof exists one file away in README. |
| Quality, Risk & Platform | 6.8 | Strong core engine, contained risk, missing safety net (no tests, no error boundary, no timeout). |
| **Overall** | **6.5** | **Award-reaching taste; the last 20% of finishing is what's missing.** |

## What's genuinely excellent

These are the cross-council consensus strengths — celebrate them, then protect them.

- **The glass material system is the architectural high point** (`globals.css:416-467`). Composable `.glass` / `.glass-panel` / `.glass-edge` / `.glass-strong` / `.glass-refract`, token-driven, **solid by default**, translucent only inside `@supports(backdrop-filter)` AND `@media not (prefers-reduced-transparency: reduce)`. The failure mode is "less pretty," never "unreadable." Engineering, Accessibility, and Design all independently rated this best-practice. The top-only sheen (`inset 0 1px 0 var(--glass-sheen)`) is physically literate.
- **Monastic accent restraint and one calm typeface.** Lexend everywhere, Geist Mono surgically reserved for the cipher, weight-300 headings with a documented tracking law (`globals.css:368-378`), one signal-blue accent as a single point of light, field opacity held to 0.10/0.18 so it reads as atmosphere not wallpaper. The cipher motif (hero name, chat decode beat, wordmark) is coherent authorship.
- **The refraction "wow" is honestly engineered progressive enhancement.** Engine-detected (not feature-queried, because no `@supports` can distinguish Chromium *parsing* `backdrop-filter:url()` from *rendering* it), static SVG filter (fixed seed, rasterizes once), plain-blur fallback everywhere else (`src/hooks/use-refraction-supported.ts`, `signal-glass-filter.tsx`). The Cross-Browser specialist rated this 8.5 — among the best glass implementations audited.
- **Reduced-motion discipline is thorough** (`globals.css:519-528`). Drift keyframes are round-trips (0%==100%) so the freeze lands on the intended base pose; the cipher engine short-circuits to settled text; refraction is gated off. The Vestibular specialist scored this 8.5.
- **The streaming chat engine is built with real production discipline.** `messagesRef` mirror prevents stale-closure appends (`use-hero-chat.ts:28,108`), `AbortController` wired end-to-end with `AbortError` swallowed (`:38,57-58`), `busyRef` guards double-submit, the SSE parser buffers partial lines and distinguishes `[DONE]`/empty/reasoning-only (`:85-121`). Server-side validation is exemplary — role allowlist, char caps, 24-message cap, last-must-be-user (`types.ts:24-43`). Secret handling is correct: `FREELLMAPI_KEY` stays server-side, no XSS, no SSRF.
- **The writing voice is the best single asset on the site.** The manifesto is concrete and quotable ("The work wins the room. Words rarely do." — `manifesto.ts:18`), and the voice is *codified*: the do/don't spec (`manifesto.ts:3-4`) is mirrored into the AI persona (`prompt.ts:15`). The chat micro-copy ("ask me anything — no resume here," `ask-bar.tsx:30`) does positioning, instruction, and personality in seven words. That discipline is rare.

## Top priorities

One ranked, de-duplicated list across all domains.

### 1. Promote the README "Now" facts into the rendered page AND the AI prompt
**Severity: Blocker · Effort: M**
Every hireable fact — the medical-AI tool, Dallas/Toronto remote work, B2C/B2B history, the stack, the Oman move — lives only in `README.md:17-31` and reaches no visitor and not the chat. `prompt.ts:10,16` feeds the persona only `MANIFESTO.paragraphs` + links, so the starter chips "What do you build?" and "Are you available?" (`starters.ts:4-5`) fire questions the AI literally cannot answer truthfully. The manifesto promises "I'd rather show you the thing" (`manifesto.ts:22`) on a site that shows no thing.
**Fix:** add a `STATUS`/availability constant + a `projects`/`now` data source, render a Work/Now block, and thread both into `buildSystemPrompt()`. The writing already exists in README — this is wiring.

### 2. Fix text contrast at the token layer: replace every `text-foreground/30`–`/45` with measured per-theme semantic tiers
**Severity: Blocker · Effort: M**
The only finding that recurs across **three councils** (Design, Accessibility, Engineering). It fails WCAG 1.4.3 on information-bearing copy in both themes — worst in light: `manifesto.tsx:22` (`/40` = 2.27:1), `manifesto.tsx:30` (`/30` = 1.81:1), `connect.tsx:22` (`/55` = 3.33:1); and still fails in the dark showpiece: `hero.tsx:95,124` (`/45` = 4.2:1). Alpha-over-light and alpha-over-dark are not symmetric, so dark-tuned values silently break light (a shipped, reachable state via the toggle).
**Fix:** branch `--text-muted` / `--text-faint` in `:root` and `.dark` to measured ratios (clear 4.5:1, or 3:1 only for genuinely large type), then replace the ad-hoc `/NN` usages. Same discipline already applied correctly to `--brand` — extend it. The `/45`→`/55` delta is imperceptible but moves the dark eyebrow from fail to pass.

### 3. Rework the chat takeover as ONE coordinated change — the single most over-subscribed surface on the site
**Severity: High · Effort: M**
Flagged by **every council**: no `role="dialog"`/`aria-modal`/accessible name, no focus trap, background stays tabbable (`chat-overlay.tsx:65-71`); focus never returns on close (`hero-chat.tsx:31-35`); focus drops to `<body>` mid-stream when the input disables (`chat-overlay.tsx:137` — browsers blur disabled focused elements); no body-scroll lock so the page scrolls behind it on mobile; sub-44px touch targets (send 32px, close 36px); a single `aria-live="polite"` floods the token stream (`:97-119`); and it hard-cuts in/out with zero enter/exit choreography. `CommandMenu` already does this correctly with Radix Dialog (`command-menu.tsx:84-93`) — the pattern exists in-repo.
**Fix (one diff):** rebuild on Radix Dialog → free `role`/`aria-modal`/focus trap/inert background/Esc/focus return + scroll lock. Add a ~300-400ms fade+scale entrance via `--ease-swift` (gated on reduced-motion). Keep the input enabled and guard submits to stop blur-by-disable. Render the stream silently; announce the finished reply once in a dedicated live region; move errors to `role="alert"`. Bump send/close to ≥44px. Let the refraction *form* on the entrance rather than pop.

### 4. Fix the retry duplicate-user-turn bug and key the transcript on stable ids
**Severity: High · Effort: S**
Cross-validated by Engineering and QA as a real, reproducible bug. `handleRetry` (`hero-chat.tsx:39`) calls `send(lastUser.content)`; `send()` unconditionally appends `[...messagesRef.current, {role:'user'}]` (`use-hero-chat.ts:52`) on top of the already-committed failed turn — so one failed send + retry shows the question twice and ships a duplicate upstream. Combined with index keys (`chat-overlay.tsx:99`) + `reset()`-to-empty, React reconciles positionally and can flash a user bubble in an assistant slot.
**Fix:** replay `messagesRef.current` on retry (or add a dedicated `retry()` to the hook); assign an `id` at message creation and key on it.

### 5. Same-origin guard on `/api/chat` + server and client timeouts
**Severity: High · Effort: S**
Two findings on the one endpoint that is both the product and the cost center. `src/app/api` has zero `Origin`/`Sec-Fetch-Site` checking, so anyone who finds the endpoint can stream completions against your paid `FREELLMAPI_KEY` (the only brake is a per-IP limiter that collapses to a shared `"anon"` bucket when `cf-connecting-ip` is absent — `rate-limit.ts:6`). Separately, `route.ts:29` and `use-hero-chat.ts:85` have no timeout, so a 200-then-stall upstream pins the worker and spins `CipherLoader` forever.
**Fix:** reject when `Sec-Fetch-Site` is not same-origin/same-site (fallback: validate `Origin` against `SITE.url` host); wrap the upstream fetch in `AbortSignal.timeout(...)`; add a client inactivity watchdog that aborts to `error='signal_dropped'`.

### 6. Ship the missing `og.png` + `robots.ts` + `sitemap.ts`
**Severity: High · Effort: S**
`/og.png` is referenced in `og:image`, `twitter:image`, and Person JSON-LD but does not exist in `public/` (confirmed) — every LinkedIn/X/Slack/iMessage unfurl and Google image enrichment 404s at the moment of a share. There is no `robots.ts` and no `sitemap.ts` anywhere — zero declared crawl policy (and on Cloudflare Workers there's no implicit default).
**Fix:** ship a 1200×630 `public/og.png` (or an `app/opengraph-image.tsx` via `next/og`); add `app/robots.ts` (allow all, disallow `/ds` + `/api`, point to sitemap) and `app/sitemap.ts`.

### 7. Fix the scrambled-H1: real name as text source of truth, cipher as `aria-hidden` overlay
**Severity: High · Effort: S**
A rare **four-domain win** (SEO + AIO + Accessibility + Design). The homepage H1 — your own name — renders as deterministic scrambled glyphs in server/no-JS HTML (`hero.tsx:109-114`, `use-cipher-animation` `seededChar`) with no `sr-only` fallback. Crawlers snapshot a garbage headline; screen readers announce "Soheil F@k0ur."
**Fix:** put the literal name as the text source of truth (`sr-only` span or seed initial display with real characters) and animate a decorative `aria-hidden` overlay. Zero visual cost.

### 8. Fix the glass sheen inversion in light mode
**Severity: High · Effort: S**
The `.glass-edge` top-inner sheen is `color-mix(--foreground 6-8%)` in **both** themes (`globals.css:306,452`). In dark that's a near-white catch (correct); in light `--foreground` is dark ink, so the same rule paints a **dark smudge** along the top edge — the physical opposite of a glass highlight, on every glass-edge surface on paper. For a system whose pitch is physically-literate glass, a sheen that inverts is a material-credibility bug.
**Fix (one line):** derive the sheen from white in both themes (`color-mix(in oklch, white 60%, transparent)`); keep the rim foreground-derived.

### 9. Single-source the identity layer to kill role/tagline/jobTitle/handle/domain drift
**Severity: High · Effort: S**
Your most-repeated phrase — the role definition — contradicts itself: "Frontend Engineer × Product Curator" (`hero.tsx:96-103`) vs "...and..." (`manifesto.ts:14`, `constants.ts:9`); tagline casing splits sentence vs title case (`hero.tsx:125` vs `constants.ts:7`); JSON-LD `jobTitle` is the unrelated "Developer & Creative Technologist" (`json-ld.tsx:13`); `twitter:creator` `@soheilfakour` mismatches the `/Thatssoheil` link; `SITE.url` (`.com`) contradicts the deployed `.website`. A recruiter cross-checking surfaces sees four different people.
**Fix:** pick one canonical role string and tagline casing; derive every surface (incl. `jobTitle`, keywords, `twitter:creator`, `metadataBase`) from one constant the way `SOCIALS` already feeds `sameAs`. Drop the unsupported "WebGPU"/"creative technologist" keywords.

### 10. Give the field a focusing frame and feed the glass something to refract
**Severity: High · Effort: M**
The field reads as edge-to-edge ambient wash, not composed light. The carefully-authored inward vignette `--gradient-hero` (`globals.css:319-327`) is **orphaned** — only a `/ds` swatch (`ds/page.tsx:607`), never applied to the live hero. And the refraction warps a near-uniform near-black backdrop (60px field blur + 8px filter blur = nothing with edges to bend), so the most expensive asset lenses near-nothing — the `/ds` demo had to inject its own 0.5-opacity gradient to make the effect legible (a direct admission).
**Fix:** wire `--gradient-hero` (or a radial mask) onto `.signal-field` for directed light; behind chrome/takeover *only* (no reading content), add a brighter edge-structured field layer and drop the SVG's internal `feGaussianBlur` to ~2-3px so the refraction finally has structure to bend — without touching body-text contrast.

### 11. Pause the field when occluded; gate it to in-view/visible
**Severity: Medium · Effort: S**
Two performance specialists independently found the same mechanism: three `blur(60px)` blobs animating `scale()` (`globals.css:484-516`) force every `backdrop-filter` surface to re-rasterize each frame for the page's lifetime — and they keep running *fully occluded* behind the takeover while *also* feeding the refraction backdrop (the heaviest composite on the site, in the open-click INP window). This is free money, not a wow-vs-perf tradeoff.
**Fix:** `animation-play-state: paused` on `.signal-field__blob` when the overlay is open; `IntersectionObserver` + Page Visibility pause; prefer translate-only over `scale()` to avoid re-rasterizing the blur kernel.

### 12. Reconcile the design system with the product
**Severity: Medium · Effort: M**
`/ds` advertises a 25-utility composite type system and a Card glass variant that the live sections consume **nowhere** — they hand-roll glass divs and ad-hoc `clamp()` + `font-light`. For a portfolio selling system rigor, the showcase and the product diverging *is* the defect. Also: `--font-mono` is aliased to Lexend (`globals.css:10`), so every "mono" eyebrow renders proportional and `code`/`pre`/`kbd` + the `-mono` ramps lie about their output.
**Fix:** route manifesto/connect panels through the `Card` glass variant (one source of truth); migrate section type onto the ramp steps the site actually uses and trim the rest; give eyebrows an honest `text-eyebrow` `@utility`; point `code`/`pre`/`kbd` + `-mono` ramps at real Geist Mono (already loaded as `--font-cipher`).

### 13. Add the safety net: tests, error boundary, security headers
**Severity: Medium · Effort: M**
Zero automated coverage on a stateful streaming chat with branching error/retry/abort logic — exactly where bugs #4 and the 24-message-cap dead-end live. No `app/error.tsx`/`global-error.tsx` (a thrown render drops the visitor to Next's bare screen — the worst failure for a craft portfolio). No HTTP security headers anywhere (`public/_headers` sets only `Cache-Control`). And the `lint` script is broken: `next lint` mis-parses under Next 16 (`package.json:9`).
**Fix:** switch lint to `eslint .`, add `typecheck: tsc --noEmit`; add Vitest tests for `parseChatRequest`, the SSE delta parser, and retry/abort transitions; add a branded `app/error.tsx` with `reset()`; ship a `_headers` CSP block (hash the two inline scripts), `frame-ancestors 'none'`, HSTS, `Referrer-Policy`, `nosniff`.

### 14. Fix the Firefox<113/Safari16 glass fail-closed bug
**Severity: Medium · Effort: S**
`not (prefers-reduced-transparency: reduce)` evaluates *false* on engines that don't *parse* the feature, so glass silently renders **solid** for users who set no preference on the older Firefox/Safari tail — the opposite of the comment's stated intent (`globals.css:409`).
**Fix:** invert to fail-open — put translucent declarations unconditionally inside `@supports`, then add a separate `@media (prefers-reduced-transparency: reduce) { …solid… }` override. At minimum, correct the comment (it currently asserts the opposite of the real cascade).

### 15. Disclose the third-party LLM relay
**Severity: Medium · Effort: S**
Every visitor's free-text is relayed to `agent.thatssoheil.website` with no notice (GDPR Art. 13), and Worker observability is on (`wrangler.jsonc`).
**Fix:** one line of chat microcopy ("AI-generated; messages are sent to a third-party model, not stored — don't share sensitive info") + a short footer privacy note; confirm/scope observability so chat bodies are never logged.

### 16. Reconcile the lowercase voice across command menu + starters
**Severity: Low · Effort: S**
The command menu speaks Title/Sentence-case ("Jump to a section…", "Copy email address") while the chat is deliberately all-lowercase — two authors in one product. Lowercase the menu strings + starter chips; fix "Copy email address" → "Copy email"/"Copied" (kills the redundant "to clipboard" and the row width-jump). Swap the bare `↑`/`✕` Unicode glyphs for lucide `ArrowUp`/`X`.

## Debates the council had

The councils genuinely disagreed in places. Here's how each was resolved.

- **Wow vs. legibility — should the field be pushed brighter?** Liquid-Glass and Visual Design wanted a louder field so the glass/refraction have structure to bend; Color and Typography pulled the other way (panels already risk AA failures). **Resolved by separating the field's two jobs:** behind *reading* content (manifesto/connect), keep it quiet and fix contrast at the token layer instead — never buy wow with legibility. Behind *chrome and the takeover* (no long-form reading), push it brighter. One accent family, more luminance range, not a second hue.

- **Field motion vs. performance.** Motion + Perf specialists flagged the always-on blurred blobs as the dominant steady-state cost; the Liquid-Glass specialist wanted the lens to *breathe*. **Both are right and don't conflict:** pause the occluded field while the takeover is open (free quality + battery), switch blobs to translate-only, *then* add a whisper-quiet long-period `feTurbulence` wobble to the lens — active only when the takeover is open and reduced-motion is off. Living glass where it matters, static and cheap everywhere else.

- **Refraction is Chromium-only and gates on reduced-MOTION — correct or a category error?** The React specialist noted the filter is static, so reduced-*transparency* (already checked) is the right signal. **Resolved: keep the reduced-motion gate** — the field *behind* the lens is moving, so the refraction animates the user's view of moving content. Pause the field behind the takeover (above) and the lens becomes genuinely static; add a one-line comment justifying the gate so a future maintainer doesn't "fix" it away.

- **Firefox glass: fail-open or fail-closed?** The CSS specialist praised the `not(...)` negation as "subtle and correct"; the Cross-Browser specialist proved it drops glass on the older Firefox/Safari tail. **The Cross-Browser specialist is correct** — `not (unknown)` is false. Modern Firefox gets glass because it now *supports* the feature, not because the negation rescues it. → Priority #14.

- **`font-mono` semantics — rebind or rename?** **Resolved both ways by use:** the eyebrows are a typographic *register* (tracked uppercase Lexend), not monospace — give them an honest `text-eyebrow` utility. But `code`/`pre`/`kbd` + the `-mono` ramps should point at *real* Geist Mono (already loaded). The current middle state — calling Lexend "mono" — is the worst of both.

- **Non-modal takeover — deliberate design or defect?** The code comment calls it "non-modal by design"; QA initially rated scroll-through low. **Escalated to high** by Accessibility, Engineering, and Design jointly: a full-viewport layer that signals modality to sighted users while leaving the background tabbable/scrollable is indistinguishable from a bug. The non-modal stance is an artifact of hand-rolling, not a product requirement. → Priority #3.

- **"no resume here" — brand bravado vs. recruiter conversion.** Copywriters love the line; the Hiring-Manager lens says it costs interviews. **Resolved: keep the line** (it's genuinely excellent) — but "no resume" must mean "a *better*-than-resume experience," not "no facts." Fix the substance gap first (#1); then optionally add a quiet "prefer the resume?" escape hatch so the bravado is a choice, not a dead end.

## By domain

### Design & Experience (chair: 7)
The taste is already here; what's missing is the **art direction of moments**. The glass system, accent restraint, cipher motif, and reduced-motion handling are real, senior craft. But the vignette that would focus the field is orphaned (`--gradient-hero`, #10), the refraction lenses a near-empty backdrop and never stages, the sheen inverts in light mode (#8), the three sections are near-identical centered glass cards (rhythmically flat), and the composite type system + Card glass live only in the showcase (#12). Fix the five design priorities and this becomes the award-stage 8-9 the system is clearly reaching for.

### Engineering (chair: 7.7 — "ship after the two chat-layer fixes")
Genuinely senior React 19 / Next 16 RSC work — server/client boundaries idiomatic, SSR-safe `useSyncExternalStore`, correct abort-aware SSE reader, honestly-engineered refraction. The defects cluster precisely in the most visible interaction: the takeover is modal-in-look/non-modal-in-behavior (#3), retry duplicates the user turn (#4), index keys (#4). The token architecture is a real three-tier system but under-delivers its "swap six values to retheme" promise (`--field-blob-b` is a raw oklch literal duplicated 3×; ~24 sites bind `var(--signal-500)` past the semantic layer). Strong work, conditional ship, small conditions.

### Accessibility (chair: 6.4 — "conditional pass on architecture, fail on conformance")
One of the more a11y-literate liquid-glass builds reviewed: solid-by-default glass, disciplined `aria-hidden` on decorative layers, near-best-in-class landmarks/skip-link/focus-ring, reduced-motion honored at the semantic layer. **The glass is genuinely not the liability.** But it's not WCAG 2.2 AA conformant today, and the failures are concentrated: the hand-rolled takeover (no dialog semantics/trap/inert/focus-return, focus-dropping disabled input, flooding live region — #3), a primary H1 with no stable accessible name (#7), and a low-opacity text scale that fails 1.4.3 in both themes, catastrophically in light (#2). Roughly two-thirds collapse into the single Radix-Dialog rewrite the codebase already demonstrates it can do.

### Content & Growth (chair: 5.4 — "excellent voice, hollow content system")
The hardest, rarest thing is already done: a codified, disciplined, quotable voice propagated consistently into the AI persona (`manifesto.ts:3-4` → `prompt.ts:15`). But the site commits the one unforgivable portfolio sin — it argues without showing — and the proof sits one file away in `README.md` (#1). Compounded by a half-built machine-readability layer (no `og.png`, no robots/sitemap — #6; scrambled H1 — #7) and identity drift across four surfaces (#9). The path from 6 to 9 is unusually short because it's mostly *wiring, not writing*.

### Quality, Risk & Platform (chair: 6.8 — "strong craft, contained risk, missing safety net")
The rare personal site whose core engine is built with production discipline — correct abort/stale-closure handling, honest error-state machine, robust validation, no XSS/SSRF. But it ships that engine with no tests, no error boundary, no timeout, no security headers, no origin guard, no privacy disclosure (#5, #13, #15). None are exploitable holes today; they're resilience gaps that turn ordinary failures (a hung upstream, a long conversation, a retry, a curl from another origin) into user-visible breakage or an avoidable bill. No architectural debt — just unfinished hardening.

## Roadmap

### Now (unblock the site's purpose + stop correctness bugs — this sprint)
1. **Promote README facts → page + prompt** (#1, Blocker, M) — the site can't do its job without this.
2. **Contrast token tiers** (#2, Blocker, M) — three-council root cause; fix once at the palette.
3. **Retry duplicate-turn + stable keys** (#4, High, S) — real bug in the most-watched component.
4. **`/api/chat` origin guard + timeouts** (#5, High, S) — protect the cost center and the spinner.
5. **`og.png` + robots + sitemap** (#6, High, S) — every share is currently brand-blank.
6. **Scrambled-H1 fix** (#7, High, S) — four-domain win, zero visual cost.
7. **Sheen inversion** (#8, High, S) — one-line material-credibility fix.
8. **Single-source identity** (#9, High, S) — stop the four-different-people problem.

### Next (the centerpiece + the substrate — following sprint)
9. **Chat takeover Radix-Dialog rework** (#3, High, M) — one coordinated diff resolving Design/Eng/A11y/QA findings: dialog semantics + focus trap/return + scroll lock + 44px targets + enter/exit choreography + clean live regions + no blur-by-disable.
10. **Focusing frame + fed refraction** (#10, High, M) — wire `--gradient-hero`; intensify the field behind chrome only so the wow finally reads.
11. **Pause field when occluded / in-view gating** (#11, Medium, S) — free perf, ships alongside #9.

### Later (system rigor, hardening, polish)
12. **DS ↔ product reconciliation** (#12, Medium, M) — route panels through Card glass, trim the type ramp, fix the `font-mono` lie.
13. **Safety net: tests + error boundary + security headers + fix lint** (#13, Medium, M).
14. **Firefox/Safari glass fail-open** (#14, Medium, S) + correct the misleading comment.
15. **LLM-relay privacy disclosure** (#15, Medium, S).
16. **Voice reconciliation + icon swaps** (#16, Low, S).

The taste is not in question, Soheil. Fix the Now-bucket blockers and the site finally *says* what it's built to say; land the Next bucket and the craft gets the staging it deserves. This is a strong 7 reaching for a 9 — and the gap is finishing, not invention.