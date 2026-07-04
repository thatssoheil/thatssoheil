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
