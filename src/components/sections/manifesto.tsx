import type { SectionId } from "@/lib/constants";
import { MANIFESTO } from "@/data/manifesto";
import { NOW } from "@/data/now";

export function ManifestoSection() {
	return (
		<section
			id={"manifesto" satisfies SectionId}
			className="relative w-full min-h-[100dvh] overflow-hidden"
			aria-label="Manifesto"
		>
			<div className="flex items-center justify-center min-h-[100dvh] px-6 sm:px-8 md:px-12 lg:px-16 py-24">
				<div className="glass-panel glass-edge mx-auto w-full max-w-3xl rounded-3xl p-8 sm:p-12 md:p-16">
					{/* ── Heading ── */}
					<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
						{MANIFESTO.label}
					</p>

					<h2 className="mt-3 text-fluid-36-48 font-light tracking-tight text-foreground font-sans">
						{MANIFESTO.heading}
					</h2>

					<p className="mt-3 font-sans text-xs sm:text-sm tracking-wide text-text-muted">
						{MANIFESTO.subheading}
					</p>

					{/* ── Paragraphs ── */}
					<div className="mt-14 flex flex-col gap-10">
						{MANIFESTO.paragraphs.map((p) => (
							<div key={p.label} className="flex flex-col gap-3">
								<p className="font-sans text-[10px] tracking-[0.22em] uppercase text-text-faint">
									{p.label}
								</p>
								<p className="text-base sm:text-lg leading-relaxed text-foreground/70 font-light">
									{p.body}
								</p>
							</div>
						))}
					</div>

					{/* ── Now — the concrete, hireable facts (availability, current work, stack) ── */}
					<div className="mt-14 flex flex-col gap-6 border-t border-border pt-10">
						<div className="flex flex-col gap-3">
							<p className="font-sans text-[10px] tracking-[0.22em] uppercase text-text-faint">
								Now
							</p>
							<p className="text-base sm:text-lg leading-relaxed text-foreground/80 font-light">
								{NOW.current}
							</p>
							<p className="text-sm sm:text-base text-brand font-light">
								{NOW.status}
							</p>
						</div>

						<div className="flex flex-wrap gap-2">
							{NOW.stack.map((tool) => (
								<span
									key={tool}
									className="rounded-full border border-border px-3 py-1 font-sans text-[0.72rem] tracking-wide text-text-muted"
								>
									{tool}
								</span>
							))}
						</div>

						<div className="flex flex-col gap-4">
							{NOW.past.map((p) => (
								<div key={p.label} className="flex flex-col gap-1.5">
									<p className="font-sans text-[10px] tracking-[0.22em] uppercase text-text-faint">
										{p.label}
									</p>
									<p className="text-sm sm:text-base leading-relaxed text-text-muted font-light">
										{p.body}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
