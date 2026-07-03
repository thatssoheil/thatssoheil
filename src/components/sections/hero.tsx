"use client";

import { CipherText } from "@/components/matrix/cipher-text";
import { HeroChat } from "@/components/hero/hero-chat";
import { type SectionId } from "@/lib/constants";
import { jumpToSection } from "@/lib/section-navigation";

// ─── Ambient plane — a small, centered square behind the name ───
// Static: a faint white-toned fill + a lean white edge read as a flat "plane",
// a perfect square (4-fold symmetric) centred on the wordmark's axis, spanning from
// the eyebrow down through the ask-bar. Monochrome — white in the dark (active)
// theme, neutral ink on paper. Never competes with the name.

// Square, centred in a 100×100 box; a soft corner radius rounds the edges.
const SQUARE = { x: 6, y: 6, size: 88, radius: 3 } as const;

function HeroPlane() {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute left-1/2 top-1/2 h-[72vmin] w-[72vmin] -translate-x-1/2 -translate-y-1/2"
			viewBox="0 0 100 100"
			fill="none"
			preserveAspectRatio="xMidYMid meet"
			style={{
				// The whole plane hard-dissolves into the void by ~60% down — nothing
				// (wash or wire) survives into the bottom of the square.
				maskImage: "linear-gradient(to bottom, #000 0%, #000 28%, transparent 60%)",
				WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 28%, transparent 60%)",
			}}
		>
			<defs>
				<linearGradient id="hero-plane-fill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="var(--plane-tint)" />
					<stop offset="100%" stopColor="transparent" />
				</linearGradient>
			</defs>

			{/* The plane — faint white-toned wash, brightest at the top and fading
			    into the void; reads as lit atmosphere rather than a flat smudge */}
			<rect
				x={SQUARE.x}
				y={SQUARE.y}
				width={SQUARE.size}
				height={SQUARE.size}
				rx={SQUARE.radius}
				fill="url(#hero-plane-fill)"
			/>

			{/* The edge — a crisp, lean white wire. No blur: the square's top edge stays
			    sharp, and its dissolve into the void comes entirely from the plane-wide
			    alpha mask above, which fades the lower sides out toward the bottom. */}
			<rect
				x={SQUARE.x}
				y={SQUARE.y}
				width={SQUARE.size}
				height={SQUARE.size}
				rx={SQUARE.radius}
				stroke="var(--foreground)"
				strokeWidth={0.75}
				strokeOpacity={0.2}
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
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
			<HeroPlane />

			<div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center select-none">
				{/* Faint signal haze behind the name — atmosphere, not a spotlight */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--primary),transparent_70%)] opacity-[0.06] blur-[110px]"
				/>

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

				{/* The name — decodes once on load, then rests. In the passive "ambient"
				    state a single random glyph quietly re-ciphers and resolves every few
				    seconds. Monospace (--font-cipher) so the glyph pool can't reflow the line. */}
				<CipherText
					text="Soheil Fakour"
					as="h1"
					ambient
					className="mt-6 whitespace-nowrap font-light leading-[0.95] text-foreground text-[clamp(2.5rem,12vw,12rem)] [font-family:var(--font-cipher)]"
				/>

				{/* Tagline under a centred hairline with a centred signal lead. */}
				<div className="mt-8 flex w-full flex-col items-center">
					<span
						aria-hidden="true"
						className="relative block h-px w-44 max-w-[70vw] bg-foreground/12"
					>
						<span className="absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-[linear-gradient(to_right,transparent,var(--brand),transparent)] [filter:drop-shadow(0_0_4px_var(--primary))]" />
					</span>
					<p className="mt-4 whitespace-nowrap font-sans text-[clamp(0.6rem,2.4vw,0.875rem)] leading-none tracking-[0.18em] sm:tracking-[0.2em] uppercase text-text-faint">
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
