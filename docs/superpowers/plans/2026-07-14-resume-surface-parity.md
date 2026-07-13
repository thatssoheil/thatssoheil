# Résumé Surface Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the résumé paper and export box inherit the same Signal Glass reading-panel material, large radius, edge, and depth as the Manifesto and Connect panels.

**Architecture:** Reuse the existing `Surface` primitive as the only owner of panel material and corner geometry. Keep résumé-specific CSS responsible only for document and toolbar layout, while print media continues to remove web material and hide export controls.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 4, CSS Modules, existing `Surface` primitive, Node.js résumé contract checks, headless Chromium, `pdfinfo`, and `pdftotext`.

## Global Constraints

- Both résumé surfaces use `Surface`, `variant="panel"`, the default edge treatment, and `radius="lg"`.
- Do not add the Manifesto or Connect radial wash to the résumé.
- Do not add animation, hover elevation, a new surface variant, or new material tokens.
- Preserve the résumé and export box dimensions, content, normal-flow order, and 1rem gap.
- Preserve mobile full-width behavior.
- Preserve a two-page A4 PDF with unchanged extracted text; the export box remains print-hidden.

---

### Task 1: Inherit the root-page reading-panel surface

**Files:**
- Modify: `scripts/check-resume.mjs`
- Modify: `src/components/resume/resume-document.tsx`
- Modify: `src/components/resume/export-controls.tsx`
- Modify: `src/components/resume/resume.module.css`

**Interfaces:**
- Consumes: `Surface({ variant: "panel", edge: true, radius: "lg" })` from `src/components/ui/surface.tsx` and the root-page reference usage in `src/components/sections/section-panel.tsx`.
- Produces: a résumé document and export action surface whose material, edge, radius, and depth are owned by `Surface`; no new public API.

- [ ] **Step 1: Add failing surface-parity contract assertions**

In `scripts/check-resume.mjs`, retain the existing source reads and add these requirements to the source-pattern contract:

```js
[document, /<Surface\s+variant="panel"\s+radius="lg"/s, "resume paper must inherit the root reading-panel surface"],
[exportControls, /<Surface\s+variant="panel"\s+radius="lg"/s, "export controls must inherit the root reading-panel surface"],
```

Read the screen paper block beside `toolbarCss`:

```js
const paperCss = readBlock(css, ".paper");
```

Then add a local-material guard after the screen-envelope assertions:

```js
for (const [block, label] of [
	[paperCss, "resume paper"],
	[toolbarCss, "export controls"],
]) {
	if (/(?:border(?:-radius)?|background|box-shadow):/.test(block)) {
		failures.push(`${label} must inherit material, edge, radius, and depth from Surface`);
	}
}
```

- [ ] **Step 2: Run the focused contract and verify the expected failure**

Run:

```bash
pnpm check:resume
```

Expected: exit 1 with failures stating that the résumé paper and export controls must inherit the root reading-panel surface. The local-material guard must also report the current CSS overrides.

- [ ] **Step 3: Make the résumé paper inherit the shared surface recipe**

In `src/components/resume/resume-document.tsx`, change the outer element to:

```tsx
<Surface
	variant="panel"
	radius="lg"
	className={styles.paper}
	aria-label={`${RESUME.name} résumé`}
>
```

In the screen `.paper` block in `src/components/resume/resume.module.css`, remove:

```css
border-radius: var(--radius-xl);
```

Keep the print `.paper` reset unchanged, including `border-radius: 0` and `box-shadow: none`.

- [ ] **Step 4: Make the export box inherit the shared surface recipe**

In `src/components/resume/export-controls.tsx`, import the primitive:

```tsx
import { Surface } from "@/components/ui/surface";
```

Replace the outer `<div>` with:

```tsx
<Surface
	variant="panel"
	radius="lg"
	className={styles.toolbar}
	aria-label="Résumé actions"
>
```

Close it with `</Surface>`. In the screen `.toolbar` block in `src/components/resume/resume.module.css`, remove:

```css
border: 1px solid var(--glass-rim);
border-radius: var(--radius-lg);
background: var(--glass-bg-solid);
box-shadow: var(--shadow-border);
```

Delete the now-redundant rule:

```css
@media (prefers-reduced-transparency: reduce) {
	.toolbar { background: var(--glass-bg-solid); }
}
```

The shared `Surface` material already owns the solid reduced-transparency fallback.

- [ ] **Step 5: Run focused checks and verify green**

Run:

```bash
pnpm check:resume
pnpm typecheck
```

Expected: both commands exit 0.

- [ ] **Step 6: Run the complete repository gate**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

Expected: every command exits 0. The existing non-fatal `jsx-ast-utils` diagnostic may appear during ESLint, but there must be no lint errors.

- [ ] **Step 7: Capture desktop and mobile visual evidence**

Start the built site with `pnpm start`, then run:

```bash
google-chrome --headless --no-sandbox --disable-gpu --window-size=1440,1800 --screenshot=/tmp/soheil-resume-surface-desktop.png http://localhost:3000/resume
google-chrome --headless --no-sandbox --disable-gpu --window-size=390,844 --screenshot=/tmp/soheil-resume-surface-mobile.png http://localhost:3000/resume
```

Expected: the paper and export box use the same large corner geometry, panel fill, rim/sheen behavior, and soft depth as the root-page reading panels. Their widths and 1rem separation remain unchanged; mobile has no horizontal clipping.

- [ ] **Step 8: Prove the PDF presentation and text are unchanged**

Run:

```bash
google-chrome --headless --no-sandbox --disable-gpu --no-pdf-header-footer --print-to-pdf=/tmp/soheil-fakour-resume-surface.pdf http://localhost:3000/resume
pdfinfo /tmp/soheil-fakour-resume-surface.pdf | rg 'Pages|Page size|File size'
pdftotext -layout /tmp/soheil-fakour-resume-surface.pdf /tmp/soheil-fakour-resume-surface.txt
cmp /tmp/soheil-fakour-resume-surface.txt /tmp/soheil-fakour-resume-root-cause-fix.txt
```

Expected: `Pages: 2`, A4 page size, and `cmp` exits 0 against the reference text captured from commit `8d7e45a`.

- [ ] **Step 9: Commit the implementation**

Run:

```bash
git add scripts/check-resume.mjs src/components/resume/resume-document.tsx src/components/resume/export-controls.tsx src/components/resume/resume.module.css
git commit -m "fix(resume): inherit root panel surfaces"
```

Expected: one implementation commit containing only the contract and surface-parity changes.
