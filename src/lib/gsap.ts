import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register once. Safe to import from any client component.
gsap.registerPlugin(ScrollTrigger, useGSAP);

// On iOS Safari/Chrome the URL bar collapsing/expanding changes the viewport
// height (and thus 100dvh), which would otherwise re-measure the pinned hero
// mid-scroll and produce a visible jump/seam. Ignore those toolbar-driven
// resizes so the pin distance stays stable across the toolbar toggle.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, useGSAP };
