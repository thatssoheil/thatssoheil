# Signal Glass P0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the Signal Glass foundation — a global living signal mesh-field behind the whole site, plus a solid-by-default `.glass` token system — and make the field visible behind the hero.

**Architecture:** A `SignalField` component renders a `fixed inset-0` layer of slow-drifting, signal-hued radial-gradient blobs (pure CSS, GPU `transform` animations), mounted once in the app shell below all content. Glass design tokens + a `.glass` class are defined in `globals.css` as a progressive enhancement (solid fill by default; blur only where `backdrop-filter` is supported and the user hasn't asked to reduce transparency). The hero's opaque background is removed so the field reads through; reading sections keep their solid backgrounds this phase.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, Tailwind CSS v4 (CSS-first `@theme`/`@utility`/`@layer`), TypeScript, deployed via OpenNext/Cloudflare.

## Global Constraints

- **No unit-test harness in this repo.** Per the spec, verification is tooling + observation. Each task's "test cycle" = `pnpm exec eslint .` (exit 0), `pnpm exec tsc --noEmit` (exit 0), `pnpm build` (Compiled successfully). The repo's `lint` script (`next lint`) is dead under Next 16 — always lint with `pnpm exec eslint .`.
- **Commits:** lowercase Conventional Commits, scope `signal-glass` (e.g. `feat(signal-glass): …`). One concern per commit.
- **Dates/clock/RNG:** the field must be deterministic and SSR-safe — no `Math.random()`, no `Date.now()`. Composition is fixed in CSS.
- **Reduced motion:** `globals.css` already has a global `@media (prefers-reduced-motion: reduce)` rule that forces `animation-duration: 0.01ms` + `animation-iteration-count: 1`. Field keyframes MUST be round-trips (`0%,100%` identical) so the frozen state equals the intended base composition.
- **A11y:** glass is solid/legible by default; translucency is the enhancement. Field is `aria-hidden` + `pointer-events-none`. Hero text must stay WCAG 2.2 AA over the field.
- **Tailwind v4:** tokens are plain CSS custom properties in `:root`/`.dark` (NOT in `@theme`, matching the existing `--plane-tint`/`--shadow-*` pattern). `@keyframes` and the field classes are top-level CSS; `.glass` lives in `@layer components` (full nesting support for the `@supports`/`@media` gate).
- **Out of scope (do NOT touch):** applying `.glass` to any chrome/reading panel (P1), refraction at chat-open (P2), card/button variants (P3), WebGL, the cipher wordmark, the chat backend/overlay logic.

---

### Task 1: Glass design tokens + `.glass` class

**Files:**
- Modify: `src/app/globals.css` — add glass tokens to the `:root` (light) and `.dark` blocks; add `.glass` in `@layer components`.

**Interfaces:**
- Produces (consumed by P1, not this phase): CSS custom properties `--glass-bg`, `--glass-bg-solid`, `--glass-blur`, `--glass-saturate`, `--glass-rim`, `--glass-sheen`, `--glass-shadow` (per theme); a `.glass` class that is solid by default and translucent-blurred as a gated enhancement.

- [ ] **Step 1: Add light-theme glass tokens to `:root`**

In `src/app/globals.css`, find the `:root` block's plane-tint line:
```css
	--plane-tint: color-mix(in oklch, var(--foreground) 5%, transparent);
```
Immediately after it, add:
```css

	/* Glass — Signal Glass material. Solid fill is the legible default;
	   --glass-bg (translucent) is used only behind the @supports/reduced-transparency
	   gate in the .glass class. Applied to surfaces in P1. */
	--glass-bg: color-mix(in oklch, var(--card) 70%, transparent);
	--glass-bg-solid: var(--card);
	--glass-blur: 16px;
	--glass-saturate: 140%;
	--glass-rim: color-mix(in oklch, var(--foreground) 10%, transparent);
	--glass-sheen: color-mix(in oklch, var(--foreground) 6%, transparent);
	--glass-shadow: 0 8px 40px oklch(0 0 0 / 0.12);
```

- [ ] **Step 2: Add dark-theme glass tokens to `.dark`**

Find the `.dark` block's plane-tint line:
```css
	--plane-tint: color-mix(in oklch, var(--foreground) 8%, transparent);
```
Immediately after it, add:
```css

	/* Glass — slightly more translucent + a stronger drop on the void (see :root) */
	--glass-bg: color-mix(in oklch, var(--ink-900) 60%, transparent);
	--glass-bg-solid: var(--ink-900);
	--glass-blur: 16px;
	--glass-saturate: 150%;
	--glass-rim: color-mix(in oklch, var(--foreground) 14%, transparent);
	--glass-sheen: color-mix(in oklch, var(--foreground) 8%, transparent);
	--glass-shadow: 0 8px 40px oklch(0 0 0 / 0.5);
```

- [ ] **Step 3: Add the `.glass` class**

In `src/app/globals.css`, after the `text-button-*` `@utility` block (just before the `/* ─── Reduced Motion ─── */` comment), add:
```css
/* ─── Glass material ───
   Solid + legible by DEFAULT. Real translucent glass only where backdrop-filter
   is supported AND the user has not requested reduced transparency. `not (… reduce)`
   means browsers without the query (Firefox) still get glass; only an explicit
   reduce-transparency preference forces the solid fallback. Applied to surfaces in P1. */
@layer components {
	.glass {
		background-color: var(--glass-bg-solid);
		border: 1px solid var(--glass-rim);
		box-shadow: var(--glass-shadow), inset 0 1px 0 0 var(--glass-sheen);

		@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
			@media not (prefers-reduced-transparency: reduce) {
				background-color: var(--glass-bg);
				-webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
				backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
			}
		}
	}
}
```

- [ ] **Step 4: Verify the gate is green**

Run:
```bash
pnpm exec eslint . ; echo "eslint:$?"
pnpm exec tsc --noEmit ; echo "tsc:$?"
pnpm build 2>&1 | grep -E "Compiled successfully|Failed|error" | head
```
Expected: `eslint:0`, `tsc:0`, and `✓ Compiled successfully`. (The `.glass` class is defined but unused this phase — Tailwind v4 still emits a `@layer components` class, and an unused CSS class is not an error.)

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(signal-glass): Add glass material tokens and .glass class"
```

---

### Task 2: `SignalField` component + field CSS

**Files:**
- Create: `src/components/signal-field/signal-field.tsx`
- Modify: `src/app/globals.css` — add field tuning tokens to `:root`/`.dark`, and a "Signal Field" CSS section (classes + `@keyframes`).

**Interfaces:**
- Consumes: the `--signal-*`, `--ink-*`, `--background` tokens already in `globals.css`.
- Produces: `export function SignalField(): JSX.Element` — a server component rendering `<div class="signal-field" aria-hidden>` with three blob children. Consumed by Task 3 (mounted in `layout.tsx`).

- [ ] **Step 1: Add field tuning tokens to `:root` (light)**

In `src/app/globals.css`, directly below the light-theme glass tokens added in Task 1, add:
```css

	/* Signal field — the living substrate. Faint on paper (restraint). */
	--field-blob-a: var(--signal-500);
	--field-blob-b: oklch(0.7 0.12 210);
	--field-blob-c: var(--signal-400);
	--field-opacity: 0.1;
```

- [ ] **Step 2: Add field tuning tokens to `.dark`**

Directly below the dark-theme glass tokens added in Task 1, add:
```css

	/* Signal field — a dim signal aurora on the near-black void (the showpiece). */
	--field-blob-a: var(--signal-500);
	--field-blob-b: oklch(0.64 0.16 210);
	--field-blob-c: var(--signal-700);
	--field-opacity: 0.18;
```

- [ ] **Step 3: Add the Signal Field CSS section**

In `src/app/globals.css`, after the `.glass` `@layer components` block from Task 1 (still before the Reduced Motion comment), add:
```css
/* ─── Signal field ───
   A fixed, full-viewport living substrate: three slow-drifting signal-hued blobs
   over the void, softly blurred. Transform-only animation (GPU-composited). The
   drift keyframes are round-trips (0%==100%) so the global reduced-motion freeze
   lands on the intended base composition. aria-hidden, pointer-events-none, -z. */
.signal-field {
	position: fixed;
	inset: 0;
	z-index: -10;
	overflow: hidden;
	pointer-events: none;
}
.signal-field__blob {
	position: absolute;
	border-radius: 9999px;
	filter: blur(60px);
	opacity: var(--field-opacity);
}
.signal-field__blob--a {
	width: 60vmax; height: 60vmax;
	top: -12vmax; left: -10vmax;
	background: radial-gradient(circle, var(--field-blob-a), transparent 70%);
	animation: signal-drift-a 38s ease-in-out infinite;
}
.signal-field__blob--b {
	width: 52vmax; height: 52vmax;
	bottom: -10vmax; right: -8vmax;
	background: radial-gradient(circle, var(--field-blob-b), transparent 70%);
	animation: signal-drift-b 46s ease-in-out infinite;
}
.signal-field__blob--c {
	width: 44vmax; height: 44vmax;
	top: 30%; left: 32%;
	background: radial-gradient(circle, var(--field-blob-c), transparent 70%);
	animation: signal-drift-c 54s ease-in-out infinite;
}
@keyframes signal-drift-a {
	0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
	50%      { transform: translate3d(6vmax, 4vmax, 0) scale(1.1); }
}
@keyframes signal-drift-b {
	0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
	50%      { transform: translate3d(-5vmax, -4vmax, 0) scale(1.08); }
}
@keyframes signal-drift-c {
	0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
	50%      { transform: translate3d(4vmax, -6vmax, 0) scale(0.92); }
}
```

- [ ] **Step 4: Create the `SignalField` component**

Create `src/components/signal-field/signal-field.tsx` with exactly:
```tsx
/**
 * The living substrate behind the whole site: a fixed, full-viewport field of
 * slow-drifting signal-hued blobs over the void. Pure CSS (see `.signal-field`
 * in globals.css) — no client state, SSR-safe, deterministic. Gives the glass
 * surfaces (P1+) real colour and motion to refract. Decorative: aria-hidden.
 */
export function SignalField() {
	return (
		<div className="signal-field" aria-hidden="true">
			<div className="signal-field__blob signal-field__blob--a" />
			<div className="signal-field__blob signal-field__blob--b" />
			<div className="signal-field__blob signal-field__blob--c" />
		</div>
	);
}
```

- [ ] **Step 5: Verify the gate is green**

Run:
```bash
pnpm exec eslint . ; echo "eslint:$?"
pnpm exec tsc --noEmit ; echo "tsc:$?"
pnpm build 2>&1 | grep -E "Compiled successfully|Failed|error" | head
```
Expected: `eslint:0`, `tsc:0`, `✓ Compiled successfully`. (Component is defined but not yet mounted — compiles, not visible.)

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/components/signal-field/signal-field.tsx
git commit -m "feat(signal-glass): Add SignalField living substrate (CSS drift field)"
```

---

### Task 3: Mount the field + reveal it behind the hero

**Files:**
- Modify: `src/app/layout.tsx` — import and mount `SignalField` in the app shell.
- Modify: `src/components/sections/hero.tsx` — drop the opaque hero background so the field reads through.

**Interfaces:**
- Consumes: `SignalField` from Task 2.
- Produces: the field rendered once, behind all content; visible in the hero.

- [ ] **Step 1: Import `SignalField` in the layout**

In `src/app/layout.tsx`, add to the import group (after the `ThemeProvider` import on line 6):
```tsx
import { SignalField } from "@/components/signal-field/signal-field";
```

- [ ] **Step 2: Mount it as the base layer**

In `src/app/layout.tsx`, inside `<ThemeProvider>`, add `<SignalField />` as the first child (before `<SkipToContent />`):
```tsx
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					<SignalField />
					<SkipToContent />
					{children}
				</ThemeProvider>
```

- [ ] **Step 3: Reveal the field through the hero background**

In `src/components/sections/hero.tsx`, find the section's opening tag (line ~91-95):
```tsx
		<section
			id={"hero" satisfies SectionId}
			className="relative w-full h-[100dvh] overflow-hidden bg-[image:var(--gradient-hero)]"
			aria-label="Hero"
		>
```
Remove `bg-[image:var(--gradient-hero)]` so the section is transparent and the fixed field shows through (the solid `body` background, painted below the field, remains the void bed):
```tsx
		<section
			id={"hero" satisfies SectionId}
			className="relative w-full h-[100dvh] overflow-hidden"
			aria-label="Hero"
		>
```

- [ ] **Step 4: Verify the gate is green**

Run:
```bash
pnpm exec eslint . ; echo "eslint:$?"
pnpm exec tsc --noEmit ; echo "tsc:$?"
pnpm build 2>&1 | grep -E "Compiled successfully|Failed|error" | head
```
Expected: `eslint:0`, `tsc:0`, `✓ Compiled successfully`.

- [ ] **Step 5: Observe behaviour (manual gate)**

Run `pnpm dev` and confirm in the browser:
- The signal field drifts slowly behind the **hero** in **dark** mode (default) and **light** mode (toggle).
- **Manifesto** and **Connect** still show their solid backgrounds (field hidden there) — calm reading preserved.
- With OS "Reduce Motion" on, the field is **static** (no drift), composed (not blank).
- **Contrast:** the hero eyebrow (`text-foreground/45`) and tagline remain legible over the field. If any text dips below ~4.5:1, lower `--field-opacity` (dark) by 0.02–0.04 in `globals.css` and re-check. Record the final value.

(Per the global no-test-harness constraint, this observation step is the behavioural gate; there is no automated test to run.)

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/components/sections/hero.tsx
git commit -m "feat(signal-glass): Mount the field and reveal it behind the hero"
```

---

## Done criteria (P0)

- `SignalField` mounted app-wide; field drifts behind the hero in dark + light; static under reduced motion.
- Glass tokens + `.glass` class defined (solid-by-default, gated enhancement) — ready for P1, not yet applied.
- Reading sections unchanged (solid) — nothing illegible.
- `eslint .` / `tsc --noEmit` / `pnpm build` all green; hero text confirmed AA over the field.

## Self-review notes

- **Spec coverage:** SignalField (§Design/SignalField) → Task 2/3; glass tokens + `.glass` + a11y contract (§Glass tokens, §A11y) → Task 1; background re-layer (§Background re-layer) → Task 3; reduced-motion (§A11y) → global rule + round-trip keyframes (Task 2, constraint). Light/dark tuning → Task 1+2 tokens. Refraction/chrome/cards explicitly deferred (§P0 boundary).
- **No placeholders:** every CSS/TSX block is literal and complete.
- **Type consistency:** the class names `signal-field`, `signal-field__blob`, `--blob--{a,b,c}`, and the token names match across globals.css and the component; `--glass-*`/`--field-*` names match the spec verbatim.
