"use client";

import { useMediaQuery } from "@/hooks/use-media-query";

/**
 * Returns true on coarse-pointer (touch) devices.
 */
export function useCoarsePointer(): boolean {
	return useMediaQuery("(pointer: coarse)");
}
