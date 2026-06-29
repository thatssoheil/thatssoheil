"use client";

import { useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * True only where real backdrop refraction will actually render: Chromium engines,
 * with no reduced-motion/transparency preference. `backdrop-filter: url(#svg)` is
 * parsed everywhere but only Chromium displaces the live backdrop — Safari/Firefox
 * silently drop the SVG part. There is no CSS feature query that distinguishes
 * *rendering* from *parsing*, so we engine-detect. Everything else falls back to the
 * plain glass blur — refraction is a pure progressive enhancement.
 */
function detectChromium(): boolean {
	const uaData = (
		navigator as Navigator & {
			userAgentData?: { brands?: { brand: string }[] };
		}
	).userAgentData;
	if (uaData?.brands?.length) {
		return uaData.brands.some((b) => /Chromium/i.test(b.brand));
	}
	// Fallback UA check: Chromium family (Chrome/Edge/Opera/Brave), excluding Firefox.
	return (
		/Chrome|Chromium|Edg|OPR/.test(navigator.userAgent) &&
		!/Firefox|FxiOS/.test(navigator.userAgent)
	);
}

// Engine never changes within a session → a no-op store; SSR snapshot is false so
// the server and first client paint agree (refraction off), then it resolves on mount.
const noopSubscribe = () => () => {};
const getChromiumSnapshot = () => detectChromium();
const getServerSnapshot = () => false;

export function useRefractionSupported(): boolean {
	const isChromium = useSyncExternalStore(
		noopSubscribe,
		getChromiumSnapshot,
		getServerSnapshot,
	);
	const reduceTransparency = useMediaQuery("(prefers-reduced-transparency: reduce)");
	const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

	return isChromium && !reduceTransparency && !reduceMotion;
}
