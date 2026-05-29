"use client";

import { useRef } from "react";
import { CipherText } from "@/components/matrix/cipher-text";
import { gsap, useGSAP } from "@/lib/gsap";
import type { SectionId } from "@/lib/constants";

// ─── Ambient plane — a single asymmetric triangle behind the hero text ───
// Deliberately subliminal: a faint neutral fill + faint neutral edges read as a
// tilted "plane", with one dim, slow accent drift along the perimeter as the
// only whisper of life — it must never compete with the name. The triangle is
// scalene and off-axis (never a symmetric, centred badge), and composed with the
// type: its sharpest vertex aims at the name while the mass fills the right-hand
// negative space the left-aligned type leaves, balancing the layout. (Gestural,
// not pixel-locked — the full-bleed SVG and the reflowing type differ in space.)
// pathLength=1 normalises the perimeter so the dash maths is geometry-free.

const TRIANGLE = "M 700 400 L 1200 300 L 1020 820 Z";

function HeroPlane() {
	return (
		<svg
			data-hero-plane
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 h-full w-full will-change-[transform,opacity,filter]"
			viewBox="0 0 1440 900"
			fill="none"
			preserveAspectRatio="xMidYMid slice"
		>
			<defs>
				<linearGradient id="hero-plane-fill" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="var(--plane-tint)" />
					<stop offset="100%" stopColor="transparent" />
				</linearGradient>
			</defs>

			{/* The plane — faint signal-tinted wash (per-theme --plane-tint), brightest
			    at the name-facing vertex and fading into the void; reads as lit
			    atmosphere in both themes rather than a flat grey smudge */}
			<path d={TRIANGLE} fill="url(#hero-plane-fill)" />

			{/* The edges — faint neutral wire (solid). It fades with the whole plane
			    on exit; no per-edge dash animation, so it can never render partial. */}
			<path
				d={TRIANGLE}
				stroke="var(--foreground)"
				strokeWidth={1.25}
				strokeOpacity={0.08}
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
			/>

			{/* A single dim, slow accent drift — a whisper of life, never a spectacle */}
			<path
				d={TRIANGLE}
				stroke="var(--brand)"
				strokeWidth={1.5}
				strokeOpacity={0.3}
				strokeLinecap="round"
				strokeLinejoin="round"
				pathLength={1}
				strokeDasharray="0.14 0.86"
				vectorEffect="non-scaling-stroke"
				style={{
					filter: "drop-shadow(0 0 4px var(--signal-500))",
					animation: "triangle-ray 11s linear infinite",
				}}
			/>
		</svg>
	);
}

// ─── Scroll cue — a faint signal hairline that drips downward (no chevron) ───

function ScrollCue() {
	const handleClick = () => {
		document.getElementById("manifesto")?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 mx-auto w-full max-w-6xl px-6 sm:px-8 md:px-12 lg:px-16">
			<button
				data-hero-cue
				onClick={handleClick}
				aria-label="Scroll to content"
				className="group pointer-events-auto block h-12 w-px overflow-hidden bg-foreground/15 cursor-pointer"
			>
				{/* Accent drip is hidden at rest; it only plays on hover/focus, so
				    it never competes with the triangle ray's ambient motion. */}
				<span
					aria-hidden="true"
					className="block h-1/3 w-full bg-brand opacity-0 group-hover:animate-scroll-cue group-focus-visible:animate-scroll-cue"
				/>
			</button>
		</div>
	);
}

// ─── Hero Section ───

export function HeroSection() {
	const sectionRef = useRef<HTMLElement>(null);

	// ── Page-load entrance (GSAP, before paint via useGSAP) ──
	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.from("[data-hero]", {
					opacity: 0,
					y: 24,
					duration: 0.7,
					ease: "power2.out",
					stagger: 0.18,
					delay: 0.3,
				});
			});
			mm.add("(prefers-reduced-motion: reduce)", () => {
				gsap.from("[data-hero]", { opacity: 0, duration: 0.4, stagger: 0.1 });
			});
		},
		{ scope: sectionRef },
	);

	// ── Scroll-directed exit: dolly the name in + blur, then dip the frame to
	//    the flat background so the manifesto (same bg) emerges with no seam ──
	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				const tl = gsap.timeline({
					scrollTrigger: {
						trigger: sectionRef.current,
						start: "top top",
						end: "+=75%",
						pin: true,
						scrub: 0.6,
					},
				});

				tl.to(
					"[data-hero-content]",
					{
						yPercent: -6,
						scale: 1.14,
						filter: "blur(16px)",
						opacity: 0,
						ease: "power1.in",
						duration: 1,
					},
					0,
				)
					.to(
						"[data-hero-cue]",
						{ opacity: 0, y: 18, ease: "none", duration: 0.35 },
						0,
					)
					// The plane plays the background half of the camera move: as the
					// text dollies forward + blurs, the whole plane recedes, defocuses,
					// and fades out — mirroring the text's exit.
					.to(
						"[data-hero-plane]",
						{
							scale: 0.9,
							opacity: 0,
							filter: "blur(10px)",
							ease: "power1.in",
							duration: 0.85,
						},
						0,
					)
					.to(
						"[data-hero-veil]",
						{ opacity: 1, ease: "power1.in", duration: 0.6 },
						0.5,
					);
			});
		},
		{ scope: sectionRef },
	);

	return (
		<section
			ref={sectionRef}
			id={"hero" satisfies SectionId}
			className="relative w-full h-[100dvh] overflow-hidden snap-start bg-[image:var(--gradient-hero)]"
			aria-label="Hero"
		>
			<HeroPlane />

			<div
				data-hero-content
				className="relative z-10 flex h-full flex-col justify-center pb-[12vh] px-6 sm:px-8 md:px-12 lg:px-16 pointer-events-none select-none will-change-[transform,filter]"
			>
				<div className="relative mx-auto w-full max-w-6xl">
					{/* Faint signal haze behind the name — atmosphere, not a spotlight */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute -left-[8%] top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--signal-500),transparent_70%)] opacity-[0.06] blur-[110px]"
					/>

					<p
						data-hero
						className="font-mono text-xs sm:text-sm tracking-[0.3em] uppercase text-brand"
					>
						Frontend Developer · Product Curator
					</p>

					<h1
						data-hero
						className="mt-6 flex flex-col items-start font-mono font-light tracking-tight leading-[0.9] text-foreground text-[clamp(3.25rem,12vw,11rem)]"
					>
						<CipherText text="Soheil" as="span" ambient />
						<CipherText text="Fakour" as="span" ambient />
					</h1>

					<div data-hero className="mt-9 w-full max-w-md">
						{/* Faint full-width hairline, neutral, with a short signal lead-in
						    at the left so it never reads as a hard dev-tool rule */}
						<span aria-hidden="true" className="relative block h-px w-full bg-foreground/10">
							<span className="absolute inset-y-0 left-0 w-12 bg-[linear-gradient(to_right,var(--brand),transparent)] [filter:drop-shadow(0_0_4px_var(--signal-500))]" />
						</span>
						<p className="mt-4 font-mono text-sm tracking-[0.2em] uppercase text-foreground/45">
							Coding vision into existence
						</p>
					</div>
				</div>
			</div>

			<ScrollCue />

			{/* Dip-to-background veil — driven by the scroll-exit timeline */}
			<div
				data-hero-veil
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 z-20 bg-background opacity-0"
			/>
		</section>
	);
}
