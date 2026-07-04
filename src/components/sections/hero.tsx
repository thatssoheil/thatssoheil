"use client";

import { CipherText } from "@/components/matrix/cipher-text";
import { HeroChat } from "@/components/hero/hero-chat";
import { type SectionId } from "@/lib/constants";
import { jumpToSection } from "@/lib/section-navigation";

// ─── Ambient plane — exact section-width glass behind the name ───
// Static: the element itself owns the shared max width so the visible glass
// aligns with the header and content sections without SVG inset math.

function HeroPlane() {
	return (
		<div
			aria-hidden="true"
			data-hero-plane=""
			className="pointer-events-none absolute left-1/2 top-[calc(50%+clamp(2.35rem,10.8vw,10.8rem)*0.72)] -z-10 h-[calc(clamp(2.35rem,10.8vw,10.8rem)*3.35)] w-[calc(100vw-2.5rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-alpha-300/70 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--foreground)_9%,transparent),color-mix(in_oklch,var(--foreground)_4%,transparent)),radial-gradient(70%_85%_at_50%_28%,var(--plane-sheen),transparent_72%),radial-gradient(72%_95%_at_50%_72%,var(--plane-glow),transparent_80%)] shadow-[inset_0_1px_0_var(--glass-sheen),inset_0_-1px_0_color-mix(in_oklch,var(--foreground)_7%,transparent),0_18px_70px_color-mix(in_oklch,var(--background)_70%,transparent)] backdrop-blur-md"
		/>
	);
}

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
					<HeroPlane />

					{/* Eyebrow — "Frontend Engineer × Product Curator". The two roles recede
					    to a quiet grey; the signal × is the lone accent — the fusion of the two
					    disciplines. One line, centred, scales down on small screens. */}
					<p className="flex items-center justify-center gap-[0.6em] whitespace-nowrap font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] font-medium sm:font-normal leading-none tracking-[0.22em] sm:tracking-[0.3em] uppercase text-text-faint">
						<span>Frontend Engineer</span>
						<span
							className="text-[1.2em] text-brand"
							style={{ filter: "drop-shadow(0 0 5px var(--primary))" }}
						>
							×
						</span>
						<span>Product Curator</span>
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

				{/* Tagline — quiet support, no extra rule chrome. */}
				<div className="mt-8 flex w-full flex-col items-center">
					<p className="whitespace-nowrap font-sans text-[clamp(0.56rem,2.1vw,0.8125rem)] leading-none tracking-[0.16em] sm:tracking-[0.18em] uppercase text-text-faint">
						Coding vision into existence
					</p>
				</div>

				{/* Ask, don't scroll — the prompt bar grows in place into the chat.
				                    Feature-flagged: ship without chat by setting NEXT_PUBLIC_ENABLE_CHAT=false. */}
				{process.env.NEXT_PUBLIC_ENABLE_CHAT === "true" && <HeroChat />}
			</div>

			<ScrollCue />
		</section>
	);
}
