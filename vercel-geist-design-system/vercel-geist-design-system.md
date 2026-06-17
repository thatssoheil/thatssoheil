# Vercel "Geist" Design System

> Reverse-engineered from the live computed styles of **https://vercel.com/home** (the "Agentic Infrastructure" homepage), captured 2026-06-17.
> Source of truth: the page's own CSS custom properties (770 tokens across 4 stylesheets) plus computed styles of rendered components.
> This is the public **Geist** design system that powers vercel.com and the Vercel dashboard. Two token layers coexist: the **modern `--ds-*` layer** (current Geist) and the **legacy `--geist-*` layer** (older Geist UI, still referenced). Tailwind v4 utility tokens (`--text-*`, `--spacing`, `--container-*`, `--radius-*`) sit on top.

---

## Table of contents

1. [Brand & visual identity](#1-brand--visual-identity)
2. [Theming model](#2-theming-model)
3. [Color](#3-color)
4. [Typography](#4-typography)
5. [Spacing](#5-spacing)
6. [Layout & sizing](#6-layout--sizing)
7. [Radius](#7-radius)
8. [Shadows & elevation](#8-shadows--elevation)
9. [Borders & focus](#9-borders--focus)
10. [Motion](#10-motion)
11. [Blur & effects](#11-blur--effects)
12. [Breakpoints](#12-breakpoints)
13. [Components](#13-components)
14. [Signature recipes](#14-signature-recipes)
15. [Implementation notes](#15-implementation-notes-porting-geist)
16. [Appendix: raw token dump](#16-appendix--condensed-token-reference)

---

## 1. Brand & visual identity

| Aspect | Value |
|---|---|
| Design system name | **Geist** |
| Primary typeface | **Geist Sans** (custom; falls back to Inter → system sans) |
| Mono typeface | **Geist Mono** (custom; falls back to Roboto Mono → system mono) |
| Decorative fonts | `GeistPixelSquare/Grid/Circle/Triangle/Line` (pixel display faces) |
| Logo | Vercel triangle (▲) |
| Default page theme | **Dark** (`<html class="dark-theme">`) — pure black canvas |
| Aesthetic | High-contrast monochrome, generous negative space, precise hairline borders, near-flat surfaces, tight display typography, mono for technical/eyebrow labels |

**The "look" in one paragraph:** an almost-pure black (`#000`) or white (`#fff`) canvas, content on subtly raised near-black/near-white surfaces (`#0a0a0a` / `#fff`) separated by 1px translucent borders instead of drop shadows. Display headings are large, set in Geist Sans at **normal weight** with **tight negative letter-spacing** and `line-height: 1`. Technical microcopy and eyebrows are **Geist Mono, uppercase, gray, with positive tracking**. Accent color is used sparingly (Vercel blue `#0070f7`); status colors (success/error/warning) are reserved for feedback.

Reference screenshots: `assets/01-hero-dark.png`, `assets/02-section-dark.png`.

---

## 2. Theming model

Geist is a **dual-theme** system. Every semantic color token has a light value and a dark value; the active value is selected by an ancestor class:

- Light: `:root`, `.light-theme`
- Dark: `.dark`, `.dark-theme`
- `.invert-theme` flips whichever theme it's nested under (e.g. a light island inside a dark page).

```html
<html class="dark-theme">   <!-- whole app dark -->
<section class="light-theme"> <!-- a light island -->
<div class="invert-theme">    <!-- invert relative to parent -->
```

Most colors are defined two ways and resolve identically:
1. A static hex (e.g. `--ds-gray-100: #f2f2f2`) — convenient fallback.
2. An HSL **triplet** token (`--ds-gray-100-value: 0, 0%, 95%`) consumed as `hsla(var(--ds-gray-100-value), <alpha>)`, which is how the system applies opacity to any palette step.

> **Rule of thumb:** for solid usage reach for `var(--ds-gray-100)`; when you need a custom alpha use `hsla(var(--ds-gray-100-value), .5)`.

---

## 3. Color

### 3.1 Base / background

Geist distinguishes the **app base** (deepest) from a **raised surface**:

| Token | Role | Light | Dark |
|---|---|---|---|
| `--ds-background-200` | App / page base (deepest) | `#fafafa` `hsl(0 0% 98%)` | `#000000` `hsl(0 0% 0%)` |
| `--ds-background-100` | Raised surface (cards, inputs, menus) | `#ffffff` `hsl(0 0% 100%)` | `#0a0a0a` `hsl(0 0% 4%)` |
| `--ds-black` | Absolute black | `#000` | `#000` |
| `--ds-white` | Absolute white | `#fff` | `#fff` |

> In dark mode the page is `#000` and cards/buttons sit at `#0a0a0a` — the inverse of the usual "dark gray page, lighter cards". In light mode the page is `#fafafa` and cards are pure `#fff`.

### 3.2 Gray scale (the workhorse)

10-step scale. Note it **inverts** between themes (100 = lightest fill in light mode, darkest fill in dark mode). 700/800 are theme-stable mid-grays.

| Step | Light hex | Light HSL | Dark hex | Dark HSL | Typical use |
|---|---|---|---|---|---|
| 100 | `#f2f2f2` | `0 0% 95%` | `#1a1a1a` | `0 0% 10%` | subtle fill / hover |
| 200 | `#ebebeb` | `0 0% 92%` | `#1f1f1f` | `0 0% 12%` | borders, dividers |
| 300 | `#e6e6e6` | `0 0% 90%` | `#292929` | `0 0% 16%` | stronger border |
| 400 | `#eaeaea` | `0 0% 92%` | `#2e2e2e` | `0 0% 18%` | control border |
| 500 | `#c9c9c9` | `0 0% 79%` | `#454545` | `0 0% 27%` | disabled fill |
| 600 | `#a8a8a8` | `0 0% 66%` | `#878787` | `0 0% 53%` | placeholder |
| 700 | `#8f8f8f` | `0 0% 56%` | `#8f8f8f` | `0 0% 56%` | **muted text / eyebrows** |
| 800 | `#7d7d7d` | `0 0% 49%` | `#7d7d7d` | `0 0% 49%` | secondary text |
| 900 | `#4d4d4d` | `0 0% 30%` | `#a0a0a0` | `0 0% 63%` | body-secondary text |
| 1000 | `#171717` | `0 0% 9%` | `#ededed` | `0 0% 93%` | **primary text / foreground** |

### 3.3 Gray alpha (translucent neutrals)

Used for borders/overlays that must work over any background. Light = black-on-transparent, dark = white-on-transparent.

| Step | Light | Dark |
|---|---|---|
| 100 | `#0000000d` (rgba 0,0,0,.05) | `#ffffff12` (rgba 255,255,255,.07) |
| 200 | `#00000014` (.08) | `#ffffff17` (.09) |
| 300 | `#0000001a` (.10) | `#ffffff21` (.13) |
| 400 | `#00000014` (.08) | `#ffffff24` (.14) |
| 500 | `#00000036` (.21) | `#ffffff3d` (.24) |
| 600 | `#0000003d` (.24) | `#ffffff82` (.51) |
| 700 | `#00000070` (.44) | `#ffffff8a` (.54) |
| 800 | `#00000082` (.51) | `#ffffff78` (.47) |
| 900 | `#000000b3` (.70) | `#ffffff9c` (.61) |
| 1000 | `#000000e8` (.91) | `#ffffffeb` (.92) |

### 3.4 Accent color scales

Seven hue scales, each 100→1000 (100 = lightest tint, ~600/700 = pure brand hue, 1000 = darkest). Light and dark are tuned independently. Step **700** is the canonical "base" of each hue.

#### Blue (primary accent / links / focus)
| Step | Light | Dark |
|---|---|---|
| 100 | `#f0f7ff` | `#06193a` |
| 200 | `#eaf4ff` | `#022248` |
| 300 | `#e0efff` | `#002f62` |
| 400 | `#cce7ff` | `#003771` |
| 500 | `#97ccff` | `#004287` |
| 600 | `#51aeff` | `#0090ff` |
| **700** | **`#0070f7`** | **`#0071f6`** |
| 800 | `#005edc` | `#005fd8` |
| 900 | `#0064e2` | `#50a8ff` |
| 1000 | `#002453` | `#ebf6ff` |

#### Red (error / destructive)
| Step | Light | Dark |
|---|---|---|
| 100 | `#ffeef0` | `#330a11` |
| 200 | `#ffe9ea` | `#440d13` |
| 300 | `#ffe4e5` | `#5d0e17` |
| 400 | `#ffd8d7` | `#6f101b` |
| 500 | `#ffb5b6` | `#88151f` |
| 600 | `#ff6a6e` | `#f32e40` |
| **700** | **`#fc0035`** | **`#f13242`** |
| 800 | `#e70022` | `#e2162a` |
| 900 | `#d60020` | `#ff5e63` |
| 1000 | `#46000c` | `#ffeaed` |

#### Amber (warning)
| Step | Light | Dark |
|---|---|---|
| 100 | `#fff6e1` | `#291800` |
| 200 | `#fff4d4` | `#331b00` |
| 300 | `#fff1c8` | `#4f2900` |
| 400 | `#ffdd84` | `#573200` |
| 500 | `#ffc85e` | `#6c4100` |
| 600 | `#ffaa00` | `#e99c00` |
| **700** | **`#ffb200`** | **`#ffb200`** |
| 800 | `#ff9900` | `#ff9900` |
| 900 | `#a64f00` | `#ff9900` |
| 1000 | `#541c00` | `#fff3d9` |

#### Green (success)
| Step | Light | Dark |
|---|---|---|
| 100 | `#ecfdec` | `#00250a` |
| 200 | `#e5fce7` | `#003110` |
| 300 | `#d3fad1` | `#003814` |
| 400 | `#b9f5bc` | `#004616` |
| 500 | `#82eb8d` | `#00661d` |
| 600 | `#4ce15e` | `#009431` |
| **700** | **`#28a948`** | **`#00ab3e`** |
| 800 | `#279141` | `#009335` |
| 900 | `#107d32` | `#00ca52` |
| 1000 | `#00370d` | `#daffe5` |

#### Teal
| Step | Light | Dark |
|---|---|---|
| 100 | `#dffffb` | `#00211b` |
| 200 | `#ddfef6` | `#002922` |
| 300 | `#ccf9f1` | `#003b33` |
| 400 | `#b1f7ec` | `#003f35` |
| 500 | `#52f0db` | `#005f53` |
| 600 | `#00e2c4` | `#009885` |
| **700** | **`#00a694`** | **`#00a794`** |
| 800 | `#008d7d` | `#008d7d` |
| 900 | `#007a6e` | `#00c9b5` |
| 1000 | `#003d34` | `#cefff5` |

#### Purple
| Step | Light | Dark |
|---|---|---|
| 100 | `#f9f0ff` | `#290c33` |
| 200 | `#f9f1ff` | `#341142` |
| 300 | `#f5e8ff` | `#47185e` |
| 400 | `#f1d9ff` | `#541a76` |
| 500 | `#dda9ff` | `#642290` |
| 600 | `#c77dff` | `#9440d5` |
| **700** | **`#9f00f4`** | **`#9440d5`** |
| 800 | `#8400cd` | `#7d2bba` |
| 900 | `#7c00c9` | `#c472fb` |
| 1000 | `#2e004d` | `#faedff` |

#### Pink
| Step | Light | Dark |
|---|---|---|
| 100 | `#ffeaf5` | `#310d1e` |
| 200 | `#ffeaf2` | `#420c25` |
| 300 | `#ffe0eb` | `#571032` |
| 400 | `#ffd5e1` | `#5d0c34` |
| 500 | `#fdb3cc` | `#76063f` |
| 600 | `#f97ea7` | `#b90056` |
| **700** | **`#f22782`** | **`#f12b82`** |
| 800 | `#e4106e` | `#e6006e` |
| 900 | `#c41562` | `#ff518d` |
| 1000 | `#460523` | `#ffeaf4` |

> Each step also exists as an `-value` HSL triplet (e.g. `--ds-blue-700-value: 212, 100%, 48%`) and, for `.invert-theme`, as OKLCH. See the appendix for the HSL list.

### 3.5 Semantic / status colors (legacy `--geist-*`)

These predate the `--ds-*` scales and are still used for status messaging. Each has `lighter / light / (base) / dark` ramps.

| Family | lighter | light | base | dark |
|---|---|---|---|---|
| **Success** (blue) | `#d3e5ff` | `#3291ff` | `#0070f3` | `#0761d1` |
| **Error** (light) | `#f7d4d6` | `#ff1a1a` | `#ee0000` | `#c50000` |
| **Error** (dark theme) | — | `#ff3333` | `red` | `#e60000` |
| **Warning** | `#ffefcf` | `#f7b955` | `#f5a623` | `#ab570a` |
| **Violet** | `#d8ccf1` | `#8a63d2` | `#7928ca` | `#4c2889` |
| **Cyan** | `#aaffec` | `#79ffe1` | `#50e3c2` | `#29bc9b` |

**Highlight colors** (vivid, for code/marketing accents): purple `#f81ce5`, magenta `#eb367f`, pink `#ff0080`, yellow `#fff500`.

### 3.6 Foreground, links, selection

| Token | Light | Dark | Notes |
|---|---|---|---|
| `--geist-foreground` | `#000` | `#fff` | text/icon ink |
| `--geist-background` | `#fff` | `#000` | page bg |
| `--geist-link-color` | `--ds-blue-700` (`#0070f7`) | `--ds-blue-900` (`#50a8ff`) | inline links |
| `--geist-selection` (bg) | `--ds-gray-1000` | `--ds-gray-1000` | ::selection background |
| `--geist-selection-text-color` | `--ds-gray-100` | `--ds-gray-100` | ::selection text |
| `--ds-focus-color` | `--ds-blue-700` | `--ds-blue-900` | focus ring color |
| `--ds-contrast-fg` | `#fff` | `#fff` | text on colored fills |

### 3.7 Legacy accents scale (`--accents-1…8`)

A simpler neutral ramp still referenced by older components (mirrors gray, inverts per theme):

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| Light | `#fafafa` | `#eaeaea` | `#999` | `#888` | `#666` | `#444` | `#333` | `#111` |
| Dark | `#111` | `#333` | `#444` | `#666` | `#888` | `#999` | `#eaeaea` | `#fafafa` |

---

## 4. Typography

### 4.1 Font families

```css
--font-sans: "Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
             "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
             "Droid Sans", "Helvetica Neue", sans-serif;

--font-mono: "Geist Mono", Menlo, Monaco, "Lucida Console", "Liberation Mono",
             "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace;
```

- **Geist Sans** — UI + display.
- **Geist Mono** — code, eyebrows/labels, technical microcopy, numerals in data.
- Pixel display faces (`--font-geist-pixel-*`) for special marketing headlines.

### 4.2 Font weights

| Token | Value |
|---|---|
| `--font-weight-thin` | 100 |
| `--font-weight-light` | 300 |
| `--font-weight-normal` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |
| `--font-weight-extrabold` | 800 |

Practical usage: **body = 400**, **emphasis/`<strong>` = 500**, **UI headings = 600**, **buttons = 500**. Marketing display headings often override to **400** (normal) at huge sizes.

### 4.3 Semantic type scale (the real system)

Geist composes type via four named ramps. Each utility sets font-family + size + line-height + weight (+ tracking for headings) at once. **`<strong>` inside copy/label/heading bumps to weight 500.**

#### `text-heading-*` — Geist Sans, weight **600**, negative tracking
| Class | Size | Line-height | Letter-spacing |
|---|---|---|---|
| `text-heading-14` | 14px | 20px | -0.28px (-0.02em) |
| `text-heading-16` | 16px | 24px | -0.32px (-0.02em) |
| `text-heading-20` | 20px | 26px | -0.40px (-0.02em) |
| `text-heading-24` | 24px | 32px | -0.96px (-0.04em) |
| `text-heading-32` | 32px | 40px | -1.28px (-0.04em) |
| `text-heading-40` | 40px | 48px | -2.40px (-0.06em) |
| `text-heading-48` | 48px | 56px | -2.88px (-0.06em) |
| `text-heading-56` | 56px | 56px | -3.36px (-0.06em) |
| `text-heading-64` | 64px | 64px | -3.84px (-0.06em) |
| `text-heading-72` | 72px | 72px | -4.32px (-0.06em) |

> Tracking law: ≤20px → **-0.02em**, 24–32px → **-0.04em**, ≥40px → **-0.06em**. Large headings use `line-height: 1`.

#### `text-copy-*` — Geist Sans, weight **400** (body / prose)
| Class | Size | Line-height |
|---|---|---|
| `text-copy-13` | 13px | 18px |
| `text-copy-14` | 14px | 20px |
| `text-copy-16` | 16px | 24px |
| `text-copy-18` | 18px | 28px |
| `text-copy-20` | 20px | 36px |
| `text-copy-24` | 24px | 36px |
| `text-copy-13-mono` | 13px | 18px (Geist Mono) |
| `text-copy-14-mono` | 14px | 20px (Geist Mono) |

#### `text-label-*` — Geist Sans, weight **400** (UI labels, tight LH)
| Class | Size | Line-height |
|---|---|---|
| `text-label-12` | 12px | 16px |
| `text-label-13` | 13px | 16px |
| `text-label-14` | 14px | 20px |
| `text-label-16` | 16px | 20px |
| `text-label-18` | 18px | 20px |
| `text-label-20` | 20px | 32px |
| `text-label-12-mono` | 12px | 16px (Geist Mono) |
| `text-label-13-mono` | 13px | 20px (Geist Mono) |
| `text-label-14-mono` | 14px | 20px (Geist Mono) |

#### `text-button-*` — Geist Sans, weight **500** (interactive labels)
| Class | Size | Line-height |
|---|---|---|
| `text-button-12` | 12px | 16px |
| `text-button-14` | 14px | 20px |
| `text-button-16` | 16px | 20px |

All four ramps have responsive variants: `sm: md: lg: xl:` (media) and `@sm: @md: @lg: @xl:` (container queries), e.g. `text-heading-48 @sm:text-heading-64`.

### 4.4 Raw Tailwind text sizes (utility layer)

| Token | Size | Line-height |
|---|---|---|
| `--text-xs` | .75rem (12px) | calc(1/.75) ≈ 16px |
| `--text-sm` | .875rem (14px) | calc(1.25/.875) ≈ 20px |
| `--text-base` | 1rem (16px) | calc(1.5/1) = 24px |
| `--text-lg` | 1.125rem (18px) | ≈ 28px |
| `--text-xl` | 1.25rem (20px) | ≈ 28px |
| `--text-2xl` | 1.5rem (24px) | ≈ 32px |
| `--text-3xl` | 1.875rem (30px) | ≈ 36px |
| `--text-4xl` | 2.25rem (36px) | ≈ 40px |
| `--text-5xl` | 3rem (48px) | 1 |
| `--text-7xl` | 4.5rem (72px) | 1 |
| `--text-8xl` | 6rem (96px) | 1 |

### 4.5 Fluid type (responsive clamp tokens)

For headings that scale with viewport (`vi` = viewport-inline):

| Token | Value |
|---|---|
| `--text-fluid-14-16` | `clamp(.875rem, .6607rem + .3571vi, 1rem)` |
| `--text-fluid-14-20` | `clamp(.875rem, .2321rem + 1.0714vi, 1.25rem)` |
| `--text-fluid-16-20` | `clamp(1rem, .5714rem + .7143vi, 1.25rem)` |
| `--text-fluid-16-28` | `clamp(1rem, -.2857rem + 2.1429vi, 1.75rem)` |
| `--text-fluid-18-24` | `clamp(1.125rem, .4821rem + 1.0714vi, 1.5rem)` |
| `--text-fluid-20-28` | `clamp(1.25rem, .3929rem + 1.4286vi, 1.75rem)` |
| `--text-fluid-20-32` | `clamp(1.25rem, -.0357rem + 2.1429vi, 2rem)` |
| `--text-fluid-20-80` | `clamp(1.25rem, -5.1786rem + 10.7143vi, 5rem)` |
| `--text-fluid-24-32` | `clamp(1.5rem, .6429rem + 1.4286vi, 2rem)` |
| `--text-fluid-32-64` | `clamp(2rem, -1.4286rem + 5.7143vi, 4rem)` |
| `--text-fluid-32-80` | `clamp(2rem, -3.1429rem + 8.5714vi, 5rem)` |
| `--text-fluid-64-128` | `clamp(4rem, -2.8571rem + 11.4286vi, 8rem)` |

### 4.6 Letter-spacing & line-height tokens

| Tracking | Value | | Leading | Value |
|---|---|---|---|---|
| `--tracking-tighter` | -.05em | | `--leading-tight` | 1.25 |
| `--tracking-tight` | -.025em | | `--leading-normal` | 1.5 |
| `--tracking-normal` | 0em | | `--leading-relaxed` | 1.625 |
| `--tracking-wider` | .05em | | | |

---

## 5. Spacing

### 5.1 Base unit (Tailwind v4)

```css
--spacing: 0.25rem; /* 4px — all p-*, m-*, gap-* multiply this */
```
`p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px, `p-12` = 48px, `p-16` = 64px …

### 5.2 Geist explicit scale (px-named)

| Token | px | | Token | px |
|---|---|---|---|---|
| `--geist-space` | 4 | | `--geist-space-10x` | 40 |
| `--geist-space-2x` | 8 | | `--geist-space-16x` | 64 |
| `--geist-space-3x` | 12 | | `--geist-space-24x` | 96 |
| `--geist-space-4x` | 16 | | `--geist-space-32x` | 128 |
| `--geist-space-6x` | 24 | | `--geist-space-48x` | 192 |
| `--geist-space-8x` | 32 | | `--geist-space-64x` | 256 |

Each also has a `-negative` counterpart (e.g. `--geist-space-8x-negative: -32px`).

### 5.3 Named spacing

| Token | Value |
|---|---|
| `--geist-space-small` | 32px |
| `--geist-space-medium` | 40px |
| `--geist-space-large` | 48px |
| `--geist-gap` / `--geist-space-gap` | 24px |
| `--geist-gap-half` | 12px |
| `--geist-gap-quarter` | 8px |
| `--geist-gap-double` | 48px |
| `--geist-page-margin` | 24px (= gap) |

### 5.4 Fluid spacing

| Token | Value |
|---|---|
| `--spacing-fluid-16-24` | `clamp(1rem, .1429rem + 1.4286vi, 1.5rem)` |
| `--spacing-fluid-20-24` | `clamp(1.25rem, .8214rem + .7143vi, 1.5rem)` |
| `--spacing-fluid-20-32` | `clamp(1.25rem, -.0357rem + 2.1429vi, 2rem)` |
| `--spacing-fluid-24-40` | `clamp(1.5rem, -.2143rem + 2.8571vi, 2.5rem)` |

---

## 6. Layout & sizing

### 6.1 Page widths

| Token | Value | Use |
|---|---|---|
| `--ds-page-width` | **1400px** | modern max content width |
| `--ds-page-width-with-margin` | `page-width + 2×margin` | incl. gutters |
| `--geist-page-width` | **1200px** | legacy content width |
| `--geist-page-margin` | 24px | horizontal gutter |

### 6.2 Container scale (`max-w-*` named widths)

| Token | Value |
|---|---|
| `--container-xs` | 20rem (320px) |
| `--container-sm` | 401px |
| `--container-md` | 601px |
| `--container-lg` | 961px |
| `--container-xl` | 1200px |
| `--container-2xl` | 1400px |
| `--container-3xl` | 48rem (768px) |
| `--container-4xl` | 56rem (896px) |
| `--container-5xl` | 64rem (1024px) |

### 6.3 Chrome heights

| Token | Value |
|---|---|
| `--header-height` | 64px |
| `--header-height-expanded` | 100px (sticky-grow header at top) |
| `--header-height-collapsed` | 64px (after scroll) |
| `--header-sub-menu-height` | 46px |
| `--footer-height` | 79px |
| `--banner-height` | 0 → 40px (when a banner is shown) |
| `--banner-min-height` | 64px |
| `--tabs-height` | 48px |
| `--header-zindex` | 75 |

---

## 7. Radius

| Utility | Token / value | px |
|---|---|---|
| `rounded-none` | 0 | 0 |
| `rounded-sm` | .25rem | 4 |
| `rounded` (DEFAULT) | .25rem | 4 |
| `rounded-md` | .375rem | 6 |
| `rounded-lg` | .5rem | 8 |
| `rounded-xl` | .75rem | 12 |
| `rounded-2xl` | 1rem | 16 |
| `rounded-3xl` | `--radius-3xl` = 1.5rem | 24 |
| `rounded-4xl` | `--radius-4xl` = 2rem | 32 |
| `rounded-full` | 9999px | pill / circle |

Component defaults:
- `--geist-radius`: **6px** — default control radius (buttons, inputs, small cards).
- `--geist-marketing-radius`: **8px** — marketing cards/surfaces.

---

## 8. Shadows & elevation

Geist elevation is **border-first**: most "shadows" are actually a 1px translucent ring (`--ds-shadow-border-*`), with soft drop shadows layered only for floating surfaces. In **dark mode** the drop component largely disappears and the hairline border carries the separation.

### 8.1 Modern `--ds-shadow-*`

| Token | Light value |
|---|---|
| `--ds-shadow-border-base` | `0 0 0 1px #00000014` (dark: `#ffffff25`) |
| `--ds-shadow-border-inset` | `inset 0 0 0 1px #00000014` (dark: `#ffffff1a`) |
| `--ds-shadow-border` | `border-base, background-border` |
| `--ds-shadow-2xs` | `0px 1px 1px #0000000a` |
| `--ds-shadow-xs` | `0px 1px 2px #0000000a` |
| `--ds-shadow-small` | `0px 2px 2px #0000000a` |
| `--ds-shadow-medium` | `0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a` |
| `--ds-shadow-large` | `0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a` |
| `--ds-shadow-xl` | `0px 1px 1px #00000005, 0px 4px 8px -4px #0000000a, 0px 16px 24px -8px #0000000f` |
| `--ds-shadow-2xl` | `0px 1px 1px #00000005, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f` |

Composed surface tokens (border ring + drop, for popovers):
- `--ds-shadow-tooltip`, `--ds-shadow-menu`, `--ds-shadow-modal`, `--ds-shadow-fullscreen` — each = `border-base, <drop layers>, background-border`.
- `--ds-shadow-border-small/medium/large` — border ring + matching drop.

### 8.2 Legacy `--shadow-*` (drop shadows; become hairline borders in dark)

| Token | Light | Dark |
|---|---|---|
| `--shadow-smallest` | `0px 2px 4px #0000001a` | `0 0 0 1px var(--accents-2)` |
| `--shadow-extra-small` | `0px 4px 8px #0000001f` | `0 0 0 1px var(--accents-2)` |
| `--shadow-small` | `0 5px 10px #0000001f` | `0 0 0 1px var(--accents-2)` |
| `--shadow-medium` | `0 8px 30px #0000001f` | `0 0 0 1px var(--accents-2)` |
| `--shadow-large` / `--shadow-hover` | `0 30px 60px #0000001f` | hairline / foreground ring |
| `--shadow-sticky` | `0 12px 10px -10px #0000001f` | `0 0 0 1px var(--accents-2)` |

---

## 9. Borders & focus

- **Default border color:** `--ds-gray-200` / `--ds-gray-300` (or `gray-alpha-*` over imagery). On dark the page header border is `0 1px 0 0 #ffffff1a`.
- **Hairline pattern:** prefer `box-shadow: var(--ds-shadow-border)` over `border` so it doesn't affect layout box size.

**Focus rings** (keyboard a11y):
```css
--ds-focus-color:        var(--ds-blue-700);  /* dark: --ds-blue-900 */
--ds-focus-ring:         0 0 0 2px var(--ds-background-100), 0 0 0 4px var(--ds-focus-color);
--ds-focus-ring-outline: 2px solid var(--ds-focus-color);
--ds-focus-border:       0 0 0 1px var(--ds-gray-alpha-600), 0px 0px 0px 4px #00000029; /* dark: …#ffffff3d */
```
Observed inline-link pattern: `outline: 2px solid var(--ds-focus-color); outline-offset: 4px` on `:focus-visible`.

Overlay backdrop: `--ds-overlay-backdrop-color: var(--ds-background-200)` at `--ds-overlay-backdrop-opacity: .8`.

---

## 10. Motion

| Token | Value |
|---|---|
| `--default-transition-duration` | **0.15s** |
| `--default-transition-timing-function` | `cubic-bezier(.4, 0, .2, 1)` (standard ease-in-out) |
| `--ease-in` | `cubic-bezier(.4, 0, 1, 1)` |
| `--ease-out` | `cubic-bezier(0, 0, .2, 1)` |
| `--ease-in-out` | `cubic-bezier(.4, 0, .2, 1)` |
| `--ds-motion-timing-swift` | `cubic-bezier(.175, .885, .32, 1.1)` (slight overshoot) |
| `--ds-motion-overlay-duration` | 0.3s · timing = swift · scale from `.96` |
| `--ds-motion-popover-duration` | 0.2s · timing = swift |
| Header grow/shrink | duration 0.35s · `cubic-bezier(.455, .03, .515, .955)` |

Default interactive transition (buttons/links): `all 0.15s cubic-bezier(.4, 0, .2, 1)`.

---

## 11. Blur & effects

| Token | Value |
|---|---|
| `--blur-xs` | 4px |
| `--blur-sm` | 8px |
| `--blur-lg` | 16px |
| `--blur-xl` | 24px |

Used for frosted header backgrounds, e.g. `--header-import-flow-background: #fafafacc` (light) / `#111c` (dark) with backdrop blur.

---

## 12. Breakpoints

Primary responsive breakpoints observed in the live CSS (min-width), aligned with the container scale:

| Name | min-width | Notes |
|---|---|---|
| (base) | 0 | mobile-first |
| `sm` | ~600–601px | |
| `md` | ~960–961px | |
| `lg` | 1200px | |
| `xl` | 1400px | matches `--ds-page-width` |

Geist also relies heavily on **container queries** (`@sm: @md: @lg: @xl:` variants) for component-local responsiveness, independent of viewport. Numerous bespoke breakpoints exist for specific marketing modules (375, 768, 992, 1080, 1240, 1496, 1600px …) but the five above are the system spine.

---

## 13. Components

### 13.1 Buttons

Two visual systems share sizing tokens:

**App / Geist Button** (default radius `--geist-radius` = 6px):

| Size | Height | Padding-x | Type | Radius |
|---|---|---|---|---|
| small | 32px | ~8–12px | `text-button-14` (14/20, w500) | 6px |
| default | 40px | ~12–14px | `text-button-14` | 6px |
| large | 48px | ~16px | `text-button-16` (16/20, w500) | 6px |

**Marketing CTA Button** (observed on homepage): same heights but **`rounded-full` (pill)**.

| Variant | BG | Text | Border |
|---|---|---|---|
| **Primary** | foreground (`#ededed` dark / `#171717` light) | background (`#0a0a0a` dark / `#fff` light) | none |
| **Secondary** | surface `--ds-background-100` (`#0a0a0a` dark) | `--ds-gray-1000` | `box-shadow: 0 0 0 1px var(--ds-gray-400)` (`#2e2e2e` dark) |

Common: `font-weight: 500`, `transition: all .15s cubic-bezier(.4,0,.2,1)`, `outline: none`, `cursor: pointer`. Measured examples:
- Header buttons (`Get a Demo`, `Log In`, `Sign Up`): height **32px**, radius **6px**, padding `0 6px`, 14px/500.
- Hero CTAs (`Deploy Now`, `Talk to Sales`): height **40px**, radius **full**, padding `0 12px`, 14px/500.

### 13.2 Form controls (sizing)

| Token group | small | default | large |
|---|---|---|---|
| height | `--geist-form-small-height` 32px | `--geist-form-height` 40px | `--geist-form-large-height` 48px |
| font-size | .875rem (14px) | .875rem (14px) | 1rem (16px) |
| line-height | .875rem | 1.25rem | 1.5rem |

Inputs: surface = `--ds-background-100`, border = `--ds-gray-alpha-*` / `gray-400`, radius `--geist-radius` (6px), focus → `--ds-focus-ring`. Placeholder = `--ds-gray-600`.

### 13.3 Links

- Standalone inline link: color `--geist-link-color` (blue-700 light / blue-900 dark), `:focus-visible` → `outline: 2px solid var(--ds-focus-color); outline-offset: 4px`.
- Nav/utility links often inherit foreground (`--ds-gray-1000`) and rely on hover opacity/arrow nudge rather than underline.

### 13.4 Eyebrow / label (signature)

Geist Mono · 12px · weight 400 · line-height 16px · `letter-spacing: .6px` (≈ +0.05em / `tracking-wider`) · **UPPERCASE** · color `--ds-gray-700` (`#8f8f8f`). This is the "FOR CODING AGENTS" microcopy style throughout the site.

### 13.5 Surfaces / cards

- Background: `--ds-background-100` (raised) on a `--ds-background-200` page.
- Separation: `box-shadow: var(--ds-shadow-border)` (1px ring) — not a CSS border — optionally + `--ds-shadow-small/medium` for lift.
- Radius: `--geist-marketing-radius` (8px) for marketing cards; `rounded-xl`/`2xl` for larger panels.

### 13.6 Overlays (modal / menu / tooltip / popover)

- Shadow: `--ds-shadow-modal` / `--ds-shadow-menu` / `--ds-shadow-tooltip` (border ring + soft drop + bg ring).
- Enter motion: scale from `.96` → 1, duration .2–.3s, timing `--ds-motion-timing-swift`.
- Backdrop: `--ds-background-200` @ 80% opacity.

### 13.7 Header / nav

Height 64px (grows to 100px at very top when sticky-grow is enabled, collapses to 64px on scroll over 0.35s), `z-index: 75`, bottom border `0 1px 0 0 #ffffff1a` (dark), frosted translucent background with blur. Layout: triangle logo (start) · primary nav · auth/CTA buttons (end).

---

## 14. Signature recipes

**Display hero heading**
```css
font-family: var(--font-sans);
font-size: clamp(48px, 8vi, 110px);
font-weight: 400;            /* normal, not bold — the Geist hero look */
line-height: 1;
letter-spacing: -0.06em;     /* tight */
color: var(--ds-gray-1000);
text-wrap: balance;
```

**UI section heading**
```css
/* = text-heading-32 */
font: 600 32px/40px var(--font-sans);
letter-spacing: -1.28px;     /* -0.04em */
color: var(--ds-gray-1000);
```

**Eyebrow label**
```css
font: 400 12px/16px var(--font-mono);
letter-spacing: 0.05em;
text-transform: uppercase;
color: var(--ds-gray-700);
```

**Bordered surface (theme-safe, no layout shift)**
```css
background: var(--ds-background-100);
border-radius: 8px;          /* --geist-marketing-radius */
box-shadow: var(--ds-shadow-border);   /* 1px translucent ring */
/* add var(--ds-shadow-medium) when floating */
```

**Primary button**
```css
height: 40px; padding-inline: 12px;
border-radius: 9999px;       /* pill (marketing) or 6px (app) */
background: var(--ds-gray-1000);   /* foreground */
color: var(--ds-background-100);   /* background */
font: 500 14px/20px var(--font-sans);
transition: all .15s cubic-bezier(.4,0,.2,1);
```

**Focus ring**
```css
outline: none;
box-shadow: var(--ds-focus-ring);  /* 2px bg gap + 4px blue */
/* or: outline: 2px solid var(--ds-focus-color); outline-offset: 4px; */
```

---

## 15. Implementation notes (porting Geist)

- **Two-tier color:** keep both the static hex (`--ds-blue-700`) and the HSL triplet (`--ds-blue-700-value`). Apply custom alpha with `hsla(var(--ds-blue-700-value), .12)` for tints (badges, hovers) without adding new tokens.
- **Theme switching:** scope every semantic token under `.light-theme` / `.dark-theme`; provide `.invert-theme` to flip locally. Default the document to dark if matching vercel.com.
- **Elevation = border, not shadow:** lead with `--ds-shadow-border`; add drop shadows only for floating layers. This is what makes dark mode read cleanly.
- **Type via composite utilities:** replicate `text-{heading|copy|label|button}-{size}` classes that set family+size+line-height+weight(+tracking) together, each with `sm:/md:/lg:/xl:` and container `@sm:/@md:/…` variants. Make `<strong>` inside them = weight 500.
- **Display headings:** large sizes use `font-weight: 400` + tight negative tracking + `line-height: 1`; UI headings use `font-weight: 600`. Don't bold the giant hero.
- **Mono for the technical voice:** eyebrows, code, data numerals, and badges use Geist Mono — it's a core part of the brand voice, not just for code.
- **Tailwind v4:** the site is Tailwind v4 (`--spacing: .25rem`, `--text-*`, `--container-*`, `--radius-*`, `@theme`-style tokens). Port tokens into an `@theme` block to get matching utilities for free.
- **Tooling:** the official packages are **`geist`** (the font, on npm) and Vercel's **Geist UI / `@vercel/geist`** component primitives + the public docs at `vercel.com/geist` and `vercel.com/font`. This document captures the *applied* values so the system can be reproduced without those packages.

---

## 16. Appendix — condensed token reference

### 16.1 HSL value triplets (consume via `hsla(var(--…-value), a)`)

**Gray** (light → dark): 100 `0 0% 95` → `0 0% 10` · 200 `0 0% 92`/`0 0% 12` · 300 `0 0% 90`/`0 0% 16` · 400 `0 0% 92`/`0 0% 18` · 500 `0 0% 79`/`0 0% 27` · 600 `0 0% 66`/`0 0% 53` · 700 `0 0% 56`/`0 0% 56` · 800 `0 0% 49`/`0 0% 49` · 900 `0 0% 30`/`0 0% 63` · 1000 `0 0% 9`/`0 0% 93`.

**Background:** 100 `0 0% 100`/`0 0% 4` · 200 `0 0% 98`/`0 0% 0`.

**Blue:** 600 `208 100% 66`/`206 100% 50` · 700 `212 100% 48`/`212 100% 48` · 900 `211 100% 42`/`210 100% 66`.
**Red:** 700 `358 75% 59` (both) · 800 `358 70% 52`/`358 69% 52`.
**Amber:** 700 `39 100% 57` (both) · 800 `35 100% 52` (both).
**Green:** 700 `131 41% 46` (both) · 900 `133 50% 32`/`131 43% 57`.
**Teal:** 700 `173 80% 36` (both) · 900 `174 91% 25`/`174 90% 41`.
**Purple:** 700 `272 51% 54` (both) · 900 `274 71% 43`/`275 80% 71`.
**Pink:** 700 `336 80% 58` (both) · 900 `336 65% 45`/`341 90% 67`.

*(Full 100–1000 triplets for every hue exist as `--ds-<hue>-<step>-value`; the base/700 and inflection steps are listed here — derive the rest from the hex tables in §3.4.)*

### 16.2 Token namespaces summary

| Prefix | Count(ish) | Purpose |
|---|---|---|
| `--ds-*` | ~260 | Modern Geist: color scales (+`-value`), shadows, focus, motion, page width |
| `--geist-*` | ~120 | Legacy Geist: foreground/bg, status colors, spacing scale, radii, form sizing |
| `--text-*` / `--font-*` / `--tracking-*` / `--leading-*` | ~70 | Tailwind v4 typography layer + fluid type |
| `--container-*` / `--spacing*` | ~20 | Tailwind sizing / spacing |
| `--radius-*` / `--blur-*` / `--ease-*` / `--aspect-*` | ~12 | Tailwind misc |
| `--accents-1…8` | 8 | Legacy neutral ramp |
| `--header-*` / `--footer-*` / `--banner-*` / `--tabs-*` | ~15 | Chrome layout |
| `--tw-*` | ~150 | Tailwind internal (not design tokens) |

### 16.3 Capture method

1. Loaded `https://vercel.com/home` in headless Chrome (DevTools protocol).
2. Walked all 4 same-origin stylesheets (9,279 rules) and collected every `--*` custom-property declaration grouped by selector → recovered both light and dark values.
3. Read `getComputedStyle()` on rendered `h1/h2/h3/p/body`, buttons, links, inputs for applied values.
4. Extracted the `text-{heading|copy|label|button}-*` utility class definitions directly from the CSSOM.
5. Cross-checked against screenshots (`assets/`).

> All values are as served on the capture date; Vercel iterates on Geist, so re-run the capture to refresh.
