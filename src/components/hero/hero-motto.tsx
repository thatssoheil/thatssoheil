"use client";

import { useEffect, useState } from "react";
import { CipherText } from "@/components/matrix/cipher-text";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { TAGLINE } from "@/lib/constants";

const MOTTO_SWAP_MS = 6000;
const MOTTO_WORDS = ["Coding", "Prompting"] as const;
const MOTTO_REST = TAGLINE.replace(/^Coding\s+/, "");

export function HeroMotto() {
	const prefersReduced = useReducedMotion();
	const [wordIndex, setWordIndex] = useState(0);
	const [hasSwapped, setHasSwapped] = useState(false);

	useEffect(() => {
		if (prefersReduced) return;

		const id = window.setInterval(() => {
			setHasSwapped(true);
			setWordIndex((current) => (current + 1) % MOTTO_WORDS.length);
		}, MOTTO_SWAP_MS);

		return () => window.clearInterval(id);
	}, [prefersReduced]);

	const word = MOTTO_WORDS[wordIndex];

	return (
		<p className="motto-ai-flow pointer-events-none absolute inset-x-6 bottom-28 mx-auto whitespace-nowrap text-center font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] font-medium leading-none tracking-[0.22em] text-text-faint uppercase sm:font-normal sm:tracking-[0.3em]">
			<CipherText
				key={word}
				text={word.toUpperCase()}
				as="span"
				initialState={hasSwapped ? "scrambled" : "settled"}
				ambient={!prefersReduced}
				revealedHold={1600}
				decelDuration={650}
				spinUpDuration={360}
				intensity="display"
				className="motto-ai-word inline-block"
			/>
			{" "}
			<span>{MOTTO_REST.toUpperCase()}</span>
		</p>
	);
}
