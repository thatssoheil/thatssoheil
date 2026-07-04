---
date: 2026-06-29
topic: Signal Glass design system — current state & gap analysis
branch: feat/signal-glass
method: 20-person product/design/UI-UX-eng council (draft → cross-talk → synthesis)
source-of: docs/superpowers/specs/2026-06-29-signal-glass-design.md
---

# Signal Glass — Design System: Current State & Gap Analysis

*Prepared by the Design Systems Lead, synthesizing 20 specialist audits + cross-disciplinary council reactions. All claims verified against code; file:line preserved.*

---

## 1. The current design system

A single-author, code-first system living almost entirely in **`src/app/globals.css`** (554 lines, ~164 custom properties) with a React showcase at **`src/app/ds/page.tsx`** (779 lines). No JS config, no token-export pipeline, no Figma source. Tailwind v4 consumes `globals.css` directly via `@tailwindcss/postcss`.

### Foundations / Tokens
A deliberate 3-tier structure:
- **Tier 1 — primitives** (theme-independent `:root`, globals.css:121-168): neutral ramp `--ink-50..950` (true neutral, `oklch(L 0 0)`, :123-134); accent ramp `--signal-200..700` (iMessage-blue, hue ~250-258, :139-144); motion eases/durations (:147-155); two-layer focus ring `--ring-focus` (:160); z-scale `--z-*` (:163-167).
- **Tier 2 — semantic, per-theme**: light `:root` (:171-262) + dark `.dark` (:265-349) map `--background/foreground/card/popover/primary/secondary/muted/accent/destructive/border/input/ring` plus brand additions `--brand`, `--text-muted`, `--text-faint`, the `--glass-*` set, `--alpha-100..600`, `--field-*`, shadows, gradients.
- **Tier 3 — Tailwind-facing** (`@theme inline`, :8-118): re-exports semantics as `--color-*`, declares `--radius-sm..4xl` (calc-derived from one `--radius`), a full `--spacing-*` scale, the static `--text-*` scale, and fluid `--text-fluid-*` clamps.

The retheme contract is stated at globals.css:136-138: *"Swap these six `--signal-*` values to retheme the accent; everything else points here."*

### Color & Theming
Mono-accent identity: one signal hue, deployed as fills via `--primary`/`--ring` (= signal-500) and as legible text via `--brand` (signal-700 light / signal-400 dark). De-emphasis tiers `--text-muted`/`--text-faint` carry comment-asserted AA ratios (:216-219, 306-309). Only one status hue beyond neutral+signal: `--destructive`. A neutral alpha ramp (`--alpha-100..600`) feeds `--border`/`--input` so hairlines read identically over any surface (:197-206). Dark is the shipped default (`defaultTheme="dark"`); a complete light theme is tokenized but unexercised in product.

### Typography
Two webfonts (layout.tsx): **Lexend** (`--font-lexend`) and **Geist Mono** (exposed only as `--font-cipher`). `@theme` aliases **both** `--font-sans` AND `--font-mono` to Lexend (globals.css:10-11) — there is no real monospace in the type system; `code/pre/kbd` render proportional (:368). Four composite `@utility` ramp families exist (`text-heading-14..72` at weight 300 with a negative-tracking law, `text-copy-13..24`, `text-label-12..20`, `text-button-12..16`, each with `-mono` twins, :385-420), plus fluid clamp ramps (:29-34).

### Spacing / Grid / Radius
`--spacing-*` (:84-117) and `--text-*` (:14-23) verbatim-restate Tailwind v4 defaults. Radius is one base `--radius` (10px) with a 7-step calc ramp (:75-81). **No** breakpoint/container tokens, **no** Container/Stack/Grid/Section primitives — the page gutter `px-6 sm:px-8 md:px-12 lg:px-16` is copy-pasted across 6 files (header, footer, manifesto, connect, loading, ds).

### Material — the glass system (the namesake)
`@layer components` (:432-483): composable `.glass` (translucent chrome), `.glass-panel` (near-solid reading surface), `.glass-strong` (deep blur, no own background), `.glass-edge` (rim + top sheen + drop), `.glass-refract` (Chromium-only feDisplacementMap). **Solid by default**; translucency only inside `@supports(backdrop-filter)` AND `@media not (prefers-reduced-transparency: reduce)` (:436-437). Sheen is white-derived to avoid a dark smudge on paper. Refraction is JS engine-gated (use-refraction-supported.ts) and rendered only at chat-open.

### The living field
`SignalField` (signal-field.tsx) mounts once in the app shell (layout.tsx:123): three fixed, full-viewport radial blobs, `blur(60px)`, transform-only drift (38s/46s/54s, globals.css:507-519), reduced-motion freeze via 0%==100% keyframes. This is the substrate the glass refracts.

### Motion
One ease family (`--ease-signature/snap/swift`) × four durations (`--dur-micro/ui/page/grand`, :147-155). GSAP pipeline (lib/gsap.ts, use-motion.ts) with a clean `matchMedia` reduced-motion gate and a `MOTION_EASE = "power2.out"` constant (lib/motion.ts:12). A global reduced-motion CSS clamp (:535-544). Cipher engine (matrix/cipher-engine.ts) is a pure, RNG-injectable state machine.

### Components & APIs
Exactly four primitives in `src/components/ui/`: `button.tsx` (CVA, 6 variants × 8 sizes), `badge.tsx` (CVA, 6 variants), `card.tsx` (compound + a boolean `glass` prop, :17), `separator.tsx`. No barrel/index. No Input/Field/Dialog/Tooltip/Spinner/IconButton/Chip. The product's chat surfaces (hero/*) are hand-assembled from raw Tailwind.

### Interaction states
**Focus** is the only systematized state (`--ring-focus` token, applied across primitives + chrome). Hover/active/disabled/selected/loading are improvised per file. Loading exists only as the bespoke `CipherLoader`; error only as a 2-entry map in chat-overlay.tsx:22-25.

### Patterns
None documented. `/ds` shows isolated resting atoms; no flow/pattern coverage of the product's actual ask→stream→reply→retry loop, the panel, the chip families, or the takeover.

### Accessibility
Strong: solid-by-default glass, reduced-motion + reduced-transparency gating, `lang="en"`, skip-to-content, landmarks, sr-only on cipher, 44px touch rows in the command menu. Gaps: **zero** forced-colors/prefers-contrast handling (globals.css), chat overlay is non-modal with no focus trap (chat-overlay.tsx:29), streamed reply sits under a single `aria-live="polite"` (chat-overlay.tsx:96).

### Documentation / Governance
`/ds` is the only human-facing doc; it **hand-mirrors** globals.css (ds/page.tsx:23) and has already drifted (labels Lexend as "Geist Sans/Mono"). The design spec (docs/superpowers/specs/2026-06-29-signal-glass-design.md) is "Approved (design)" with P0-P3 phases and no completion ledger. `eslint.config.mjs` is stock Next.js (12 lines) — **no machine-enforced governance** of any kind. `docs/adr/` is an empty `.gitkeep`; the `CONTEXT.md` the docs promise does not exist.

---

## 2. Maturity scorecard

| Dimension | /10 | Verdict |
|---|---|---|
| Foundations / tokens | 7 | Well-tiered, single-file, clean indirection — but retheme contract is partly false. |
| Color & theming | 6 | Disciplined mono-accent + AA-aware tiers; primitives leak past semantics; light theme unexercised. |
| Typography | 4 | Flagship ramps have **0** product adoption; `--font-mono` is Lexend (a lie); docs misname the face. |
| Spacing / grid / radius | 4 | Scales largely duplicate Tailwind defaults; no layout primitives; gutter copy-pasted ×6. |
| Material (glass) | 6 | Genuinely distinctive and a11y-correct; no component API, single elevation, flat rim, no states. |
| Living field | 5 | Beautiful and reduced-motion-correct; expensive, untokenized, re-sampled behind all chrome. |
| Motion | 4 | Tokens declared, referenced **0** times; reveal machinery only wired to /ds; two ease vocabularies. |
| Components & APIs | 4 | 4 primitives, ~1 product consumer; no Input/Dialog/IconButton; no barrel. |
| Interaction states | 4 | Only focus is systematized; loading/error/disabled improvised; disabled opacity inconsistent. |
| Accessibility | 6 | Strong motion/transparency posture; no forced-colors, non-modal takeover, live-region churn. |
| Documentation / governance | 3 | Hand-mirrored docs that already lie; no lint, no tests, no changelog, empty ADRs. |

**Overall maturity: 4.7 / 10 — "a beautiful theme, not yet a system."** The foundations are above-average for a solo project; the failure is **adoption and governance** — the product is built *beside* the system, not *from* it, and nothing prevents that.

---

## 3. Gaps, flaws, insufficiencies & inadequacies — ranked master list

> De-duplicated across all 20 lenses. The Head-of-Product/DS-Engineer correction on the opacity finding is incorporated: it is **targeted (chat + chrome + the showcase page itself), not system-wide** — verified 12 raw uses in components vs **65 on /ds** vs 10 semantic-tier uses.

### BLOCKERS

**1. The core product (AI chat) is built entirely outside the system** · *Gap* · **Blocker** · effort **L**
The headline feature uses no DS components or semantic tokens. `ask-bar.tsx:26-40` and `chat-overlay.tsx:129-148` are near-identical hand-rolled glass inputs; the signal send button is duplicated verbatim (`bg-[var(--signal-500)] text-[var(--ink-50)] …hover:scale-105 active:scale-95`, ask-bar.tsx:37 ≡ chat-overlay.tsx:144); the user bubble is a one-off color-mix (chat-message.tsx:13). No `Input`/`Field`/`ChatBubble`/`Dialog` primitive exists. **Fix:** extract `Input/Field`, `IconButton`/send, `ChatBubble`, and a real `Overlay/Dialog` (with focus trap + `aria-modal`) into `ui/`, backed by semantic tokens; document the ask→stream→reply→retry loop as the first /ds pattern.

**2. Adoption collapse — the flagship layers have ~zero product consumers** · *Flaw* · **Blocker** · effort **L**
Verified: composite type ramps used **0** times in product; motion tokens (`var(--ease-*)`/`var(--dur-*)`) referenced **0** times outside globals/ds; `<Button>` in exactly **1** product file (connect.tsx); `<Card>` / the `glass` prop used in **0** product files. This is one disease in many organs. **Fix:** per defined-but-unused system, make an explicit *keep-or-kill* decision; migrate survivors into product and lint-forbid the bypass, delete the rest from globals.css + /ds.

### HIGH

**3. `--font-mono` resolves to Lexend (proportional); docs claim "Geist Mono"** · *Flaw* · **High** · effort **S**
globals.css:11 aliases `--font-mono → --font-lexend`; `code/pre/kbd` @apply `font-mono` (:368); all `-mono` ramps and ~61 `font-mono` sites render proportional. Geist Mono is loaded but reachable only as `--font-cipher` via arbitrary `[font-family:…]`. /ds titles the section "Geist Sans + Geist Mono." **Highest-consensus factual defect (8 specialists).** **Fix:** point `--font-mono` (or at least the `-mono` ramps + `code/pre/kbd`) at Geist Mono and register `--font-cipher` in `@theme`, *or* rename the role honestly; correct /ds either way.

**4. No machine-enforced governance — drift is the default** · *Gap* · **High** · effort **S**
`eslint.config.mjs` is stock; no stylelint; no test suite; no token-coverage check. Every leak below passed CI green. **Fix:** add `no-restricted-syntax` banning raw hex/oklch, arbitrary `text-[…rem]`, `text-foreground/[0-9]`, and bare `var(--signal-*)/var(--ink-*)` in `src/components`; add a CI assertion that every token named in /ds resolves in globals.css (this alone would have failed on the Geist/Lexend lie).

**5. No state/async-pattern coverage — fatal for an AI-chat product** · *Gap* · **High** · effort **M**
`use-hero-chat.ts` models idle/decoding/streaming/error/signal_dropped/rate_limited — those states *are* the product — yet /ds documents none; error copy is a one-off map; there is no `Spinner`, no `aria-busy`, no Button `loading`, no shared empty pattern. **Fix:** add a `States` section + reusable loading/error/empty primitives; lift the error-copy map and CipherLoader out of chat-overlay.

**6. The retheme contract is provably false** · *Flaw* · **High** · effort **S**
"Swap six `--signal-*` values" (globals.css:137) is broken by: `--shadow-glow` hardcoding `rgba(10, 132, 255, …)` in both themes (:250, :334); `--field-blob-b` raw teal `oklch(… 210)` (:243, :327); and 14 raw `var(--signal-*)/var(--ink-*)` refs in component className. **Fix:** derive `--shadow-glow` via `color-mix(in oklch, var(--signal-500) …)`, promote the teal to a named `--signal-alt`/`--field-accent`, route component accent through `--primary`/`--brand`/`--ring`.

**7. De-emphasis tiers bypassed on the chat + chrome + the showcase itself** · *Inadequacy* · **High** · effort **M**
`--text-muted`/`--text-faint` were built as "measured-AA replacements for text-foreground/NN" (:216) yet are used 10× in components while raw `text-foreground/NN` appears **12× in components and 65× on /ds**. Unmeasured contrast over the moving field. *(Scope: targeted, not system-wide — static product sections already adopt the tiers.)* **Fix:** migrate chat/chrome + the /ds page to the tiers; lint-ban `text-foreground/[0-9]` for text.

**8. No forced-colors / high-contrast accommodation** · *Gap* · **High** · effort **M**
Zero `forced-colors`/`prefers-contrast` rules in globals.css. Shadow-based focus rings, glass rims, and the active-nav underline vanish under Windows HCM, leaving keyboard users no visible focus. **Fix:** add `@media (forced-colors: active)` (outline-based focus via `CanvasText`/`Highlight`, solid borders on glass) and a `prefers-contrast: more` branch lifting the text tiers + panel opacity.

### MEDIUM

**9. Glass has no component API; applied inline at 3 different radii** · *Insufficiency* · **Medium** · effort **M**
`<Card glass>` (card.tsx:17) is never used; every surface hand-writes the classes at `rounded-2xl` (ask-bar:26), `rounded-3xl` (manifesto/connect:13), `rounded-xl` (command-menu:89); header even forks `.glass-edge` into a raw `border-b border-[color:var(--glass-rim)]` (header.tsx:34). **Fix:** a single `<Surface/GlassPanel variant>` (or CVA `glassVariants`) encoding the sanctioned combos + a radius law; route all glass through it; give `.glass-edge` a directional option so the header can compose it.

**10. Two (really three) divergent focus systems** · *Flaw* · **Medium** · effort **S**
Global `:focus-visible { outline … }` (globals.css:548) + per-component `shadow-[var(--ring-focus)]` + the inputs' bespoke `focus-within` signal glow (ask-bar:26 ≡ chat-overlay:129) + skip-link `focus:ring-2`. New focusable elements silently get the *wrong* one. **Fix:** make `--ring-focus` the global `:focus-visible` default; fold the input glow into a `--ring-input-glow` token.

**11. No state token tier; disabled is inconsistent** · *Gap* · **Medium** · effort **M**
Hover/active/disabled are magic alphas; disabled is `opacity-40` (chat-overlay:144) vs `opacity-50` (button.tsx:8, chat-overlay:138) in one file. **Fix:** add `--state-hover/-active/-selected` + `--disabled-opacity`; drive primitives from them; wire transitions to the existing `--dur-*`/`--ease-*`.

**12. Chat overlay is a non-modal full-viewport takeover** · *Flaw* · **Medium** · effort **M**
No `aria-modal`/`role=dialog`/focus trap (chat-overlay.tsx:29); the streamed reply sits under one `aria-live="polite"` (:96) → re-announcement churn. Background stays scrollable/tabbable behind the product's primary surface. **Fix:** make it a true modal (reuse the command-menu's Radix Dialog), `inert` the background, and replace blanket polite-live with `aria-busy` during stream + a single "reply ready" on settle.

**13. No mobile/low-power degradation path for glass + field** · *Gap* · **Medium** · effort **M**
`--glass-blur` is constant 16/32px; field blobs are `blur(60px)` on 60vmax; the always-animating field is re-sampled behind every fixed `.glass` surface (steady-state GPU cost). Degradation gates only on a11y prefs, never device tier. `useCoarsePointer` exists but is unused by the material. **Fix:** reduce blur at `≤40rem` + coarse-pointer; pause the field when no glass overlaps / tab idle / refraction open; tokenize `--field-blur`; add a per-surface glass budget.

**14. No on-screen-keyboard / visualViewport handling for the chat input** · *Gap* · **Medium** · effort **M**
Bottom-pinned reply input on a `fixed inset-0` layer (chat-overlay.tsx:67/129) with zero `visualViewport`/keyboard-inset handling and no `env(safe-area-inset-*)`. On phones the soft keyboard can cover the product's primary affordance. **Fix:** honor `visualViewport` + safe-area insets on the input row and header.

**15. No layout primitives; gutter contract copy-pasted ×6** · *Gap* · **Medium** · effort **M**
No Container/Section/Stack/Grid; vertical rhythm is three uncoordinated scales (`py-24` vs `py-20`, `gap-8` vs `gap-20`, panel `p-8/12/16`); inner section min-height is duplicated. **Fix:** ship `Container/Section/Stack`, tokenize `--space-gutter/-section/-panel` + `--container-prose/-page`, route all surfaces through them.

**16. The persona has no scope/decline copy contract** · *Gap* · **Medium** · effort **S**
A public, unauthenticated first-person AI standing in for a real named person (prompt.ts) seeded by 4 starter prompts has **no** governed refusal/off-topic template. **Fix:** add an explicit decline register + out-of-scope template to the prompt and the voice charter.

**17. No single source of truth for voice; casing splits inside the chat** · *Flaw* · **Medium** · effort **M**
Voice rules re-typed (and already divergent) across manifesto.ts:3, now.ts:5, prompt.ts:22, /ds:733; capitalized starters (starters.ts) land in an all-lowercase overlay; error classes the server emits (`forbidden`, `bad_request`) collapse into a misleading "signal dropped — try again." **Fix:** one `voice.ts` charter (register-per-surface + casing + complete error-copy table) that prompt.ts and /ds both derive from.

### LOW

**18. /ds hand-mirrors globals.css (drift guaranteed)** · *Flaw* · **Low** · effort **M** — generate the token tables from source (or back with the coverage test in #4); generalize the existing `TokenValue` live-reader (token-value.tsx, used in 1 place) to every table.

**19. `--spacing-*` / `--text-*` verbatim-duplicate Tailwind defaults** · *Inadequacy* · **Low** · effort **S** — keep only deliberate deviations (or document why pinned); add genuine semantic spacing tokens instead.

**20. Glass material is single-elevation with a flat rim** · *Inadequacy* · **Low** · effort **M** — `.glass-edge` is one top-edge `inset 0 1px` hairline that reads square on rounded-3xl panels; refraction blur (8px) is decoupled from `--glass-blur` (16px). *Right-size, don't enrich* — defer elevation tiers/grain/tint until a surface needs them.

**21. Brand-blue diverges across logo / favicon / OG** · *Flaw* · **Low** · effort **S** — logo.tsx uses `var(--signal-500)`, favicon hardcodes `#0A84FF`, OG hardcodes `#5aa2ff`; OG uses generic `sans-serif`, not Lexend. Unify on one computed hex; embed LogoMark + Lexend in the OG.

**22. Raw Unicode glyphs as icons; no Icon primitive** · *Gap* · **Low** · effort **S** — `↑`/`✕` (ask-bar:39, chat-overlay:90/146) render in Lexend, optically mismatching 1.5-stroke lucide; brand-icons silently swallow `strokeWidth`. Add an `Icon` primitive (fixed stroke, size ramp, namespaced line-vs-filled).

---

## 4. Where the council disagreed

- **The opacity-text finding's magnitude.** Several drafts claimed "~77 ad-hoc opacity values; the tiers never replaced anything." The Head of Product and DS Engineer walked this back on verification: **65 of ~77 live on the /ds showcase page itself**; static product sections *do* adopt the tiers; the real offenders are the chat + header/footer chrome. **Weight fell to: targeted fix, not a system-wide failure** — and ironically the showcase page is the worst offender. *(Confirmed: 12 in components, 65 on /ds, 10 tier uses.)*

- **Migrate the type ramps vs delete them.** Typography/Visual/DS-Engineer wanted full migration onto ~40 ramps. The Head of Product argued ~40 bespoke ramps over-engineer a 3-section site and encode the same font-mono lie — *mostly delete, keep a thin set*. **Weight fell to: keep-or-kill per ramp, lean toward a small adopted subset** — both camps agree the status quo (defined, unused) is the worst outcome.

- **Enrich the glass vs right-size it.** The Liquid-Glass Specialist wanted elevation scales, tinted glass, grain, chromatic aberration, a true rim model. Head of Product, Senior Product Designer, Visual, DS-PM, and the Performance Engineer pushed back hard, citing the spec's own research (Apple walked translucency back; Linear rejected refraction for text). **Weight fell decisively to: build the *API* and a perf budget first; defer enrichment until a surface earns it.**

- **DTCG token pipeline / Figma Code Connect.** The Tooling Engineer rated these high, then **downgraded their own finding** in reaction: a single-author, single-consumer, no-Figma repo doesn't need a round-trip. **Weight fell to: defer the pipeline; the cheap, high-value version is the orphan-token + coverage test.**

- **Light theme: ship-and-test vs scope-as-planned.** **Weight fell to: label it "planned, not shipped"** rather than invest in proving parity for a deliberately dark-default product — but fix the retheme-fragility (#6) that would break it.

- **Versioning/changelog severity.** Design Ops rated it high; the Component API Architect called it premature ceremony for N=1 consumer. **Weight fell to: low — the real governance gap is the lint gate, not release management.**

- **Spacing-default duplication.** Universally agreed to be low/noise; flagged only to keep it from competing with load-bearing flaws.

---

## 5. The biggest systemic risks

These are the gaps that most determine whether Signal Glass is a *system* or a *pretty theme*:

1. **The product doesn't consume its own system (#1 + #2).** A design system whose flagship type ramps, motion tokens, Button, and Card have ~zero product adoption is a parallel mockup that compiles. Everything else is downstream of this. This is the single most-corroborated finding across all 20 lenses.

2. **No enforcement, so every fix regenerates (#4).** Convention-only discipline has *already* failed measurably (0% ramp adoption, the font-mono lie shipping, two inputs drifting at N=2). Without a lint gate + a coverage test, fixing the gaps below just resets a clock.

3. **The system has no edge / no primitive-vs-composite boundary.** There is no `ui/` barrel and no boundary between "the system" (`Button`) and "this site's usage" (a portfolio chat overlay). You cannot version, test, or safely reuse a system with undefined edges — which is why governance, changelog, and visual-regression are all currently impossible.

4. **The tier-precedence law is unwritten and unguarded (#6 + #7 + #10).** The raw-`--signal` leaks, the `text-foreground/NN` sprawl, the hardcoded glow, and the dual focus systems are all *one missing invariant*: components → semantic → primitive, never skipping. Write the law + lint it and a whole class of symptoms closes.

5. **The docs lie about the foundation (#3 + #18).** `/ds` is the single source of truth and it hand-mirrors globals.css, already misnaming the typeface. An unmaintained, drift-prone reference page erodes trust in every token it documents.

---

## 6. Recommended roadmap

### Now (1-2 days, mostly S — stop the bleeding, tell the truth)
1. **Install the lint gate** (#4): ban raw hex/oklch, arbitrary `text-[…rem]`, `text-foreground/[0-9]`, and bare `var(--signal-*)/var(--ink-*)` in `src/components`; add a CI token-coverage assertion.
2. **Fix the font truth** (#3): decide mono-or-not, repoint/rename, register `--font-cipher` in `@theme`, correct the /ds labels.
3. **Make the retheme contract true** (#6): derive `--shadow-glow` from `--signal-500`, name the teal, route the 14 accent leaks through `--primary`/`--brand`.
4. **Write the tier-precedence law + 4-5 ADRs** (solid-by-default glass, refraction scope, type-ramp strategy, de-emphasis tiers, font choice); create the promised `CONTEXT.md`; add a `deliberately-omitted` ledger (RTL, status colors, DTCG, Figma).

### Next (1-2 weeks, M/L — make the product consume the system)
5. **Bring the chat into the system** (#1): extract `Input/Field`, `IconButton`/send, `ChatBubble`, and a true `Dialog/Overlay` (focus trap + `aria-modal`); make it a true modal (#12); route the ask→reply loop through them. Add a `ui/index.ts` barrel and a primitive/composite boundary.
6. **Resolve adoption** (#2): keep-or-kill each defined-but-unused layer; migrate survivors (headings → ramps, controls → `<Button>`, panels → `<Card glass>`/`Surface`); migrate chat/chrome/showpage to the de-emphasis tiers (#7).
7. **Author the state + voice layers** (#5, #11, #16, #17): `States` section in /ds, `loading`/`aria-busy`/`Spinner`, one `--disabled-opacity`, unify focus (#10); ship a `voice.ts` charter with a complete error/decline copy table.
8. **Give glass one API + a radius law** (#9), wired into the new `Surface` primitive.

### Later (right-size and harden)
9. **Forced-colors + prefers-contrast** (#8) and the mobile/keyboard/perf tier (#13, #14): device-tier glass degradation, `visualViewport`/safe-area, field-pause, tokenized `--field-blur` + glass budget.
10. **Layout primitives** (#15): `Container/Section/Stack` + semantic spacing tokens; retire the ×6 gutter copy-paste.
11. **Drift-proof the docs** (#18): generate /ds tables from source (or generalize `TokenValue`); add a minimal Playwright visual-regression matrix (both themes × reduced-motion × reduced-transparency).
12. **Polish** (#20, #21, #22): rim/light model only once the API exists; unify brand-blue across logo/favicon/OG; add the `Icon` primitive. **Do not** add glass elevation tiers/grain/tint until a real surface needs them.

**The one-line mandate:** Signal Glass has earned its foundations. The work now is not *more tokens* — it's making the product **built from** the system, and putting a lint gate behind that so it stays true.