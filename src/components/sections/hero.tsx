"use client";

import { useRef } from "react";
import { CipherText } from "@/components/matrix/cipher-text";
import { gsap, useGSAP } from "@/lib/gsap";
import { SM_BREAKPOINT_PX, type SectionId } from "@/lib/constants";

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
				className="group pointer-events-auto flex h-12 w-11 items-center cursor-pointer"
			>
				{/* The 1px hairline is the only visual; the button around it is a
				    44px-wide touch target. Accent drip is hidden at rest; it only
				    plays on hover/focus, so it never competes with the triangle ray. */}
				<span className="relative block h-full w-px overflow-hidden bg-foreground/15">
					<span
						aria-hidden="true"
						className="block h-1/3 w-full bg-brand opacity-0 group-hover:animate-scroll-cue group-focus-visible:animate-scroll-cue"
					/>
				</span>
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
			// fromTo (not from): the CSS FOUC gate holds [data-hero] hidden in the
			// SSR markup, so we state the visible end explicitly and reveal into it.
			// clearProps:"transform" tidies the inline translate but keeps the
			// inline opacity:1 that overrides the gate.
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.fromTo(
					"[data-hero]",
					{ opacity: 0, y: 24 },
					{
						opacity: 1,
						y: 0,
						duration: 0.7,
						ease: "power2.out",
						stagger: 0.18,
						delay: 0.3,
						clearProps: "transform",
					},
				);
			});
			mm.add("(prefers-reduced-motion: reduce)", () => {
				gsap.fromTo(
					"[data-hero]",
					{ opacity: 0 },
					{ opacity: 1, duration: 0.4, stagger: 0.1 },
				);
			});
		},
		{ scope: sectionRef },
	);

	// ── Scroll-directed exit: dolly the name in + blur, then dip the frame to
	//    the flat background so the manifesto (same bg) emerges with no seam ──
	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			// Desktop only (sm+). Pinning a full-screen section and scrubbing a 16px
			// blur feels heavy and "stuck" on touch — and the dynamic mobile viewport
			// (collapsing URL bar vs. 100dvh) makes a pinned trigger jump. On phones
			// the hero just scrolls away naturally; the manifesto shares its
			// background, so the seam stays invisible without the veil dip.
			mm.add(`(min-width: ${SM_BREAKPOINT_PX}px) and (prefers-reduced-motion: no-preference)`, () => {
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
			className="relative w-full h-[100dvh] overflow-hidden bg-[image:var(--gradient-hero)]"
			aria-label="Hero"
		>
			<HeroPlane />

			<div
				data-hero-content
				className="relative z-10 flex h-full flex-col justify-center pb-[12vh] sm:px-8 md:px-12 lg:px-16 pointer-events-none select-none will-change-[transform,filter]"
			>
				{/* On mobile the wrapper spans the full viewport (no gutter, no max-width)
				    so the name can bleed to both edges; the eyebrow + tagline below
				    re-add their own `px-6` so they alone keep the margin. Desktop keeps
				    the centred `max-w-6xl` column with the parent's gutter. */}
				<div className="relative mx-auto w-full max-w-none sm:max-w-6xl">
					{/* Faint signal haze behind the name — atmosphere, not a spotlight */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute -left-[8%] top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--signal-500),transparent_70%)] opacity-[0.06] blur-[110px]"
					/>

					{/* Mobile: a quiet two-line kicker (a flex column can't mis-wrap),
					    10px so the long caps string stops spanning the phone and out-
					    shouting the full-bleed name. Desktop (sm+) reverts to the inline
					    one-liner — the middot is the mobile line break (hidden < sm) and
					    the inline separator at sm+ — so the desktop render is unchanged. */}
					<p
						data-hero
						className="px-6 sm:px-0 flex flex-col gap-1 sm:block font-mono text-[10px] sm:text-sm font-medium sm:font-normal leading-[1.5] tracking-[0.22em] sm:tracking-[0.3em] uppercase text-brand"
					>
						<span>Frontend Developer</span>
						<span>
							<span className="hidden sm:inline">{" · "}</span>
							Product Curator
						</span>
					</p>

					{/* Mobile: name bleeds edge-to-edge. Each word is a full-width flex
					    row whose monospace chars spread via justify-between (first char
					    flush left, last flush right — exact at any phone width, no
					    font-metric math). ~26vw keeps glyphs large so the residual gaps
					    read as light tracking. Desktop (sm+) reverts to the natural
					    left-aligned clamp() type inside the max-w-6xl column. */}
					<h1
						data-hero
						className="mt-8 sm:mt-6 flex flex-col items-start font-mono font-light tracking-tight leading-[0.9] text-foreground text-[26vw] sm:text-[clamp(3.25rem,12vw,11rem)]"
					>
						<CipherText
							text="Soheil"
							as="span"
							ambient
							className="flex w-full justify-between sm:block sm:w-auto"
						/>
						<CipherText
							text="Fakour"
							as="span"
							ambient
							className="flex w-full justify-between sm:block sm:w-auto"
						/>
					</h1>

					{/* Pulled up under the bleeding name on mobile (mt-8 vs sm:mt-9) so
					    the tagline reads as bound to it, not floating. */}
					<div data-hero className="mt-8 sm:mt-9 w-full max-w-md px-6 sm:px-0">
						{/* Faint full-width hairline, neutral, with a short signal lead-in
						    at the left so it never reads as a hard dev-tool rule. The
						    lead-in shrinks on mobile (w-10) to scale with the smaller label. */}
						<span aria-hidden="true" className="relative block h-px w-full bg-foreground/10">
							<span className="absolute inset-y-0 left-0 w-10 sm:w-12 bg-[linear-gradient(to_right,var(--brand),transparent)] [filter:drop-shadow(0_0_4px_var(--signal-500))]" />
						</span>
						{/* 11px / dimmer on mobile so it sits a clear tier below the 10px
						    brand kicker (was text-sm — larger than the kicker). Desktop
						    keeps text-sm / 0.2em / foreground-45 via sm: overrides. */}
						<p className="mt-3.5 sm:mt-4 font-mono text-[11px] sm:text-sm tracking-[0.18em] sm:tracking-[0.2em] uppercase text-foreground/40 sm:text-foreground/45">
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
