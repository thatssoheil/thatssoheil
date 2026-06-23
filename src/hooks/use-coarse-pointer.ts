"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";

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
 * Returns true on coarse-pointer (touch) devices.
 * Uses `matchMedia` via `useSyncExternalStore` so the value is correct on first
 * client render (mirrors `useReducedMotion`).
 */
export function useCoarsePointer(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
