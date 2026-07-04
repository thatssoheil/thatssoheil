# Hero Motto Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the hero motto above the centered scroll cue and make it feel like a quiet agentic caption: readable first, then ambient cipher pulses, subtle spectral flow, and a looping `Coding`/`Prompting` transition.

**Architecture:** The motto becomes its own small client component so timed phrase-swapping does not clutter `HeroSection`. The shared cipher path gains a settled-first mode used only by the motto on initial render; later phrase swaps remount the cipher text in scrambled mode, giving the word-length change a deliberate decode window. CSS owns the subtle spectral coloring and respects reduced motion.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS utility classes, existing `CipherText` / cipher engine, CSS keyframes, Chrome DevTools Protocol geometry checks.

## Global Constraints

- Keep the motto font-size aligned with the hero eyebrow.
- Preserve the motto as a single centered line.
- Move the motto out of the name lockup and place it above the centered scroll cue.
- The motto must be readable immediately on load; do not replay the name's page-load decode on the first motto render.
- Random individual motto characters should briefly cipher and decipher in a loop while the user is visiting.
- Alternate the first word between `Coding` and `Prompting` in a loop.
- During first-word swaps, use a cipher/decode transition so the character-count change feels intentional.
- Add a CSS-only low-opacity spectral sheen that comes and goes slowly.
- Reduced-motion users see a stable readable motto with no swapping, no ambient pulses, and no shimmer.
- Do not change the name size, eyebrow layout, grid rail placement, header, or section spacing.
- Maintain no horizontal overflow on narrow mobile widths.

---

### Task 1: Add Settled-First Ambient Cipher Mode

**Files:**
- Modify: `src/components/matrix/cipher-engine.ts`
- Modify: `src/hooks/use-cipher-animation.ts`
- Modify: `src/components/matrix/cipher-text.tsx`

**Interfaces:**
- Consumes: Existing `CipherText` props and `createCipherEngine` config.
- Produces: New optional `initialState?: "scrambled" | "settled"` prop on `CipherText`. Default remains `"scrambled"` so the hero name behavior is unchanged.

- [ ] **Step 1: Extend the engine config**

In `src/components/matrix/cipher-engine.ts`, add `initialState` to `CipherConfig`:

```ts
  /** Initial visual state. "settled" starts readable and only runs ambient pulses. */
  initialState?: "scrambled" | "settled";
```

Inside `createCipherEngine`, destructure it with a default:

```ts
    initialState = "scrambled",
```

After `const cs: CharState[] = chars.map((_, i) => makeCharState(i, "spinning"));`, add:

```ts
  if (initialState === "settled" && !reducedMotion) {
    for (let i = 0; i < cs.length; i++) {
      cs[i].char = chars[i];
      cs[i].blur = 0;
      cs[i].brightness = 1;
      cs[i].scale = 1;
      cs[i].opacity = 1;
      cs[i].tint = 0;
      cs[i].phase = "locked";
    }
    gPhase = ambientActive ? "ambient" : "revealed";
    gElapsed = 0;
    ambientCountdown = nextAmbientDelay();
    done = !ambientActive;
  }
```

- [ ] **Step 2: Pass the option through the hook**

In `src/hooks/use-cipher-animation.ts`, add `initialState` to `CipherAnimationConfig`:

```ts
  initialState: "scrambled" | "settled";
```

Destructure it from `config`, and initialize `triggered` as:

```ts
  const [triggered, setTriggered] = useState(initialState === "settled");
```

Change the initial `display` state to render settled text when requested:

```ts
  const [display, setDisplay] = useState<DisplayChar[]>(() =>
    text.split("").map((ch, i) => {
      if (initialState === "settled") {
        return {
          char: ch,
          blur: 0,
          brightness: 1,
          scale: 1,
          opacity: 1,
          tint: 0,
        };
      }

      return {
        char: ch === " " ? " " : seededChar(i),
        blur: ch === " " ? 0 : scrambleBlur,
        brightness: 1,
        scale: 1,
        opacity: ch === " " ? 1 : scrambleOpacity,
        tint: 0,
      };
    }),
  );
```

Pass `initialState` into both `createCipherEngine` calls.

Update the pre-trigger and trigger effects so settled mode skips page-load scrambling:

```ts
    if (prefersReduced || triggered || initialState === "settled") return;
```

```ts
    if (prefersReduced || initialState === "settled") return;
```

Include `initialState` in dependency arrays that use it.

- [ ] **Step 3: Expose the prop on `CipherText`**

In `src/components/matrix/cipher-text.tsx`, add to `CipherTextProps`:

```ts
  /** Start readable and only run ambient pulses. Default preserves hero-name scramble. */
  initialState?: "scrambled" | "settled";
```

Destructure with default:

```ts
  initialState = "scrambled",
```

Pass it to `useCipherAnimation`:

```ts
    initialState,
```

- [ ] **Step 4: Run targeted checks**

```bash
pnpm typecheck
```

Expected: TypeScript exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/matrix/cipher-engine.ts src/hooks/use-cipher-animation.ts src/components/matrix/cipher-text.tsx
git commit -m "feat(cipher): support settled ambient mode"
```

Expected: one commit, no hero visual changes yet.

---

### Task 2: Add Hero Motto Component

**Files:**
- Create: `src/components/hero/hero-motto.tsx`

**Interfaces:**
- Consumes: `CipherText initialState`, `TAGLINE`, `useReducedMotion`.
- Produces: `HeroMotto`, a client component that starts with `Coding vision into existence`, loops to `Prompting vision into existence`, and remounts `CipherText` in scrambled mode only for later swaps.

- [ ] **Step 1: Create the component**

Create `src/components/hero/hero-motto.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { CipherText } from "@/components/matrix/cipher-text";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { TAGLINE } from "@/lib/constants";

const MOTTO_SWAP_MS = 9000;
const MOTTO_PHRASES = [
	TAGLINE,
	TAGLINE.replace(/^Coding/, "Prompting"),
] as const;

export function HeroMotto() {
	const prefersReduced = useReducedMotion();
	const [phraseIndex, setPhraseIndex] = useState(0);
	const [hasSwapped, setHasSwapped] = useState(false);

	useEffect(() => {
		if (prefersReduced) return;

		const id = window.setInterval(() => {
			setHasSwapped(true);
			setPhraseIndex((current) => (current + 1) % MOTTO_PHRASES.length);
		}, MOTTO_SWAP_MS);

		return () => window.clearInterval(id);
	}, [prefersReduced]);

	const phrase = MOTTO_PHRASES[phraseIndex];

	return (
		<CipherText
			key={phrase}
			text={phrase.toUpperCase()}
			as="p"
			initialState={hasSwapped ? "scrambled" : "settled"}
			ambient={!prefersReduced}
			revealedHold={2600}
			decelDuration={900}
			spinUpDuration={500}
			intensity="normal"
			className="motto-ai-flow pointer-events-none absolute inset-x-6 bottom-28 mx-auto whitespace-nowrap text-center font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] leading-none tracking-[0.16em] text-text-faint uppercase sm:tracking-[0.18em]"
		/>
	);
}
```

- [ ] **Step 2: Run targeted checks**

```bash
pnpm typecheck
```

Expected: TypeScript exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/hero/hero-motto.tsx
git commit -m "feat(hero): add ambient motto component"
```

Expected: one commit creating only `hero-motto.tsx`.

---

### Task 3: Mount Motto Caption And Add Spectral Flow

**Files:**
- Modify: `src/components/sections/hero.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `HeroMotto` from Task 2.
- Produces: Bottom-center motto caption above the scroll cue with ambient cipher behavior and subtle spectral text flow.

- [ ] **Step 1: Update hero imports**

In `src/components/sections/hero.tsx`, add:

```ts
import { HeroMotto } from "@/components/hero/hero-motto";
```

- [ ] **Step 2: Remove the motto from the name lockup**

Delete this paragraph from inside the lockup:

```tsx
<p className="mt-10 whitespace-nowrap font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] leading-none tracking-[0.16em] text-text-faint uppercase sm:mt-12 sm:tracking-[0.18em] md:mt-14">
	Coding vision into existence
</p>
```

- [ ] **Step 3: Mount the bottom-center motto**

After the optional `<HeroChat />` inside the main hero content wrapper, add:

```tsx
<HeroMotto />
```

- [ ] **Step 4: Add subtle AI-flow CSS**

In `src/app/globals.css`, before the reduced-motion block, add:

```css
.motto-ai-flow > span[aria-hidden="true"] > span {
	animation: motto-ai-flow 13s ease-in-out infinite;
}

@keyframes motto-ai-flow {
	0%, 68%, 100% {
		color: var(--text-faint);
		text-shadow: none;
	}
	74% {
		color: color-mix(in oklch, var(--signal-400) 18%, var(--text-faint));
		text-shadow: 0 0 10px color-mix(in oklch, var(--signal-400) 14%, transparent);
	}
	80% {
		color: color-mix(in oklch, oklch(0.78 0.11 310) 16%, var(--text-faint));
		text-shadow: 0 0 10px color-mix(in oklch, oklch(0.78 0.11 310) 12%, transparent);
	}
	86% {
		color: color-mix(in oklch, var(--field-accent) 16%, var(--text-faint));
		text-shadow: 0 0 10px color-mix(in oklch, var(--field-accent) 12%, transparent);
	}
}

@media (prefers-reduced-motion: reduce) {
	.motto-ai-flow > span[aria-hidden="true"] > span {
		animation: none;
		color: var(--text-faint);
		text-shadow: none;
	}
}
```

- [ ] **Step 5: Verify geometry and initial readable state**

Run this browser check against the local dev server:

```bash
node <<'NODE'
const http = require('http');
function get(path){return new Promise((resolve,reject)=>http.get({host:'127.0.0.1',port:9227,path},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve(JSON.parse(d)));}).on('error',reject));}
function once(ws, id){return new Promise((resolve,reject)=>{const on=(event)=>{const msg=JSON.parse(event.data); if(msg.id===id){ws.removeEventListener('message',on); msg.error?reject(JSON.stringify(msg.error)):resolve(msg.result);}}; ws.addEventListener('message',on);});}
(async()=>{const tabs=await get('/json'); const tab=tabs.find(t=>t.url.includes('localhost:3000'))||tabs[0]; const ws=new WebSocket(tab.webSocketDebuggerUrl); let id=0; const send=(method,params={})=>{const i=++id; ws.send(JSON.stringify({id:i,method,params})); return once(ws,i);}; ws.addEventListener('open',async()=>{await send('Page.enable'); await send('Runtime.enable'); for (const [w,h,mobile] of [[390,844,true],[768,1024,true],[1440,900,false]]) { await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:mobile?2:1,mobile}); await send('Page.navigate',{url:'http://localhost:3000/'}); await new Promise(r=>setTimeout(r,1200)); const {result}=await send('Runtime.evaluate',{returnByValue:true,expression:`(() => { const motto=document.querySelector('.motto-ai-flow'); const cue=document.querySelector('#hero button[aria-label="Scroll to content"]'); const eyebrow=[...document.querySelectorAll('#hero p')].find(el=>el.textContent.includes('FRONTEND ENGINEER') || el.textContent.includes('Frontend Engineer')); const mr=motto.getBoundingClientRect(); const cr=cue.getBoundingClientRect(); return {viewport:'${w}x${h}', mottoText:motto.textContent.trim(), mottoFont:getComputedStyle(motto).fontSize, eyebrowFont:getComputedStyle(eyebrow).fontSize, mottoCenter:+((mr.left+mr.right)/2).toFixed(2), pageCenter:+(document.documentElement.clientWidth/2).toFixed(2), mottoToCueGap:+(cr.top-mr.bottom).toFixed(2), mottoOverflow:+Math.max(0, mr.width-document.documentElement.clientWidth).toFixed(2), bottom:+(window.innerHeight-mr.bottom).toFixed(2)} })()`}); console.log(JSON.stringify(result.value,null,2)); } ws.close();});})();
NODE
```

Expected:
- `mottoText` includes `CODING VISION INTO EXISTENCE` shortly after load.
- `mottoFont` equals `eyebrowFont`.
- `mottoCenter` equals `pageCenter` within 0.5px.
- `mottoToCueGap` is positive.
- `mottoOverflow` is `0`.
- `bottom` is about `112px`, matching `bottom-28`.

- [ ] **Step 6: Verify phrase swap**

Run:

```bash
node <<'NODE'
const http = require('http');
function get(path){return new Promise((resolve,reject)=>http.get({host:'127.0.0.1',port:9227,path},res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve(JSON.parse(d)));}).on('error',reject));}
function once(ws, id){return new Promise((resolve,reject)=>{const on=(event)=>{const msg=JSON.parse(event.data); if(msg.id===id){ws.removeEventListener('message',on); msg.error?reject(JSON.stringify(msg.error)):resolve(msg.result);}}; ws.addEventListener('message',on);});}
(async()=>{const tabs=await get('/json'); const tab=tabs.find(t=>t.url.includes('localhost:3000'))||tabs[0]; const ws=new WebSocket(tab.webSocketDebuggerUrl); let id=0; const send=(method,params={})=>{const i=++id; ws.send(JSON.stringify({id:i,method,params})); return once(ws,i);}; ws.addEventListener('open',async()=>{await send('Page.enable'); await send('Runtime.enable'); await send('Emulation.setDeviceMetricsOverride',{width:768,height:1024,deviceScaleFactor:2,mobile:true}); await send('Page.navigate',{url:'http://localhost:3000/'}); await new Promise(r=>setTimeout(r,11500)); const {result}=await send('Runtime.evaluate',{returnByValue:true,expression:`(() => ({ text: document.querySelector('.motto-ai-flow').textContent.trim() }))()`}); console.log(JSON.stringify(result.value,null,2)); ws.close();});})();
NODE
```

Expected: output text includes `PROMPTING` or transitional cipher characters shortly before resolving to `PROMPTING VISION INTO EXISTENCE`.

- [ ] **Step 7: Run repo checks**

```bash
pnpm test
git diff --check
```

Expected:
- `pnpm test` exits 0. Existing eslint resolver warnings about `TSSatisfiesExpression` may print.
- `git diff --check` exits 0.

- [ ] **Step 8: Commit**

```bash
git add src/components/sections/hero.tsx src/app/globals.css
git commit -m "style(hero): mount ambient motto caption"
```

Expected: one commit touching hero and global CSS only.
