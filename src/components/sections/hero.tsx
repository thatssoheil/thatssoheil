"use client";

import { CipherText } from "@/components/matrix/cipher-text";
import { HeroChat } from "@/components/hero/hero-chat";
import { type SectionId } from "@/lib/constants";
import { jumpToSection } from "@/lib/section-navigation";

// ─── Ambient plane — a wide, centered field behind the name ───
// Static: a faint white-toned fill reads as atmosphere rather than a backplate,
// centred on the wordmark's axis and dissolving before it becomes a hard panel.

// Wide field, centred in a 160×100 box; a soft corner radius rounds the edges.
const PLANE = { x: 6, y: 6, width: 148, height: 88, radius: 3 } as const;

function HeroPlane() {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute left-1/2 top-[calc(50%+clamp(2.5rem,12vw,12rem)*0.75)] -z-10 h-[calc(clamp(2.5rem,12vw,12rem)*3.75)] w-[calc(100vw-2.5rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2"
			viewBox="0 0 160 100"
			fill="none"
			preserveAspectRatio="none"
			style={{
				// Elliptical dissolve lets the plane align with the section glass width
				// without exposing a straight rectangular edge.
				maskImage: "radial-gradient(ellipse 74% 54% at 50% 32%, #000 0%, #000 38%, transparent 78%)",
				WebkitMaskImage: "radial-gradient(ellipse 74% 54% at 50% 32%, #000 0%, #000 38%, transparent 78%)",
			}}
		>
			<defs>
				<radialGradient id="hero-plane-fill" cx="50%" cy="28%" r="72%">
					<stop offset="0%" stopColor="var(--plane-sheen)" />
					<stop offset="42%" stopColor="var(--plane-tint)" />
					<stop offset="100%" stopColor="transparent" />
				</radialGradient>
				<radialGradient id="hero-plane-glow" cx="50%" cy="24%" r="62%">
					<stop offset="0%" stopColor="var(--plane-glow)" />
					<stop offset="100%" stopColor="transparent" />
				</radialGradient>
			</defs>

			{/* The plane — faint white-toned wash, brightest at the top and fading
			    into the void; reads as lit atmosphere rather than a flat smudge */}
			<rect
				x={PLANE.x}
				y={PLANE.y}
				width={PLANE.width}
				height={PLANE.height}
				rx={PLANE.radius}
				fill="url(#hero-plane-glow)"
			/>
			<rect
				x={PLANE.x}
				y={PLANE.y}
				width={PLANE.width}
				height={PLANE.height}
				rx={PLANE.radius}
				fill="url(#hero-plane-fill)"
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
						className="mt-6 whitespace-nowrap font-light leading-[0.95] text-foreground text-[length:clamp(2.5rem,12vw,12rem)] [font-family:var(--font-cipher)]"
					/>
				</div>

				{/* Tagline — quiet support, no extra rule chrome. */}
				<div className="mt-8 flex w-full flex-col items-center">
					<p className="whitespace-nowrap font-sans text-[clamp(0.6rem,2.4vw,0.875rem)] leading-none tracking-[0.18em] sm:tracking-[0.2em] uppercase text-text-faint">
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
