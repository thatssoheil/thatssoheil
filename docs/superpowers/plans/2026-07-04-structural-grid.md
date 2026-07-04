# Structural Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a quiet architectural grid substrate that makes the page structure visible without cluttering content.

**Architecture:** Add a decorative `StructureGrid` server component mounted once in the root layout next to `SignalField`. Theme-aware CSS tokens in `globals.css` control grid opacity and line color, while fixed-position CSS layers draw content-width rails, a center rail, and sparse horizontal rhythm lines.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript, Tailwind CSS v4 CSS-first tokens/classes, existing `pnpm test` verification.

## Global Constraints

- Use a global non-interactive grid layer mounted with the existing `SignalField` substrate.
- Align the strongest vertical rails to the shared `max-w-4xl` content width.
- Include a subtle center rail and sparse horizontal rhythm lines.
- Keep dark mode more visible and light mode much quieter.
- Keep the grid behind content and glass; it must never interfere with text readability.
- Fade the grid near viewport edges so it feels embedded in the page field.
- Do not add per-section grid backgrounds or one-off component treatments.
- Implement with CSS backgrounds/pseudo-elements, not canvas or JavaScript.
- Preserve pointer-events none and negative z-index layering.

---

### Task 1: Add Theme Tokens and Grid CSS

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Existing theme tokens `--background`, `--foreground`, `--brand`, `--alpha-*`.
- Produces: CSS variables `--grid-rail`, `--grid-rhythm`, `--grid-center`, `--grid-fade`, and classes `.structure-grid`, `.structure-grid__rails`, `.structure-grid__rhythm`.

- [ ] **Step 1: Add light-theme structural grid tokens**

In `src/app/globals.css`, inside the light `:root` theme block after `--field-opacity: 0.1;`, add:

```css
	/* Structural grid — faint architectural guides on paper. */
	--grid-rail: color-mix(in oklch, var(--foreground) 8%, transparent);
	--grid-rhythm: color-mix(in oklch, var(--foreground) 5%, transparent);
	--grid-center: color-mix(in oklch, var(--brand) 8%, transparent);
	--grid-fade: linear-gradient(
		to bottom,
		transparent 0%,
		#000 14%,
		#000 82%,
		transparent 100%
	);
```

- [ ] **Step 2: Add dark-theme structural grid tokens**

In `src/app/globals.css`, inside the `.dark` theme block after `--field-opacity: 0.18;`, add:

```css
	/* Structural grid — visible but quiet on the deep void. */
	--grid-rail: color-mix(in oklch, var(--foreground) 11%, transparent);
	--grid-rhythm: color-mix(in oklch, var(--foreground) 6%, transparent);
	--grid-center: color-mix(in oklch, var(--brand) 12%, transparent);
	--grid-fade: linear-gradient(
		to bottom,
		transparent 0%,
		#000 12%,
		#000 84%,
		transparent 100%
	);
```

- [ ] **Step 3: Add structural grid classes**

In `src/app/globals.css`, after the existing `.signal-field__blob--c` rule and before `@keyframes signal-drift-a`, add:

```css
/* ─── Structural grid ───
   A fixed architectural substrate aligned to the site's shared content width.
   It sits above the signal field and below all content, so it gives the void
   structure without becoming a component-level decoration. */
.structure-grid {
	position: fixed;
	inset: 0;
	z-index: -9;
	overflow: hidden;
	pointer-events: none;
	mask-image: var(--grid-fade);
	-webkit-mask-image: var(--grid-fade);
}
.structure-grid__rails,
.structure-grid__rhythm {
	position: absolute;
	inset: 0;
}
.structure-grid__rails {
	background-image:
		linear-gradient(to right, transparent calc(50% - min(44rem, calc(100vw - 2.5rem)) / 2), var(--grid-rail) 0 calc(50% - min(44rem, calc(100vw - 2.5rem)) / 2 + 1px), transparent 0),
		linear-gradient(to right, transparent calc(50% + min(44rem, calc(100vw - 2.5rem)) / 2 - 1px), var(--grid-rail) 0 calc(50% + min(44rem, calc(100vw - 2.5rem)) / 2), transparent 0),
		linear-gradient(to right, transparent calc(50% - 0.5px), var(--grid-center) 0 calc(50% + 0.5px), transparent 0);
}
.structure-grid__rhythm {
	background-image:
		linear-gradient(to bottom, var(--grid-rhythm) 1px, transparent 1px);
	background-size: 100% 8rem;
	background-position: 0 calc(env(safe-area-inset-top) + 0.75rem);
}
```

- [ ] **Step 4: Run the verification command**

Run:

```bash
pnpm test
```

Expected: PASS. Existing eslint resolver warnings about `TSSatisfiesExpression` may print before the command exits successfully.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/app/globals.css
git commit -m "style(grid): add structural grid tokens"
```

---

### Task 2: Add and Mount the StructureGrid Component

**Files:**
- Create: `src/components/signal-field/structure-grid.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: CSS classes `.structure-grid`, `.structure-grid__rails`, `.structure-grid__rhythm` from Task 1.
- Produces: `StructureGrid(): JSX.Element`, a decorative server component mounted in the root layout.

- [ ] **Step 1: Create the component**

Create `src/components/signal-field/structure-grid.tsx` with:

```tsx
/**
 * A quiet architectural substrate behind the site: content-width rails, a
 * centerline, and sparse horizontal rhythm lines. Pure CSS, decorative, and
 * non-interactive. Mounted once next to SignalField.
 */
export function StructureGrid() {
	return (
		<div className="structure-grid" aria-hidden="true">
			<div className="structure-grid__rails" />
			<div className="structure-grid__rhythm" />
		</div>
	);
}
```

- [ ] **Step 2: Import the component in the root layout**

In `src/app/layout.tsx`, add the import beside `SignalField`:

```tsx
import { SignalField } from "@/components/signal-field/signal-field";
import { StructureGrid } from "@/components/signal-field/structure-grid";
```

- [ ] **Step 3: Mount the grid after the signal field**

In `src/app/layout.tsx`, inside `ThemeProvider`, replace:

```tsx
					<SignalField />
					<SkipToContent />
```

with:

```tsx
					<SignalField />
					<StructureGrid />
					<SkipToContent />
```

- [ ] **Step 4: Run the verification command**

Run:

```bash
pnpm test
```

Expected: PASS. Existing eslint resolver warnings about `TSSatisfiesExpression` may print before the command exits successfully.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/components/signal-field/structure-grid.tsx src/app/layout.tsx
git commit -m "feat(grid): mount structural page grid"
```

---

### Task 3: Visual QA and Tuning

**Files:**
- Modify if needed: `src/app/globals.css`

**Interfaces:**
- Consumes: `StructureGrid` mounted in Task 2 and grid tokens/classes from Task 1.
- Produces: Final tuned token values that pass visual QA across dark/light and mobile/desktop.

- [ ] **Step 1: Start or reuse the dev server**

If no dev server is running for this worktree, run:

```bash
pnpm dev
```

Expected: Next.js serves the app, usually on `http://localhost:3000`. If a server is already running for this worktree, reuse it.

- [ ] **Step 2: Capture dark desktop hero**

Use a browser at `1440×950`, dark theme, top of page. Confirm:

- Rails are visible but quieter than the hero name and header.
- Center rail does not visually split the hero name.
- No horizontal overflow.

Suggested screenshot path:

```text
/tmp/structural-grid-qc/dark-hero-desktop.png
```

- [ ] **Step 3: Capture dark desktop Manifesto and Connect**

Use a browser at `1440×950`, dark theme, at `#manifesto` and `#connect`. Confirm:

- Glass panels remain dominant.
- Grid is readable around panels but not distracting through body copy.
- Section widths still align with header and footer.

Suggested screenshot paths:

```text
/tmp/structural-grid-qc/dark-manifesto-desktop.png
/tmp/structural-grid-qc/dark-connect-desktop.png
```

- [ ] **Step 4: Capture dark mobile**

Use a browser at `390×844`, dark theme, top of page and bottom scroll. Confirm:

- Vertical rails do not crowd the narrow viewport.
- Horizontal rhythm lines do not create noisy bands behind text.
- Connect remains visible below the fixed header at scroll end.

Suggested screenshot paths:

```text
/tmp/structural-grid-qc/dark-hero-mobile.png
/tmp/structural-grid-qc/dark-connect-mobile-bottom.png
```

- [ ] **Step 5: Capture light desktop hero**

Use a browser at `1440×950`, light theme, top of page. Confirm:

- Grid is present only as a faint paper guide.
- Light mode still feels airy and not overdrawn.

Suggested screenshot path:

```text
/tmp/structural-grid-qc/light-hero-desktop.png
```

- [ ] **Step 6: Tune only if QA fails**

If the grid is too loud, lower only the relevant token values in `src/app/globals.css`:

```css
--grid-rail: color-mix(in oklch, var(--foreground) 9%, transparent);
--grid-rhythm: color-mix(in oklch, var(--foreground) 4%, transparent);
--grid-center: color-mix(in oklch, var(--brand) 9%, transparent);
```

If the grid is too faint in dark mode, increase only the `.dark` values by 1-2 percentage points:

```css
--grid-rail: color-mix(in oklch, var(--foreground) 12%, transparent);
--grid-rhythm: color-mix(in oklch, var(--foreground) 7%, transparent);
--grid-center: color-mix(in oklch, var(--brand) 13%, transparent);
```

- [ ] **Step 7: Run final verification**

Run:

```bash
pnpm test
git diff --check
```

Expected: `pnpm test` exits 0 with the known eslint resolver warnings; `git diff --check` exits 0 with no output.

- [ ] **Step 8: Commit Task 3**

If tuning was needed:

```bash
git add src/app/globals.css
git commit -m "style(grid): tune structural grid visibility"
```

If no tuning was needed, do not create an empty commit.

## Self-Review

- Spec coverage: Task 1 adds theme-aware grid tokens and CSS backgrounds; Task 2 adds the global non-interactive component and root mount; Task 3 covers dark/light, mobile/desktop, readability, reduced clutter, and overflow QA.
- Placeholder scan: No unresolved placeholder markers; every code-producing step includes exact code.
- Type consistency: `StructureGrid` is defined once in Task 2 and imported with the same name in `src/app/layout.tsx`.
