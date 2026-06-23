"use client";

import { useCallback, useSyncExternalStore } from "react";

const getServerSnapshot = () => false;

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * Uses `useSyncExternalStore` so the value is correct on the first client
 * render; SSR returns `false`. Pass a stable query string (a literal, or
 * memoise it) so the subscription isn't torn down and rebuilt each render.
 */
export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const mql = window.matchMedia(query);
			mql.addEventListener("change", onChange);
			return () => mql.removeEventListener("change", onChange);
		},
		[query],
	);

	const getSnapshot = useCallback(
		() => window.matchMedia(query).matches,
		[query],
	);

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
