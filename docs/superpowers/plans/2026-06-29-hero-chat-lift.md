# Hero Chat "The Lift" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (or subagent-driven-development). Steps use `- [ ]` checkboxes.

**Goal:** Replace the rejected full-page Radix modal with "The Lift" — the hero name morphs (GSAP Flip) into the header of a contained glass card that lifts out of the square; the chat lives in that card.

**Architecture:** A `useChatLift` hook owns the chat state (`useHeroChat`) + `active`/`value` + the GSAP Flip timeline (open/close/mount/resize). `HeroSection` renders the markup it coordinates: the name overlay (the Flip subject) between a resting anchor (`#name-home`) and the card header slot (`#name-slot`), a `#hero-chrome` fade group, the `HeroPlane` (with an `active` fade), and the `ChatPanel`. Validated live at `/lift-mock`.

**Tech Stack:** Next 16 RSC, React 19, GSAP 3.15 + **Flip** plugin, Tailwind v4, the existing chat primitives.

## Global Constraints

- **No test harness** — verify per task = `pnpm exec eslint .` (0) · `pnpm exec tsc --noEmit` (0) · `node scripts/check-tokens.mjs` (0) · `pnpm build` (Compiled). Task 6 adds a live sanity-run.
- **Lint gate is live** — no bare `--signal-*/--ink-*`, no raw color literals, **no inline glass** in `src/components` (compose `<Surface>`/`surfaceVariants`).
- **Reduced motion = instant** — all `Flip.fit`/tweens run `duration: 0` when `prefers-reduced-motion: reduce`.
- **Cipher-settle** uses the existing `ambient` prop: the hero name is `<CipherText ambient={!active} …>` — turning ambient off when active holds the resolved text (no new prop).
- **Commits:** lowercase Conventional Commits, scope `chat` or `hero`. Branch `chore/ds-systematize` — local only; **push stays human-gated.**

---

### Task 1: Register the Flip plugin

**Files:** Modify `src/lib/gsap.ts`.

- [ ] **Step 1:** Add Flip to the registration:
```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

// Register once. Safe to import from any client component.
gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);

ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, Flip, useGSAP };
```
- [ ] **Step 2:** Verify gate green. **Commit:** `chore(hero): Register GSAP Flip plugin`.

---

### Task 2: `useViewportInset` hook (mobile keyboard)

**Files:** Create `src/hooks/use-viewport-inset.ts`.

**Interfaces:** Produces `useViewportInset(enabled: boolean): number` — the pixels the visual viewport is shorter than the layout viewport (≈ the on-screen keyboard inset), `0` when disabled/unsupported.

- [ ] **Step 1:** Create the hook:
```ts
"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
	const vv = window.visualViewport;
	if (!vv) return () => {};
	vv.addEventListener("resize", onChange);
	vv.addEventListener("scroll", onChange);
	return () => {
		vv.removeEventListener("resize", onChange);
		vv.removeEventListener("scroll", onChange);
	};
}

function snapshot() {
	const vv = window.visualViewport;
	if (!vv) return 0;
	// How much the visual viewport is shrunk vs the layout viewport (keyboard).
	return Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
}

const serverSnapshot = () => 0;

/** Pixels the on-screen keyboard occludes (0 when not focused / unsupported). */
export function useViewportInset(enabled: boolean): number {
	const inset = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
	return enabled ? inset : 0;
}
```
- [ ] **Step 2:** Verify gate green. **Commit:** `feat(hero): Add useViewportInset (mobile keyboard) hook`.

---

### Task 3: `useChatLift` hook — state + the Flip timeline

**Files:** Create `src/hooks/use-chat-lift.ts`.

**Interfaces:**
- Consumes: `useHeroChat()`, `gsap`/`Flip` from `@/lib/gsap`, `useReducedMotion`.
- Produces: `useChatLift()` → `{ rootRef, nameRef, active, value, setValue, messages, status, error, send, retry, close }`. The hook runs the Flip morph whenever `active` flips. The component must render, inside `rootRef`: the name element (`nameRef`), `#name-home`, `#name-slot`, `#hero-chrome`, `#lift-card` (ids drive the GSAP selectors, scoped to root).

- [ ] **Step 1:** Create the hook (orchestration validated in `/lift-mock`):
```ts
"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Flip } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useHeroChat } from "@/hooks/use-hero-chat";

export function useChatLift() {
	const chat = useHeroChat();
	const [active, setActive] = useState(false);
	const [value, setValue] = useState("");
	const rootRef = useRef<HTMLElement | null>(null);
	const nameRef = useRef<HTMLElement | null>(null);
	const reduce = useReducedMotion();

	const fit = useCallback(
		(selector: string, duration: number) => {
			const target = rootRef.current?.querySelector(selector);
			if (!target || !nameRef.current) return;
			Flip.fit(nameRef.current, target, {
				scale: true,
				duration: reduce ? 0 : duration,
				ease: "power3.inOut",
			});
		},
		[reduce],
	);

	// Mount: snap the name overlay onto its resting box. Re-fit on resize.
	useGSAP(
		() => {
			fit(active ? "#name-slot" : "#name-home", 0);
			const onResize = () => fit(active ? "#name-slot" : "#name-home", 0);
			window.addEventListener("resize", onResize);
			return () => window.removeEventListener("resize", onResize);
		},
		{ scope: rootRef, dependencies: [active, fit] },
	);

	const open = useCallback(() => {
		setActive(true);
		requestAnimationFrame(() => {
			fit("#name-slot", 0.55);
			gsap.fromTo(
				"#lift-card",
				{ scale: 0.9, autoAlpha: 0, y: 18 },
				{ scale: 1, autoAlpha: 1, y: 0, duration: reduce ? 0 : 0.5, ease: "power3.out" },
			);
			gsap.to("#hero-chrome", { autoAlpha: 0, duration: reduce ? 0 : 0.3 });
			gsap.to("#hero-square", { autoAlpha: 0, duration: reduce ? 0 : 0.45 });
		});
	}, [fit, reduce]);

	const close = useCallback(() => {
		fit("#name-home", 0.5);
		gsap.to("#hero-chrome", { autoAlpha: 1, duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.12 });
		gsap.to("#hero-square", { autoAlpha: 1, duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.12 });
		gsap.to("#lift-card", {
			scale: 0.9,
			autoAlpha: 0,
			y: 18,
			duration: reduce ? 0 : 0.4,
			ease: "power3.in",
			onComplete: () => {
				setActive(false);
				setValue("");
				chat.reset();
			},
		});
	}, [fit, reduce, chat]);

	const send = useCallback(
		(text: string) => {
			const content = text.trim();
			if (!content) return;
			if (!active) open();
			setValue("");
			chat.send(content);
		},
		[active, open, chat],
	);

	return {
		rootRef,
		nameRef,
		active,
		value,
		setValue,
		messages: chat.messages,
		status: chat.status,
		error: chat.error,
		send,
		retry: chat.retry,
		close,
	};
}
```
Note: the GSAP selector strings (`#lift-card` etc.) resolve within `rootRef` because `useGSAP({ scope: rootRef })` scopes them; the `open`/`close` `gsap.to` calls run inside `contextSafe` implicitly via the scoped revert — if a selector resolves globally, prefix with the scope. (Validated in `/lift-mock`.)

- [ ] **Step 2:** Verify gate green. **Commit:** `feat(chat): Add useChatLift hook (state + GSAP Flip timeline)`.

---

### Task 4: Revise `ChatPanel` — name slot, close, focus, a11y, keyboard inset

**Files:** Modify `src/components/hero/chat-panel.tsx`.

**Interfaces:** Consumes `useViewportInset`. Props: `{ active, messages, status, error, value, onChange, onSend, onClose, onRetry }`. Renders `id="lift-card"` with an empty `#name-slot` in its header (the real name lands there — **no** wordmark text of its own), the transcript, the `PromptBar` composer.

- [ ] **Step 1:** Replace the panel body so that: the root is `id="lift-card"` with `role="dialog" aria-modal="false" aria-label="Chat with Soheil"`, `inert={!active}`, glass via `surfaceVariants({ variant: refract ? "refract" : "strong", edge: true, radius: "lg" })`, positioned `absolute inset-0 z-20 m-auto h-[min(80svh,34rem)] w-[min(92vw,40rem)]`, starting hidden (`opacity-0 invisible` — GSAP drives visibility). Apply the keyboard inset as an upward transform: `style={{ transform: inset ? \`translateY(-\${inset}px)\` : undefined }}` (skip when 0; GSAP owns the open/close transform, so only offset while active+focused). The header is `flex items-center justify-between … border-b`; its left child is `<span id="name-slot" aria-hidden className="… opacity-0 [font-family:var(--font-cipher)] text-[0.95rem]">Soheil Fakour</span>` (invisible target box) — keep the small `ask · don't scroll` eyebrow beneath it via a stacked column **inside** the slot's column so it tracks the landed name. Right child = `<IconButton variant="ghost" aria-label="Close chat" onClick={onClose}><X /></IconButton>`. Transcript + error + composer stay as in the current draft (already token-clean, `PromptBar frame="plain"`).
- [ ] **Step 2:** Keep the existing effects: focus the input on `active`; Esc → `onClose`; scroll-to-bottom on messages/status. Add `const inset = useViewportInset(active && busy === false ? true : true)` — simplest: `useViewportInset(active)`.
- [ ] **Step 3:** Remove the leftover full-card transform classes from the draft (the open/close transform is now GSAP-driven via `#lift-card`); keep only static layout + glass classes. Card visibility starts hidden; GSAP reveals it.
- [ ] **Step 4:** Verify gate green. **Commit:** `feat(chat): ChatPanel lands the morphed name + keyboard-aware, non-modal a11y`.

---

### Task 5: Refactor `HeroSection` to drive the Lift

**Files:** Modify `src/components/sections/hero.tsx`; modify `HeroPlane` (same file) to take `active`.

- [ ] **Step 1:** `HeroPlane({ active }: { active: boolean })` — add `id="hero-square"` to the `<svg>` (GSAP fades it); no other change (GSAP owns opacity; do not also set an opacity class that fights it).
- [ ] **Step 2:** In `HeroSection`, call `const lift = useChatLift();` Put `ref={lift.rootRef}` on the `<section>`. Render:
  - The **name overlay**: a single absolutely-positioned `CipherText` with `ref={lift.nameRef}`, `id` not needed, `ambient={!lift.active}`, big clamp font, `[font-family:var(--font-cipher)]`, `pointer-events-none absolute left-0 top-0 z-30` (GSAP Flip positions it over `#name-home`/`#name-slot`).
  - `#hero-chrome` group (`absolute inset-0 z-10 flex flex-col items-center justify-center …`) containing: the eyebrow, an **invisible** `#name-home` placeholder span (same big clamp font, `opacity-0`, reserves the resting box), the tagline, and `<AskBar value={lift.value} onChange={lift.setValue} onSend={lift.send} />`.
  - `<HeroPlane active={lift.active} />` (the `#hero-square`).
  - `<ChatPanel active={lift.active} messages={lift.messages} status={lift.status} error={lift.error} value={lift.value} onChange={lift.setValue} onSend={lift.send} onClose={lift.close} onRetry={lift.retry} />`.
  - A click-outside catcher: when `lift.active`, an `absolute inset-0 z-10` button/div (below the card's `z-20`) calling `lift.close` — closes on tapping the field around the card.
  - `<ScrollCue />` (hidden when active is optional; leave).
- [ ] **Step 3:** Remove the old `<HeroChat />` usage and import. The real (visible) name is now the overlay; the in-flow `#name-home` is the invisible placeholder. Ensure the section is `relative` so the absolute children anchor to it.
- [ ] **Step 4:** Verify gate green. **Commit:** `feat(hero): Drive the chat Lift from HeroSection (name morph + chrome fade)`.

---

### Task 6: Delete the modal + the mock; final verify + sanity-run

**Files:** Delete `src/components/hero/chat-dialog.tsx`, `src/components/hero/hero-chat.tsx`, `src/app/lift-mock/` (dir).

- [ ] **Step 1:** `git rm src/components/hero/chat-dialog.tsx src/components/hero/hero-chat.tsx; git rm -r src/app/lift-mock`.
- [ ] **Step 2:** Grep for dangling imports of `ChatOverlay`/`ChatDialog`/`HeroChat`; fix any. Verify gate: `eslint .` / `tsc --noEmit` / `check-tokens` / `build` all green.
- [ ] **Step 3:** Live sanity-run (`pnpm dev`): on `/`, click the ask-bar + a starter chip → the name morphs up into the card header, the card lifts from the square, chrome fades. **Esc**, **✕**, and **click-outside** settle it back; focus returns to the ask-bar. Toggle `prefers-reduced-motion` → instant. Narrow to ≤430px → composer clears the keyboard, the card fits. (Send hits the error path locally — expected.)
- [ ] **Step 4:** **Commit:** `refactor(chat): Remove the Radix modal + lift-mock; The Lift ships`.

## Self-review

- **Spec coverage:** name-morph/Flip → T1+T3+T5; contained card → T4; keyboard-aware → T2+T4; cipher-settle → `ambient={!active}` (T5); close (Esc/✕/click-outside) → T3/T4/T5; a11y (dialog/inert/focus/aria-live) → T4; reduced-motion → T3 (constraint); HeroPlane fade → T5; deletes → T6. Covered.
- **No placeholders:** code blocks are literal; T4/T5 describe exact ids/props/classes that drive the GSAP selectors.
- **Consistency:** the ids `#name-home`, `#name-slot`, `#hero-chrome`, `#hero-square`, `#lift-card` and `rootRef`/`nameRef` match across the hook (T3) and the markup (T4, T5).
