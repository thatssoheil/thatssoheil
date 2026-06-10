"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
	const mql = window.matchMedia(QUERY);
	mql.addEventListener("change", callback);
	return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
	return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
	return false;
}

/**
 * Returns true when the user prefers reduced motion.
 * Uses `matchMedia` via `useSyncExternalStore` so the value is correct on first client render.
 */
export function useReducedMotion(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
