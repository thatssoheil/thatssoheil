# Signal Glass — Design System Systematization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (or subagent-driven-development). Steps use `- [ ]` checkboxes. Slice 1 is detailed; Slices 2–3 are sequenced outlines — expand each into its own plan when reached.

**Goal:** Turn Signal Glass from "a beautiful theme" into a small, honest, *enforced* system the product is actually built from — without over-engineering a solo N=1 portfolio.

**Source:** [docs/audits/2026-06-29-design-system-gap-analysis.md](../../audits/2026-06-29-design-system-gap-analysis.md) (overall maturity 4.7/10). The audit holds the per-finding detail (`#1`–`#22`); this plan references findings by number rather than restating them.

**Branch:** `chore/ds-systematize` (off `feat/signal-glass`).

## Decisions (locked via grilling — these govern everything)

1. **Ambition:** thin system + lint gate. Make the product *consume* a small system; **delete** the unused rest. No component library for N=1.
2. **`--font-mono`:** surgical split — eyebrows/labels become an honest `text-eyebrow` register (stays **Lexend**, zero visual change); `code`/`pre`/`kbd` + the `-mono` ramps point at **real Geist Mono**.
3. **Type ramps:** collapse ~40 → **~6–7 semantic roles** (`display/heading/body/body-sm/eyebrow/label/code`); migrate the product; delete the rest.
4. **Glass API:** one **`<Surface>`** primitive (CVA `chrome|panel|strong` + edge + radius law); `.glass-*` become internal building blocks; **enrichment deferred** (no elevation tiers/grain/tint).
5. **Chat takeover:** **true modal** (Radix Dialog — reverses "non-modal by design"); extract `Input`/`IconButton`/`ChatBubble`/`Dialog` and route the chat through them.
6. **Light theme:** keep the toggle, **correct-not-pampered** — guarantee AA + working glass + no broken tokens; zero parity-polish budget; fix the retheme-fragility.
7. **Governance:** **hard-fail lint** (rules ERROR) + the cheap **token-coverage test** now; Playwright visual-regression **deferred** to Slice 3.

## Global Constraints

- **The lint gate is the point** — enable a rule only once its violation class is clean, so the gate stays green. The repo `lint` script is dead (`next lint` under Next 16) → standardize on `eslint .`; add a `typecheck` script (`tsc --noEmit`).
- **Verify per task:** `pnpm exec eslint .` (0) · `pnpm exec tsc --noEmit` (0) · `pnpm build` (Compiled). From Task 4 on, also the token-coverage test.
- **Tier-precedence law (the invariant the system was missing):** `component className → semantic token → primitive token`, never skipping. No raw hex/oklch, no arbitrary `text-[…rem]`, no `text-foreground/NN` for text, no bare `var(--signal-*)/var(--ink-*)` in `src/components`.
- **Commits:** lowercase Conventional Commits, scope `ds`. One concern per commit. **Thin-system rule:** when in doubt, delete the unused, don't migrate it.

---

## Slice 1 — Truth & Governance (mostly S; land first)

### Task 1: Fix the `--font-mono` lie via the surgical split (#3)
**Files:** `src/app/globals.css` (add `@utility text-eyebrow`; register `--font-cipher` in `@theme`; repoint `--font-mono`), `src/app/layout.tsx` (font wiring if needed), every `font-mono` eyebrow/label site (`hero.tsx`, `manifesto.tsx`, `connect.tsx`, `header.tsx`, `command-menu.tsx`, `ask-bar.tsx`, `chat-overlay.tsx`, `soheil-label.tsx`, `cipher-loader.tsx`), `src/app/ds/page.tsx` (labels).

- [ ] **Step 1:** Add `@utility text-eyebrow` to globals.css — Lexend, uppercase, the current tracked-caps treatment (copy the existing eyebrow recipe: `font-mono text-[…] tracking-[0.2em] uppercase` → fold into one utility). Register `--font-cipher` in `@theme inline` (so Geist Mono is a first-class face, not an arbitrary `[font-family:…]`).
- [ ] **Step 2:** Migrate every eyebrow/label currently using `font-mono` → `text-eyebrow` (register) — **before** repointing the alias, so the look never flips. (The cipher wordmark already uses `--font-cipher`; leave it.)
- [ ] **Step 3:** Repoint `--font-mono` → Geist Mono (the real one) so `code`/`pre`/`kbd` and the surviving `-mono` ramp(s) render true monospace.
- [ ] **Step 4:** Fix `/ds` typography section — it currently mislabels Lexend as "Geist Sans/Mono"; tell the truth.
- [ ] **Step 5:** Verify gate green. **Commit:** `fix(ds): Honest type roles — text-eyebrow register + real Geist Mono for code`.

### Task 2: Make the retheme contract true (#6)
**Files:** `src/app/globals.css`, the ~14 component files with raw `var(--signal-*)/var(--ink-*)`.

- [ ] **Step 1:** Derive `--shadow-glow` from the accent: `0 0 32px color-mix(in oklch, var(--signal-500) 22%, transparent)` (both themes) — kill the hardcoded `rgba(10,132,255)` (globals.css:250/334).
- [ ] **Step 2:** Promote the raw field teal (`oklch(… 210)`, :243/327) to a named token (`--field-accent`); reference it in `--field-blob-b`.
- [ ] **Step 3:** Route the ~14 raw `var(--signal-*)/var(--ink-*)` className refs through semantics (`--primary`/`--brand`/`--ring`/`--color-*`) — e.g. the send button fill, the focus glow.
- [ ] **Step 4:** Verify gate green. **Commit:** `refactor(ds): Make the six-value retheme contract actually true`.

### Task 3: Write the law + the records (#4 docs half)
**Files (new):** `docs/adr/0001-tier-precedence.md` … and ~4 more; `CONTEXT.md`; `docs/deliberately-omitted.md`.

- [ ] **Step 1:** Write the **tier-precedence law** as ADR-0001 (component → semantic → primitive, never skip) + ~4 ADRs for the already-made calls: solid-by-default glass, refraction-scope (Chromium-only at chat-open), type-ramp strategy (thin set), de-emphasis tiers, font choice (Decision 2).
- [ ] **Step 2:** Create the `CONTEXT.md` the docs promise (it doesn't exist) — what the system is, its tiers, where things live.
- [ ] **Step 3:** Write `docs/deliberately-omitted.md` — the honest ledger of non-goals (RTL/i18n, a full status-color set, DTCG/Figma pipeline, release/versioning, light-mode parity polish, glass enrichment).
- [ ] **Step 4:** **Commit:** `docs(ds): Tier-precedence law, ADRs, CONTEXT, and the omitted ledger`.

### Task 4: The hard-fail lint gate + token-coverage test (#4 enforcement half)
**Files:** `eslint.config.mjs`, `package.json` (scripts), `src/app/ds/__token-coverage__` or a `scripts/` check.

- [ ] **Step 1:** Fix scripts — `lint: "eslint ."`, add `typecheck: "tsc --noEmit"`.
- [ ] **Step 2:** Add `no-restricted-syntax` (ERROR) for `src/components/**`: ban raw hex/oklch literals, arbitrary `className` `text-[…rem]`, `text-foreground/[0-9]` (text), and bare `var(--signal-*)/var(--ink-*)`. Scope so globals.css/ds are exempt where intentional.
- [ ] **Step 3:** Add the **token-coverage check** — assert every `--token` named on `/ds` resolves in `globals.css` (the cheap test that would've caught the font lie). Wire into `pnpm test`/CI.
- [ ] **Step 4:** Run the gate; fix any residual violations Tasks 1–2 missed until **green**. **Commit:** `chore(ds): Hard-fail lint gate + token-coverage test`.

---

## Slice 2 — Product consumes the system (M/L; its own plan when reached)

Sequenced so each lands green:

1. **`<Surface>` primitive** (Decision 4) — CVA `variant=chrome|panel|strong`, `edge` boolean, one **radius law**; `.glass-*` become its internals; lint-ban inline glass in product. Route header/panels/overlay through it. *(audit #9, #20-defer)*
2. **Chat into the system** (Decision 5, audit #1, #12) — extract `Input/Field`, `IconButton`, `ChatBubble`, and a **Radix `Dialog`** (true modal: focus trap + `aria-modal` + scroll-lock + inert + focus-return); add `ui/index.ts` barrel + a primitive/composite boundary; rebuild the chat overlay + ask-bar on them.
3. **Resolve adoption** (Decisions 1+3, audit #2, #7) — migrate headings/copy onto the thin ramps, controls onto `<Button>`, panels onto `<Surface>`/`<Card glass>`, de-emphasis tiers across chat/chrome **and `/ds` itself**; **delete** every ramp/token left unused after migration; enable the remaining lint rules.
4. **Voice + States layers** (audit #5, #11, #16, #17) — one `voice.ts` charter (register-per-surface + casing + a complete error/decline copy table) that `prompt.ts` and `/ds` derive from + a persona scope/decline contract; a `States` section in `/ds` with `loading`/`aria-busy`/`Spinner`, one `--disabled-opacity`, `--state-hover/-active/-selected`, and unified focus (`--ring-focus` as the global `:focus-visible`, fold the input glow into `--ring-input-glow`).

---

## Slice 3 — Harden & right-size (Later; outline)

- **Forced-colors + `prefers-contrast`** (audit #8).
- **Mobile/perf tier** (audit #13, #14) — device-tier glass degradation, `visualViewport`/`env(safe-area-*)`, field-pause when occluded/idle, tokenized `--field-blur`, a per-surface glass budget.
- **Layout primitives** (audit #15) — `Container/Section/Stack` + semantic spacing tokens; retire the ×6 gutter copy-paste; trim the Tailwind-default duplication (#19).
- **Drift-proof `/ds`** (audit #18) — generate token tables from source / generalize `TokenValue`; add the **Playwright visual-regression** matrix (2 themes × reduced-motion × reduced-transparency).
- **Polish** (audit #21, #22, #20) — `Icon` primitive (fixed stroke + size ramp); unify brand-blue across logo/favicon/OG (+ Lexend in the OG); add a glass rim/light model **only if** a real surface needs it.

## Definition of done (Slice 1)

Font truth restored (no visual change to eyebrows) · retheme contract provably true · the law + ADRs + CONTEXT + omitted-ledger committed · the **hard-fail lint gate + token-coverage test green** and guarding `src/components`. `eslint .` / `tsc --noEmit` / `build` / token-coverage all green.
