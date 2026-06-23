"use client";

import type { SectionId } from "@/lib/constants";
import { MANIFESTO } from "@/data/manifesto";
import { useReveal } from "@/hooks/use-reveal";

export function ManifestoSection() {
	const scope = useReveal<HTMLElement>();

	return (
		<section
			ref={scope}
			id={"manifesto" satisfies SectionId}
			className="relative w-full min-h-[100dvh] overflow-hidden bg-background"
			aria-label="Manifesto"
		>
			<div className="flex items-center justify-center min-h-[100dvh] px-6 sm:px-8 md:px-12 lg:px-16">
				<div className="mx-auto w-full max-w-3xl py-24">
					{/* ── Heading ── */}
					<p
						data-reveal
						className="font-mono text-sm tracking-[0.2em] uppercase text-brand"
					>
						{MANIFESTO.label}
					</p>

					<h2
						data-reveal
						className="mt-3 text-fluid-36-48 font-light tracking-tight text-foreground font-sans"
					>
						{MANIFESTO.heading}
					</h2>

					<p
						data-reveal
						className="mt-3 font-mono text-xs sm:text-sm tracking-wide text-foreground/40"
					>
						{MANIFESTO.subheading}
					</p>

					{/* ── Paragraphs ── */}
					<div className="mt-14 flex flex-col gap-10">
						{MANIFESTO.paragraphs.map((p) => (
							<div key={p.label} data-reveal className="flex flex-col gap-3">
								<p className="font-mono text-[10px] tracking-[0.22em] uppercase text-foreground/30">
									{p.label}
								</p>
								<p className="text-base sm:text-lg leading-relaxed text-foreground/70 font-light">
									{p.body}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
