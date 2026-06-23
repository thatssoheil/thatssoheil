"use client";

import { useRef, type RefObject } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { FULL_MOTION, REDUCED_MOTION } from "@/lib/motion";

type MotionBuilder<T extends HTMLElement> = (scope: RefObject<T | null>) => void;

type MotionBuilders<T extends HTMLElement> = {
	/** Runs when the user has no motion preference (full motion). */
	full: MotionBuilder<T>;
	/** Runs when the user prefers reduced motion. Omit to do nothing. */
	reduced?: MotionBuilder<T>;
};

type MotionOptions<T extends HTMLElement> = {
	/** Scope element for useGSAP + selector scoping. One is created if omitted. */
	scope?: RefObject<T | null>;
	/** Re-run dependencies, passed through to useGSAP. Omit to run once. */
	deps?: unknown[];
};

/**
 * Reduced-motion-gated GSAP. Runs `full` under no-preference and `reduced`
 * under reduce, inside a single useGSAP context scoped to `scope`. Both
 * builders receive the scope ref (for `scrollTrigger.trigger`). Returns the
 * scope ref (creating one if not provided) to spread onto the scope element.
 *
 * The reduced-motion gate and the standard ease live in `~/lib/motion` so
 * callers stop re-stating `gsap.matchMedia()` and the media queries.
 */
export function useMotion<T extends HTMLElement = HTMLDivElement>(
	builders: MotionBuilders<T>,
	options: MotionOptions<T> = {},
) {
	const internalScope = useRef<T>(null);
	const scope = options.scope ?? internalScope;

	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			mm.add(FULL_MOTION, () => builders.full(scope));
			if (builders.reduced) {
				const reduced = builders.reduced;
				mm.add(REDUCED_MOTION, () => reduced(scope));
			}
		},
		{ scope, dependencies: options.deps },
	);

	return scope;
}
