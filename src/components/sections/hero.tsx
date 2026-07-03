"use client";

import { CipherText } from "@/components/matrix/cipher-text";
import { HeroChat } from "@/components/hero/hero-chat";
import { type SectionId } from "@/lib/constants";
import { jumpToSection } from "@/lib/section-navigation";

// Square, centred in a 100×100 box; a soft corner radius rounds the edges.
const SQUARE = { x: 6, y: 6, size: 88, radius: 3 } as const;

function HeroPlane() {
	return (
		<svg
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 h-full w-full"
			viewBox="0 0 100 100"
			fill="none"
			preserveAspectRatio="xMidYMid meet"
			style={{
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

			<rect
				x={SQUARE.x}
				y={SQUARE.y}
				width={SQUARE.size}
				height={SQUARE.size}
				rx={SQUARE.radius}
				fill="url(#hero-plane-fill)"
			/>

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

// ─── Scroll cue ───

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

// ─── Hero Section ───

export function HeroSection() {
	return (
		<section
			id={"hero" satisfies SectionId}
			className="relative w-full h-[100dvh] overflow-x-clip"
			aria-label="Hero"
		>
			<div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center select-none">
				{/* Haze behind everything */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--primary),transparent_70%)] opacity-[0.06] blur-[110px]"
				/>

				{/* Text block — relative anchor so the plane sits locked to this group, not the viewport */}
				<div className="relative flex flex-col items-center">
					<HeroPlane />

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

					<CipherText
						text="Soheil Fakour"
						as="h1"
						ambient
						className="mt-6 whitespace-nowrap font-light leading-[0.95] text-foreground text-[clamp(2.5rem,12vw,12rem)] [font-family:var(--font-cipher)]"
					/>

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
				</div>

				{process.env.NEXT_PUBLIC_ENABLE_CHAT === "true" && <HeroChat />}
			</div>

			<ScrollCue />
		</section>
	);
}