"use client";

import { type SectionId, TAGLINE } from "@/lib/constants";

const MOTTO_REST = TAGLINE.replace(/^Coding\s+/, "");

// ─── Scroll cue — a static signal hairline (no drip) ───

function ScrollCue() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-x-0 bottom-10 z-10 mx-auto flex h-12 w-11 items-center justify-center"
		>
			<span className="block h-8 w-px bg-kumo-hairline" />
		</div>
	);
}

// ─── Hero Section (fully static) ───

export function HeroSection() {
	return (
		<section
			id={"hero" satisfies SectionId}
			// `overflow-x-clip` keeps the ambient plane from bleeding sideways (no
			// horizontal scrollbar).
			className="relative h-stable-screen w-full overflow-x-clip"
			aria-label="Hero"
		>
			<div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
				<div className="relative isolate flex flex-col items-center">
					{/* Eyebrow — "Frontend Engineer × Product Curator". The two roles recede
					    to a quiet grey; the signal × is the lone accent — the fusion of the two
					    disciplines. One line, centred, scales down on small screens. */}
						<p className="grid w-[min(100%,31rem)] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[0.6em] font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] font-medium leading-none tracking-[0.22em] text-kumo-default opacity-70 uppercase sm:font-normal sm:tracking-[0.3em]">
							<span className="justify-self-end">Frontend Engineer</span>
							<span
								className="text-[1.2em] tracking-normal text-kumo-link"
							>
								×
							</span>
							<span className="justify-self-start">Product Curator</span>
						</p>

					{/* The name — static, SSR-safe. */}
					<h1 className="mt-6 text-kumo-default">
						<span className="relative left-1/2 flex w-screen -translate-x-1/2 flex-col gap-1 text-[26vw] font-light leading-[0.78] sm:hidden font-sans">
							<span className="block w-full">Soheil</span>
							<span className="block w-full">Fakour</span>
						</span>
						<span className="hidden whitespace-nowrap font-light leading-[0.95] text-[length:clamp(2.35rem,10.8vw,10.8rem)] sm:block font-sans">
							Soheil Fakour
						</span>
					</h1>

				</div>

				{/* Motto — the tagline's leading word toggles in place. */}
				<p
					className="pointer-events-none absolute inset-x-6 bottom-28 mx-auto whitespace-nowrap text-center font-sans text-[clamp(0.5rem,2.6vw,0.875rem)] font-medium leading-none tracking-[0.22em] text-kumo-default opacity-70 uppercase sm:font-normal sm:tracking-[0.3em]"
				>
					<span className="inline-block">Coding</span>{" "}
					<span>{MOTTO_REST.toUpperCase()}</span>
				</p>
			</div>

			<ScrollCue />
		</section>
	);
}
