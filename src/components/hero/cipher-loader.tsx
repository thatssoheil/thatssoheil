"use client";

import { useEffect, useState } from "react";
import { randomGlyph } from "@/components/matrix/cipher-engine";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { SoheilLabel } from "@/components/hero/soheil-label";

const GLYPH_COUNT = 10;
const TICK_MS = 45;

/**
 * The "decoding" beat: while the chat waits for its first streamed token, a short
 * run of cipher glyphs scrambles in the cipher face — the same visual language as
 * the hero name — replaced by the assistant's prose the moment a token arrives.
 * Reduced motion: a static "decoding…" label instead of the scramble.
 */
export function CipherLoader() {
	const prefersReduced = useReducedMotion();
	const [glyphs, setGlyphs] = useState<string[]>(() =>
		Array.from({ length: GLYPH_COUNT }, () => "A"),
	);

	useEffect(() => {
		if (prefersReduced) return;
		const id = setInterval(() => {
			setGlyphs(Array.from({ length: GLYPH_COUNT }, () => randomGlyph()));
		}, TICK_MS);
		return () => clearInterval(id);
	}, [prefersReduced]);

	return (
		<div className="flex items-center gap-3" role="status" aria-label="Decoding reply">
			<SoheilLabel />
			{prefersReduced ? (
				<span className="font-mono text-[0.8rem] tracking-wide text-brand/70">
					decoding…
				</span>
			) : (
				<span
					aria-hidden
					className="[font-family:var(--font-cipher)] text-[0.95rem] font-light tracking-tighter text-brand select-none"
					style={{ filter: "drop-shadow(0 0 8px var(--signal-500))" }}
				>
					{glyphs.join("")}
				</span>
			)}
		</div>
	);
}
