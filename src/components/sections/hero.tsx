"use client";

import { CipherText } from "@/components/matrix/cipher-text";
import { HeroChat } from "@/components/hero/hero-chat";
import { HeroMotto } from "@/components/hero/hero-motto";
import { type SectionId } from "@/lib/constants";
import { jumpToSection } from "@/lib/section-navigation";

// ─── Scroll cue — a static signal hairline (no drip) ───

function ScrollCue() {
	return (
		<button
			onClick={() => jumpToSection("#manifesto")}
			aria-label="Scroll to content"
			className="group absolute inset-x-0 bottom-10 z-10 mx-auto flex h-12 w-11 cursor-pointer items-center justify-center"
		>
			<span className="block h-8 w-px bg-foreground/20" />
		</button>
	);
}

// ─── Hero Section (fully static; the only motion is the name's cipher loop) ───

export function HeroSection() {
	return (
		<section
			id={"hero" satisfies SectionId}
			// `overflow-x-clip` keeps the ambient plane from bleeding sideways (no
			// horizontal scrollbar) while still letting the hero chat box overflow
			// DOWNWARD past the fold when it expands — so it's never clipped at the seam.
			className="relative w-full h-[100dvh] overflow-x-clip"
			aria-label="Hero"
		>
			<div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center select-none">
				<div className="relative isolate flex flex-col items-center">
					{/* Eyebrow — "Frontend Engineer × Product Curator". The two roles recede
					    to a quiet grey; the signal × is the lone accent — the fusion of the two
					    disciplines. One line, centred, scales down on small screens. */}
					<p className="grid w-[min(100%,31rem)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[0.6em] whitespace-nowrap font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] font-medium leading-none tracking-[0.22em] text-text-faint uppercase sm:font-normal sm:tracking-[0.3em]">
						<span className="justify-self-end">Frontend Engineer</span>
						<span
							className="text-[1.2em] tracking-normal text-brand"
						>
							×
						</span>
						<span className="justify-self-start">Product Curator</span>
					</p>

					{/* The name — decodes once on load, then rests. Monospace
					    (--font-cipher) so the glyph pool can't reflow the line. */}
					<CipherText
						text="Soheil Fakour"
						as="h1"
						intensity="display"
						className="mt-6 whitespace-nowrap font-light leading-[0.95] text-foreground text-[length:clamp(2.35rem,10.8vw,10.8rem)] [font-family:var(--font-cipher)]"
					/>

				</div>

				{/* Ask, don't scroll — the prompt bar grows in place into the chat.
				                    Feature-flagged: ship without chat by setting NEXT_PUBLIC_ENABLE_CHAT=false. */}
				{process.env.NEXT_PUBLIC_ENABLE_CHAT === "true" && <HeroChat />}

				<HeroMotto />
			</div>

			<ScrollCue />
		</section>
	);
}
