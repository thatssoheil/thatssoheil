# Dark Mode Visual Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make dark mode feel as refined as light mode by turning the current black void into a deeper optical Signal Glass environment, while preserving the restrained identity and the existing light-mode quality.

**Architecture:** This is a sequence of small visual-system changes, not a redesign. The work starts at semantic tokens in `src/app/globals.css`, then updates the hero square, cipher animation, section composition, and verification docs so the product continues to consume the Signal Glass system instead of hand-writing one-off effects.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4 utilities, CSS custom properties, existing `Surface` primitive, existing `CipherText` / `useCipherAnimation` pipeline, Google Chrome headless via DevTools protocol for rendered geometry checks.

## Global Constraints

- Work in the existing `chore/ds-systematize` worktree; do not create a new worktree or branch.
- Preserve `NEXT_PUBLIC_ENABLE_CHAT` gating and do not touch chat backend behavior.
- Keep Signal Glass solid-by-default: translucency and blur stay progressive enhancements in `.glass` / `.glass-panel`.
- Product surfaces must consume semantic tokens or `Surface`; do not add raw hex, raw `oklch(...)` literals, or bare `var(--signal-*)` / `var(--ink-*)` inside `src/components`.
- Do not add new dependencies.
- Do not introduce broad animation; keep reduced-motion behavior intact.
- One task, one local commit. Do not push without human approval.
- Verify after each task with `pnpm test` and after all visual tasks with `pnpm build` plus rendered dark/light checks.

---

## File Structure

- Modify `src/app/globals.css`: dark theme atmosphere, glass/rim/sheen tokens, hero plane tokens, optional dark-only field tuning.
- Modify `src/components/sections/hero.tsx`: consume hero-plane semantic tokens and tune square material without changing the text-relative geometry.
- Modify `src/hooks/use-cipher-animation.ts`: lower large-display pre-trigger blur/opacity severity through config.
- Modify `src/components/matrix/cipher-text.tsx`: add optional animation-intensity prop and pass it to the hook.
- Modify `src/components/sections/manifesto.tsx`: break the centered-rectangle rhythm in the reading section with an internal rail and asymmetrical content structure.
- Modify `src/components/sections/connect.tsx`: make the call-to-action panel feel related to Manifesto but not identical.
- Modify `src/app/ds/page.tsx`: document the new dark atmosphere / hero plane / cipher intensity choices if the touched tokens are shown there.
- Create `docs/superpowers/specs/2026-07-04-dark-mode-visual-polish-design.md`: short design record capturing the visual intent and screenshot criteria.

---

### Task 1: Dark Atmosphere Token Retune

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/ds/page.tsx` only if it directly lists the touched token values

**Interfaces:**
- Consumes: existing semantic tokens in `:root` and `.dark`.
- Produces: a richer dark-mode material base used by every existing `.glass`, `.glass-panel`, `SignalField`, and `Surface`.

- [ ] **Step 1: Record current rendered baseline**

Run a headless capture before edits:

```bash
mkdir -p /tmp/signal-glass-polish-baseline
google-chrome --headless=new --disable-gpu --no-sandbox --screenshot=/tmp/signal-glass-polish-baseline/dark-hero.png --window-size=1440,900 'http://localhost:3000'
```

Expected: a `dark-hero.png` screenshot showing the current dark hero with mostly black outer field and dark glass islands.

- [ ] **Step 2: Retune dark semantic tokens**

In `src/app/globals.css`, update only the `.dark` values shown below. Keep the existing comments, but revise them if they become inaccurate.

```css
.dark {
	--background: oklch(0.145 0.006 245);
	--card: oklch(0.18 0.006 245);
	--popover: oklch(0.18 0.006 245);

	--alpha-100: oklch(1 0 0 / 5%);
	--alpha-200: oklch(1 0 0 / 8%);
	--alpha-300: oklch(1 0 0 / 12%);
	--alpha-400: oklch(1 0 0 / 16%);
	--alpha-500: oklch(1 0 0 / 28%);
	--alpha-600: oklch(1 0 0 / 56%);

	--glass-bg: color-mix(in oklch, var(--card) 66%, transparent);
	--glass-bg-panel: color-mix(in oklch, var(--card) 89%, transparent);
	--glass-bg-solid: var(--card);
	--glass-rim: color-mix(in oklch, var(--foreground) 18%, transparent);
	--glass-sheen: color-mix(in oklch, white 18%, transparent);
	--glass-shadow: 0 16px 56px oklch(0 0 0 / 0.58);

	--field-opacity: 0.24;
	--gradient-hero: radial-gradient(
		ellipse 135% 120% at 50% 46%,
		oklch(0.16 0.018 245) 0%,
		oklch(0.105 0.012 240) 48%,
		oklch(0.045 0.006 245) 100%
	);
	--gradient-surface: linear-gradient(
		180deg,
		oklch(0.18 0.006 245) 0%,
		oklch(0.135 0.004 245) 100%
	);
}
```

The hue/chroma are deliberately subtle: dark mode should gain optical depth without turning blue-purple.

- [ ] **Step 3: Check token coverage and build**

Run:

```bash
pnpm test
pnpm build
```

Expected: both exit 0. `pnpm test` may print the existing `TSSatisfiesExpression` resolver warnings, but it must finish with token coverage passing.

- [ ] **Step 4: Render-check dark and light**

Use the existing dev server at `http://localhost:3000`. Capture dark and light hero screenshots.

```bash
mkdir -p /tmp/signal-glass-polish-task1
google-chrome --headless=new --disable-gpu --no-sandbox --screenshot=/tmp/signal-glass-polish-task1/dark-hero.png --window-size=1440,900 'http://localhost:3000'
```

Then toggle light mode manually or via DevTools/localStorage and capture `/tmp/signal-glass-polish-task1/light-hero.png`.

Expected:
- Dark mode still reads neutral-black, not blue.
- Header/footer glass rims are more visible than baseline.
- Light mode is visually unchanged except for no regressions from shared CSS.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/ds/page.tsx
git commit -m "style(dark): deepen signal glass atmosphere"
```

---

### Task 2: Hero Square Material Polish

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/sections/hero.tsx`

**Interfaces:**
- Consumes: Task 1 dark token base.
- Produces: hero-plane semantic tokens and a richer square material that preserves the current text-relative size and position.

- [ ] **Step 1: Add hero-plane semantic tokens**

In `src/app/globals.css`, add these tokens to `:root` near `--plane-tint`:

```css
--plane-rim: color-mix(in oklch, var(--foreground) 20%, transparent);
--plane-rim-strong: color-mix(in oklch, var(--foreground) 28%, transparent);
--plane-sheen: color-mix(in oklch, white 36%, transparent);
--plane-glow: color-mix(in oklch, var(--primary) 12%, transparent);
```

Add the dark overrides inside `.dark` near the existing `--plane-tint`:

```css
--plane-tint: color-mix(in oklch, var(--foreground) 10%, transparent);
--plane-rim: color-mix(in oklch, var(--foreground) 26%, transparent);
--plane-rim-strong: color-mix(in oklch, white 34%, transparent);
--plane-sheen: color-mix(in oklch, white 18%, transparent);
--plane-glow: color-mix(in oklch, var(--primary) 18%, transparent);
```

- [ ] **Step 2: Update `HeroPlane` gradients and strokes**

In `src/components/sections/hero.tsx`, replace the `HeroPlane` SVG internals with this shape while keeping the existing outer className exactly as-is:

```tsx
<defs>
	<linearGradient id="hero-plane-fill" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0%" stopColor="var(--plane-sheen)" />
		<stop offset="34%" stopColor="var(--plane-tint)" />
		<stop offset="100%" stopColor="transparent" />
	</linearGradient>
	<radialGradient id="hero-plane-glow" cx="50%" cy="24%" r="62%">
		<stop offset="0%" stopColor="var(--plane-glow)" />
		<stop offset="100%" stopColor="transparent" />
	</radialGradient>
</defs>

<rect
	x={SQUARE.x}
	y={SQUARE.y}
	width={SQUARE.size}
	height={SQUARE.size}
	rx={SQUARE.radius}
	fill="url(#hero-plane-glow)"
/>
<rect
	x={SQUARE.x}
	y={SQUARE.y}
	width={SQUARE.size}
	height={SQUARE.size}
	rx={SQUARE.radius}
	fill="url(#hero-plane-fill)"
/>
<path
	d={`M ${SQUARE.x + SQUARE.radius} ${SQUARE.y} H ${SQUARE.x + SQUARE.size - SQUARE.radius}`}
	stroke="var(--plane-rim-strong)"
	strokeWidth={0.9}
	strokeLinecap="round"
	vectorEffect="non-scaling-stroke"
/>
<rect
	x={SQUARE.x}
	y={SQUARE.y}
	width={SQUARE.size}
	height={SQUARE.size}
	rx={SQUARE.radius}
	stroke="var(--plane-rim)"
	strokeWidth={0.75}
	strokeLinejoin="round"
	vectorEffect="non-scaling-stroke"
/>
```

The outer `maskImage` stays. The square must remain locked to the eyebrow/name scale from commit `e8242dd`.

- [ ] **Step 3: Verify geometry did not drift**

Run a DevTools measurement or equivalent script that checks:

```text
planeWidth / nameFontSize === 3.75 +/- 0.01
plane top gap to eyebrow remains close to desktop side breathing room
```

Expected desktop dark values should remain close to:

```text
sizeRatio: 3.75
eyebrowTopGap: roughly 92px at 1440px viewport
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm test
pnpm build
```

Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/components/sections/hero.tsx
git commit -m "style(hero): sharpen dark glass square material"
```

---

### Task 3: Cipher Animation Restraint

**Files:**
- Modify: `src/hooks/use-cipher-animation.ts`
- Modify: `src/components/matrix/cipher-text.tsx`
- Modify: `src/components/sections/hero.tsx`

**Interfaces:**
- Consumes: existing `CipherText` API.
- Produces: optional `intensity` control for the display-size hero wordmark; default behavior remains unchanged elsewhere.

- [ ] **Step 1: Extend animation config**

In `src/hooks/use-cipher-animation.ts`, update `CipherAnimationConfig`:

```ts
export type CipherAnimationConfig = {
	revealedHold: number;
	spinningHold: number;
	decelDuration: number;
	spinUpDuration: number;
	loop: boolean;
	ambient: boolean;
	intensity: "normal" | "display";
};
```

After destructuring config, add:

```ts
const scrambleBlur = intensity === "display" ? 1.15 : 2;
const scrambleOpacity = intensity === "display" ? 0.62 : 0.45;
```

Replace every initial/pre-trigger scrambled `blur: ch === " " ? 0 : 2` with:

```ts
blur: ch === " " ? 0 : scrambleBlur,
```

Replace every scrambled `opacity: ch === " " ? 1 : 0.45` with:

```ts
opacity: ch === " " ? 1 : scrambleOpacity,
```

Add `intensity` to the `useMemo` dependency array and to the animation effect dependency array.

- [ ] **Step 2: Extend `CipherTextProps`**

In `src/components/matrix/cipher-text.tsx`, add:

```ts
/** Visual intensity for large display use; display lowers blur/opacity severity. */
intensity?: "normal" | "display";
```

Default it in the function signature:

```ts
intensity = "normal",
```

Pass it into `useCipherAnimation`:

```ts
const display = useCipherAnimation(text, {
	revealedHold,
	spinningHold,
	decelDuration,
	spinUpDuration,
	loop,
	ambient,
	intensity,
});
```

- [ ] **Step 3: Use display intensity in the hero**

In `src/components/sections/hero.tsx`, add the prop to the hero name only:

```tsx
<CipherText
	text="Soheil Fakour"
	as="h1"
	ambient
	intensity="display"
	className="mt-6 whitespace-nowrap font-light leading-[0.95] text-foreground text-[length:clamp(2.5rem,12vw,12rem)] [font-family:var(--font-cipher)]"
/>
```

- [ ] **Step 4: Verify**

Run:

```bash
pnpm test
pnpm build
```

Expected: both exit 0. On the rendered hero, scrambled states should still feel alive but less visually smeared at desktop size.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-cipher-animation.ts src/components/matrix/cipher-text.tsx src/components/sections/hero.tsx
git commit -m "style(cipher): calm display wordmark scramble"
```

---

### Task 4: Break The Centered-Rectangle Rhythm

**Files:**
- Modify: `src/components/sections/manifesto.tsx`
- Modify: `src/components/sections/connect.tsx`

**Interfaces:**
- Consumes: existing `Surface` panel API.
- Produces: two panels that still use `Surface variant="panel"` but no longer share identical centered-card composition.

- [ ] **Step 1: Recompose Manifesto with a side rail**

In `src/components/sections/manifesto.tsx`, change the `Surface` className from:

```tsx
className="mx-auto w-full max-w-3xl p-8 sm:p-12 md:p-16"
```

to:

```tsx
className="mx-auto grid w-full max-w-4xl gap-10 p-8 sm:p-12 md:grid-cols-[10rem_1fr] md:p-16"
```

Move the label/subheading into the left column and the heading/paragraphs into the right column:

```tsx
<div className="flex flex-col gap-4 md:pt-1">
	<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
		{MANIFESTO.label}
	</p>
	<p className="font-sans text-xs leading-relaxed tracking-wide text-text-muted">
		{MANIFESTO.subheading}
	</p>
</div>

<div>
	<h2 className="text-fluid-36-48 font-light tracking-tight text-foreground font-sans">
		{MANIFESTO.heading}
	</h2>

	<div className="mt-14 flex flex-col gap-10">
		{MANIFESTO.paragraphs.map((p) => (
			<div key={p.label} className="grid gap-3 sm:grid-cols-[7rem_1fr]">
				<p className="font-sans text-[10px] tracking-[0.22em] uppercase text-text-faint">
					{p.label}
				</p>
				<p className="text-base sm:text-lg leading-relaxed text-left text-text-muted font-light">
					{p.body}
				</p>
			</div>
		))}
	</div>
</div>
```

This removes full-justified body copy, which currently feels rigid inside glass.

- [ ] **Step 2: Recompose Connect as a bottom action dock**

In `src/components/sections/connect.tsx`, change the `Surface` className from:

```tsx
className="mx-auto w-full max-w-3xl flex flex-col items-center text-center gap-8 p-8 sm:p-12 md:p-16"
```

to:

```tsx
className="mx-auto grid w-full max-w-4xl gap-8 p-8 text-left sm:p-12 md:grid-cols-[1fr_auto] md:items-end md:p-16"
```

Rearrange the content so copy sits left and actions sit right:

```tsx
<div>
	<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
		Connect
	</p>
	<h2 className="mt-3 text-fluid-36-60 font-light tracking-tight text-foreground font-sans">
		Say hello.
	</h2>
	<p className="mt-5 max-w-xl text-lg text-text-muted leading-relaxed font-light">
		Email first. Catch me on X. Everything else, eventually.
	</p>
</div>

<div className="flex flex-col items-start gap-5 md:items-end">
	<Button asChild size="lg" className="gap-2 text-base h-12">
		<a href={`mailto:${EMAIL}`}>
			<Mail className="size-5" />
			{EMAIL}
		</a>
	</Button>

	<div className="flex flex-wrap items-center gap-3">
		{SOCIALS.map(({ label, href, icon: Icon }) => (
			<a
				key={label}
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={label}
				title={label}
				className="group flex items-center justify-center rounded-full border border-alpha-300 p-3.5 text-text-faint hover:border-alpha-500 hover:text-foreground hover:bg-alpha-100"
			>
				<Icon className="size-5" />
			</a>
		))}
	</div>
</div>
```

- [ ] **Step 3: Verify responsive layout**

Use headless or manual browser checks at:

```text
1440x900 dark
1440x900 light
390x900 dark
```

Expected:
- Desktop Manifesto has a visible internal rhythm, not one centered column.
- Mobile still stacks cleanly.
- Connect CTA remains obvious and not clipped.

- [ ] **Step 4: Run gates**

```bash
pnpm test
pnpm build
```

Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/manifesto.tsx src/components/sections/connect.tsx
git commit -m "style(sections): vary glass panel composition"
```

---

### Task 5: Dark Glass Island Final Tuning

**Files:**
- Modify: `src/components/header.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `src/components/theme-toggle.tsx`
- Modify: `src/components/command-menu.tsx`
- Modify: `src/app/globals.css` if a semantic token is needed

**Interfaces:**
- Consumes: Task 1 dark glass token improvements and existing `Surface variant="chrome"`.
- Produces: more tactile header/footer/control chrome without inventing a second glass API.

- [ ] **Step 1: Tighten header affordance contrast**

In `src/components/header.tsx`, change inactive nav text from:

```tsx
: "text-muted-foreground hover:text-foreground/80",
```

to:

```tsx
: "text-text-faint hover:text-foreground",
```

Change active underline from:

```tsx
"absolute inset-x-0 -bottom-px h-px bg-foreground",
```

to:

```tsx
"absolute inset-x-0 -bottom-px h-px bg-[linear-gradient(to_right,transparent,var(--brand),transparent)] [filter:drop-shadow(0_0_4px_var(--primary))]",
```

- [ ] **Step 2: Make controls feel integrated with chrome**

In `src/components/theme-toggle.tsx`, change the button className to:

```tsx
className="inline-flex size-11 sm:size-8 items-center justify-center rounded-md border border-alpha-300 text-text-faint hover:text-foreground hover:border-alpha-500 hover:bg-alpha-100 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
```

In `src/components/command-menu.tsx`, change the desktop trigger className to:

```tsx
className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-md border border-alpha-300 px-2.5 text-xs text-text-faint hover:text-foreground hover:border-alpha-500 hover:bg-alpha-100 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
```

Change the mobile trigger className to:

```tsx
className="sm:hidden inline-flex size-11 items-center justify-center -mr-2 rounded-sm text-text-faint hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
```

- [ ] **Step 3: Add footer island hover restraint**

In `src/components/footer.tsx`, keep footer static. Do not add hover animation. Confirm the signal lead-in remains contained to the island edge.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm test
pnpm build
```

Expected: both exit 0. Header controls should be more visible in dark mode and remain quiet in light mode.

- [ ] **Step 5: Commit**

```bash
git add src/components/header.tsx src/components/footer.tsx src/components/theme-toggle.tsx src/components/command-menu.tsx src/app/globals.css
git commit -m "style(chrome): tune dark glass controls"
```

---

### Task 6: Design Record And Visual QA Matrix

**Files:**
- Create: `docs/superpowers/specs/2026-07-04-dark-mode-visual-polish-design.md`
- Modify: `docs/superpowers/plans/2026-07-04-dark-mode-visual-polish.md` only if execution discoveries require plan corrections

**Interfaces:**
- Consumes: Tasks 1-5 implementation decisions.
- Produces: a durable design record and a repeatable visual QA checklist for future polish.

- [ ] **Step 1: Write the design record**

Create `docs/superpowers/specs/2026-07-04-dark-mode-visual-polish-design.md`:

```markdown
# Dark Mode Visual Polish Design

**Date:** 2026-07-04
**Branch:** `chore/ds-systematize`
**Status:** Implemented

## Problem

Light mode feels more resolved than dark mode because paper gives Signal Glass visible edges,
while dark mode collapses too much of the field and glass into near-black.

## Direction

Dark mode becomes a deep optical glass environment: neutral-black, subtly blue/teal in the field,
stronger edge light, calmer display cipher, and more varied panel composition.

## Decisions

- Retune dark tokens at the semantic layer, not per component.
- Keep light mode effectively unchanged.
- Keep glass solid-by-default and progressive-enhanced.
- Preserve the hero square's text-relative geometry.
- Lower display cipher blur severity without changing the accessible text model.
- Break centered-card repetition in Manifesto and Connect without adding new sections.

## Visual QA

- Desktop dark hero: glass edges visible; background reads deep, not flat black.
- Desktop light hero: still airy and paper-like.
- Mobile dark hero: header island remains inset; wordmark does not smear heavily.
- Desktop footer/connect: footer island reads as a bottom bookend, not a full-width bar.
- Reduced motion: cipher and field remain safe.
```

- [ ] **Step 2: Run final visual QA**

Use a headless capture or manual browser pass for:

```text
1440x900 dark hero
1440x900 light hero
390x900 dark hero
1440x900 dark manifesto
1440x900 dark connect/footer
```

Expected:
- Dark mode is more visually appealing than the baseline without becoming a different brand.
- Light mode remains at least as good as before.
- No text overlaps, no button text clipping, no horizontal scrollbar.

- [ ] **Step 3: Run final hard gates**

```bash
pnpm test
pnpm build
git status --short
```

Expected:
- `pnpm test`: exit 0.
- `pnpm build`: exit 0.
- `git status --short`: only intended files before commit; clean after commit.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-07-04-dark-mode-visual-polish-design.md
git commit -m "docs(design): record dark mode visual polish decisions"
```

---

## Final Acceptance Checklist

- [ ] Dark mode has richer depth: not a flat black void.
- [ ] Light mode remains soft, airy, and at least as visually appealing as baseline.
- [ ] Header/footer islands still render as inset rounded glass surfaces on desktop and mobile.
- [ ] Hero square feels like a lit glass pane in dark mode and keeps its current text-relative geometry.
- [ ] Hero cipher remains distinctive but no longer smears the giant desktop wordmark as aggressively.
- [ ] Manifesto and Connect no longer feel like identical centered rectangles.
- [ ] All changed product surfaces use semantic tokens or `Surface`; no new raw color literals in components.
- [ ] `pnpm test` passes.
- [ ] `pnpm build` passes.
- [ ] Final rendered QA covers desktop/mobile and dark/light.

## Self-Review

- **Spec coverage:** Covers all six UI/UX review ideas: dark token retune, hero square material, cipher restraint, section rhythm, chrome tuning, and design/QA record.
- **Placeholder scan:** The plan contains concrete file paths, commands, snippets, and expected outcomes for every task.
- **Type consistency:** `CipherText intensity` and `CipherAnimationConfig intensity` both use `"normal" | "display"`; `Surface` usage remains unchanged.
- **Scope check:** This is one visual-polish feature split into independently reviewable local commits; no backend, chat API, dependency, or routing changes are included.
