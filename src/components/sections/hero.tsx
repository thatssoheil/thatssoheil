"use client";

import { type SectionId, TAGLINE } from "@/lib/constants";

const MOTTO_REST = TAGLINE.replace(/^Coding\s+/, "");

function ScrollCue() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-x-0 bottom-10 z-10 mx-auto flex h-12 w-11 items-center justify-center"
		>
			<span className="block h-8 w-px bg-cf-brand-tangerine" />
		</div>
	);
}

export function HeroSection() {
	return (
		<section
			id={"hero" satisfies SectionId}
			className="relative isolate h-stable-screen w-full overflow-x-clip bg-kumo-canvas"
			aria-label="Hero"
		>
			<div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
				<div className="flex flex-col items-center">
					<p className="brand-eyebrow flex flex-wrap items-center justify-center gap-x-2.5 text-kumo-default">
						<span>Frontend Engineer</span>
						<span aria-hidden="true">×</span>
						<span>Product Curator</span>
					</p>

					<span
						aria-hidden="true"
						className="my-8 block h-1.5 w-12 rounded-full bg-cf-brand-tangerine"
					/>

					<h1 className="brand-headline text-[clamp(4.25rem,12.2vw,10.5rem)] text-kumo-default">
						<span className="block sm:inline">Soheil</span>{" "}
						<span className="block sm:inline">Fakour</span>
					</h1>
				</div>

				<p className="brand-body pointer-events-none absolute inset-x-6 bottom-28 mx-auto whitespace-nowrap text-center text-kumo-default uppercase">
					<span className="inline-block">Coding</span>{" "}
					<span>{MOTTO_REST}</span>
				</p>
			</div>

			<ScrollCue />
		</section>
	);
}
