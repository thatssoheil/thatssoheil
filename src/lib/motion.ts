// Motion palette — shared vocabulary for reduced-motion-gated GSAP.
// The reduced-motion decision and the standard ease live here so every
// animation reads from one place instead of re-stating the media queries.

/** matchMedia condition: user has no motion preference (full motion allowed). */
export const FULL_MOTION = "(prefers-reduced-motion: no-preference)";

/** matchMedia condition: user prefers reduced motion. */
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Standard ease for full-motion entrances and reveals. */
export const MOTION_EASE = "power2.out";
