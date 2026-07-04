# Section Liquid Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Manifesto and Connect visually compatible with the hero's liquid-glass language while widening the hero glass atmosphere.

**Architecture:** Keep the existing section components and `Surface` primitive. Add small, local decorative layers inside Manifesto and Connect rather than creating new shared abstractions prematurely; retune only the hero plane geometry/fill needed for the wider atmosphere.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4 utilities, CSS custom properties in `src/app/globals.css`, existing `Surface` primitive.

## Global Constraints

- Keep Manifesto as one readable glass field, not separate cards per paragraph.
- Reduce edge dominance on section surfaces; no new hard outlines.
- Add liquid depth using soft radial wash, faint refraction lines, and layered alpha highlights.
- Give Manifesto a quiet left rail behind the metadata column.
- Treat Manifesto paragraph rows as suspended reading bands with subtle separators, not bordered items.
- Make Connect feel like a closing instrument panel: copy on the left, action dock on the right.
- Make the email CTA the primary luminous control and social links smaller glass tiles.
- Widen the hero glass plane without reintroducing a hard rectangular border.
- Preserve current content, section order, accessibility, and responsive readability.
- No shard layout, paragraph cards, decorative blobs/orbs, new copy, chat flag/API changes, or full design-system rewrite.

---

## File Structure

- Modify `src/components/sections/hero.tsx`: widen the borderless radial hero plane and verify the name still settles.
- Modify `src/components/sections/manifesto.tsx`: add local liquid-glass layers, rail, and suspended paragraph rhythm.
- Modify `src/components/sections/connect.tsx`: add local liquid-glass layers and action dock treatment.
- Modify `src/app/globals.css` only if a small semantic token is truly needed after trying local utilities first.
- No new runtime components are planned; keep the change visually focused and easy to review.

---

### Task 1: Widen The Hero Glass Atmosphere

**Files:**
- Modify: `src/components/sections/hero.tsx`

**Interfaces:**
- Consumes: existing `HeroPlane` SVG and `CipherText` hero wordmark.
- Produces: a wider, borderless radial hero plane with no hard top edge and no visible outline.

- [ ] **Step 1: Review current hero plane geometry**

Run:

```bash
sed -n '1,90p' src/components/sections/hero.tsx
```

Expected: `HeroPlane` uses a radial `hero-plane-fill`, no stroke outline, and size tied to `clamp(2.5rem,12vw,12rem)*3.75`.

- [ ] **Step 2: Widen only the SVG rendered dimensions**

In `src/components/sections/hero.tsx`, change the `HeroPlane` SVG class from:

```tsx
className="pointer-events-none absolute left-1/2 top-[calc(50%+clamp(2.5rem,12vw,12rem)*0.75)] -z-10 h-[calc(clamp(2.5rem,12vw,12rem)*3.75)] w-[calc(clamp(2.5rem,12vw,12rem)*3.75)] -translate-x-1/2 -translate-y-1/2"
```

to:

```tsx
className="pointer-events-none absolute left-1/2 top-[calc(50%+clamp(2.5rem,12vw,12rem)*0.75)] -z-10 h-[calc(clamp(2.5rem,12vw,12rem)*3.75)] w-[calc(clamp(2.5rem,12vw,12rem)*4.55)] -translate-x-1/2 -translate-y-1/2"
```

Keep `preserveAspectRatio="xMidYMid meet"` and do not add any `stroke`.

- [ ] **Step 3: Run static verification**

Run:

```bash
pnpm test
```

Expected: command exits `0`; existing eslint `TSSatisfiesExpression` resolver warnings may print; token coverage passes.

- [ ] **Step 4: Capture hero in dark and light**

Use the existing local dev server at `http://localhost:3000` if it is running. If it is not running, start it with:

```bash
pnpm dev --hostname localhost --port 3000
```

Then capture with Chrome/CDP or an equivalent local screenshot flow:

```bash
mkdir -p /tmp/section-liquid-glass
```

Expected visual result:
- Dark hero: the glass atmosphere covers more of the wordmark width.
- No top border, no rectangular outline, no card edge.
- Visible name settles to `Soheil Fakour`.
- No horizontal overflow.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/hero.tsx
git commit -m "style(hero): widen liquid glass atmosphere"
```

---

### Task 2: Dissolve Manifesto Into Reading Glass

**Files:**
- Modify: `src/components/sections/manifesto.tsx`

**Interfaces:**
- Consumes: `MANIFESTO` data and existing `Surface`.
- Produces: one readable Manifesto glass field with inner liquid depth, a quiet metadata rail, and suspended paragraph rows.

- [ ] **Step 1: Add local layer helpers inside the existing surface**

Change the `Surface` opening from:

```tsx
<Surface variant="panel" radius="lg" className="mx-auto grid w-full max-w-4xl gap-10 p-8 sm:p-12 md:grid-cols-[10rem_1fr] md:p-16">
```

to:

```tsx
<Surface
	variant="panel"
	radius="lg"
	className="relative mx-auto grid w-full max-w-4xl overflow-hidden border-alpha-300/70 p-8 sm:p-12 md:grid-cols-[10rem_1fr] md:p-16"
>
	<div
		aria-hidden="true"
		className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_18%_24%,var(--alpha-200),transparent_62%),radial-gradient(56%_46%_at_82%_72%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_70%)]"
	/>
	<div
		aria-hidden="true"
		className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-[linear-gradient(to_right,transparent,var(--alpha-400),transparent)] opacity-60"
	/>
```

Then wrap the existing two columns in a relative grid container:

```tsx
	<div className="relative grid gap-10 md:contents">
		{/* existing left column and main content */}
	</div>
</Surface>
```

Use `md:contents` only if it preserves the current desktop grid. If the class makes the JSX harder to read, keep the two columns as direct children after the decorative layers instead.

- [ ] **Step 2: Add the quiet metadata rail**

Change the left column class from:

```tsx
className="flex flex-col gap-4 md:pt-1"
```

to:

```tsx
className="relative flex flex-col gap-4 md:pt-1"
```

Add this as the first child of the left column:

```tsx
<span
	aria-hidden="true"
	className="absolute -inset-x-3 -inset-y-4 -z-10 rounded-2xl bg-[linear-gradient(180deg,var(--alpha-100),transparent)] shadow-[inset_1px_0_0_var(--alpha-300)]"
/>
```

Expected visual result: the metadata column has quiet structure but does not become a sidebar card.

- [ ] **Step 3: Convert paragraph rows into suspended bands**

Change each paragraph row from:

```tsx
<div key={p.label} className="grid gap-3 sm:grid-cols-[7rem_1fr]">
```

to:

```tsx
<div
	key={p.label}
	className="relative grid gap-3 pt-6 first:pt-0 sm:grid-cols-[7rem_1fr]"
>
	<span
		aria-hidden="true"
		className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--alpha-300),transparent)] first:hidden"
	/>
```

Keep the existing label and body copy exactly as-is.

- [ ] **Step 4: Run verification**

```bash
pnpm test
```

Expected: exits `0`; no token coverage failures.

- [ ] **Step 5: Visual check Manifesto**

Capture or inspect:
- desktop dark at `#manifesto`
- desktop light at `#manifesto`
- mobile dark at `#manifesto`

Expected:
- One readable glass field, not paragraph cards.
- Left rail visible but quiet.
- Paragraph rhythm improved without hard boxes.
- No overflow.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/manifesto.tsx
git commit -m "style(manifesto): dissolve panel into reading glass"
```

---

### Task 3: Turn Connect Into A Glass Action Dock

**Files:**
- Modify: `src/components/sections/connect.tsx`

**Interfaces:**
- Consumes: `SOCIALS`, `EMAIL`, existing `Button`, existing `Surface`.
- Produces: a closing glass instrument panel with a primary email control and smaller social tiles.

- [ ] **Step 1: Add liquid depth to the Connect surface**

Change the `Surface` opening from:

```tsx
<Surface variant="panel" radius="lg" className="mx-auto grid w-full max-w-4xl gap-8 p-8 text-left sm:p-12 md:grid-cols-[1fr_auto] md:items-end md:p-16">
```

to:

```tsx
<Surface
	variant="panel"
	radius="lg"
	className="relative mx-auto grid w-full max-w-4xl overflow-hidden border-alpha-300/70 p-8 text-left sm:p-12 md:grid-cols-[1fr_auto] md:items-end md:p-16"
>
	<div
		aria-hidden="true"
		className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_72%_at_78%_54%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_70%),radial-gradient(48%_52%_at_18%_20%,var(--alpha-200),transparent_64%)]"
	/>
```

Keep existing content as relative children by adding `className="relative"` to the left content wrapper.

- [ ] **Step 2: Convert the action side into a dock**

Change the action wrapper from:

```tsx
<div className="flex flex-col items-start gap-5 md:items-end">
```

to:

```tsx
<div className="relative flex flex-col items-start gap-5 rounded-2xl border border-alpha-300 bg-alpha-100 p-3 shadow-[inset_0_1px_0_var(--glass-sheen)] md:items-end">
```

Expected visual result: the action area reads as a cohesive glass control group, not loose controls.

- [ ] **Step 3: Make the email CTA the luminous primary control**

Change:

```tsx
<Button asChild size="lg" className="gap-2 text-base h-12">
```

to:

```tsx
<Button
	asChild
	size="lg"
	className="h-12 gap-2 border border-alpha-300 bg-primary text-base shadow-[0_0_28px_color-mix(in_oklch,var(--primary)_24%,transparent)] hover:bg-primary/90"
>
```

Do not change the email text or href.

- [ ] **Step 4: Refine social tiles**

Change each social link class from:

```tsx
className="group flex items-center justify-center rounded-xl border border-alpha-300 p-3.5 text-text-faint hover:border-alpha-500 hover:text-foreground hover:bg-alpha-100"
```

to:

```tsx
className="group flex items-center justify-center rounded-xl border border-alpha-300 bg-alpha-100 p-3 text-text-faint transition-colors hover:border-alpha-500 hover:bg-alpha-200 hover:text-foreground"
```

Expected: social links feel like smaller glass tiles in the same dock.

- [ ] **Step 5: Run verification**

```bash
pnpm test
```

Expected: exits `0`; no token coverage failures.

- [ ] **Step 6: Visual check Connect**

Capture or inspect:
- desktop dark at `#connect`
- desktop light at `#connect`
- mobile dark at `#connect`

Expected:
- Email and socials read as one dock.
- Dock does not look like a nested card inside another card.
- Text remains readable.
- No overflow.

- [ ] **Step 7: Commit**

```bash
git add src/components/sections/connect.tsx
git commit -m "style(connect): shape actions into glass dock"
```

---

### Task 4: Final Visual QA And Adjustment Pass

**Files:**
- Modify if needed: `src/components/sections/hero.tsx`
- Modify if needed: `src/components/sections/manifesto.tsx`
- Modify if needed: `src/components/sections/connect.tsx`
- Modify if needed: `src/app/globals.css`

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: final verified section liquid-glass pass.

- [ ] **Step 1: Run full static gates**

```bash
pnpm test
pnpm build
```

Expected:
- Both commands exit `0`.
- Existing eslint `TSSatisfiesExpression` resolver warnings may print during `pnpm test`.
- `check:tokens` reports all referenced tokens resolve.

- [ ] **Step 2: Capture final visual matrix**

Use the local dev server on `http://localhost:3000`. Capture:
- `/` hero desktop dark
- `/` hero desktop light
- `#manifesto` desktop dark
- `#manifesto` desktop light
- `#connect` desktop dark
- `#connect` desktop light
- mobile dark hero
- mobile dark Manifesto
- mobile dark Connect

Save screenshots under:

```bash
/tmp/section-liquid-glass-final
```

- [ ] **Step 3: Check DOM overflow**

In the browser console or CDP, evaluate this for desktop and mobile:

```js
document.documentElement.scrollWidth > document.documentElement.clientWidth
```

Expected: `false`.

- [ ] **Step 4: Review against spec**

Confirm:
- Dark hero has wider atmospheric glass and no bordered-box read.
- Manifesto remains one readable field.
- Manifesto rail is quiet in light mode.
- Paragraph rows are structured but not carded.
- Connect action area reads as one glass dock.
- Mobile stacks cleanly.

- [ ] **Step 5: Make only targeted final adjustments**

If a visual issue appears, adjust the smallest local class needed. Examples:

```tsx
// If a rail is too strong:
className="... bg-[linear-gradient(180deg,var(--alpha-100),transparent)] ..."

// If the dock feels nested-card heavy:
className="... border border-alpha-200 bg-alpha-100 ..."

// If the hero plane still reads as a box:
// reduce only radial stop strength or rendered width; do not add strokes.
```

- [ ] **Step 6: Re-run verification after adjustments**

```bash
pnpm test
pnpm build
```

Expected: both exit `0`.

- [ ] **Step 7: Commit final QA adjustments**

If Task 4 changed files:

```bash
git add src/components/sections/hero.tsx src/components/sections/manifesto.tsx src/components/sections/connect.tsx src/app/globals.css
git commit -m "style(sections): finish liquid glass visual qa"
```

If Task 4 made no file changes, record that in the implementation summary and do not create an empty commit.

