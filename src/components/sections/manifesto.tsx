import type { SectionId } from "@/lib/constants";
import { MANIFESTO } from "@/data/manifesto";
import { Surface } from "@/components/ui/surface";

export function ManifestoSection() {
	return (
		<section
			id={"manifesto" satisfies SectionId}
			// Generous breathing room after the hero — also gives the expanded hero
			// chat (which overflows the fold) clear space before this section begins.
			// While the chat is open (<html data-chat-open>), this section recedes so
			// the conversation is the sole focus; it eases back when the chat closes.
			className={[
				"relative mt-[20vh] w-full min-h-[100dvh] overflow-hidden",
				"transition-[opacity,filter] duration-500 ease-[var(--ease-signature)] motion-reduce:transition-none",
				"[:root[data-chat-open]_&]:opacity-25 [:root[data-chat-open]_&]:blur-[2px] [:root[data-chat-open]_&]:pointer-events-none",
			].join(" ")}
			aria-label="Manifesto"
		>
			<div className="flex items-center justify-center min-h-[100dvh] px-6 sm:px-8 md:px-12 lg:px-16 py-24">
				<Surface variant="panel" radius="lg" className="mx-auto grid w-full max-w-4xl gap-10 p-8 sm:p-12 md:grid-cols-[10rem_1fr] md:p-16">
					<div className="flex flex-col gap-4 md:pt-1">
						<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
							{MANIFESTO.label}
						</p>
						<p className="font-sans text-xs leading-relaxed tracking-wide text-text-muted">
							{MANIFESTO.subheading}
						</p>
					</div>

					<div>
						<h2 className="text-fluid-36-48 font-light tracking-tight text-foreground font-sans">
							{MANIFESTO.heading}
						</h2>

						<div className="mt-14 flex flex-col gap-10">
							{MANIFESTO.paragraphs.map((p) => (
								<div key={p.label} className="grid gap-3 sm:grid-cols-[7rem_1fr]">
									<p className="font-sans text-[10px] tracking-[0.22em] uppercase text-text-faint">
										{p.label}
									</p>
									<p className="text-base sm:text-lg leading-relaxed text-left text-text-muted font-light">
										{p.body}
									</p>
								</div>
							))}
						</div>
					</div>
				</Surface>
			</div>
		</section>
	);
}
