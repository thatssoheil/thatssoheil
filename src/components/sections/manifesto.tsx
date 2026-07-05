import type { SectionId } from "@/lib/constants";
import { MANIFESTO } from "@/data/manifesto";
import { Surface } from "@/components/ui/surface";
import { textRole, typeRole } from "@/components/ui/typography";

export function ManifestoSection() {
	return (
		<section
			id={"manifesto" satisfies SectionId}
			// Generous breathing room after the hero — also gives the expanded hero
			// chat (which overflows the fold) clear space before this section begins.
			// While the chat is open (<html data-chat-open>), this section recedes so
			// the conversation is the sole focus; it eases back when the chat closes.
			className={[
				"relative mt-stable-screen-gap w-full min-h-stable-screen overflow-hidden",
				"transition-[opacity,filter] duration-500 ease-[var(--ease-signature)] motion-reduce:transition-none",
				"[:root[data-chat-open]_&]:opacity-25 [:root[data-chat-open]_&]:blur-[2px] [:root[data-chat-open]_&]:pointer-events-none",
			].join(" ")}
			aria-label="Manifesto"
		>
			<div className="flex min-h-stable-screen items-center justify-center px-5 py-20 sm:px-8 sm:py-24 md:px-12 lg:px-16">
				<Surface
					variant="panel"
					radius="lg"
					className="relative isolate mx-auto grid w-full max-w-4xl gap-10 overflow-hidden p-6 sm:p-12 md:p-16"
				>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_58%_at_22%_24%,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_68%)]"
					/>

					<div className="relative z-10">
						<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
							{MANIFESTO.label}
						</p>

						<h2 className="mt-3 text-fluid-36-48 font-light tracking-tight text-foreground font-sans">
							{MANIFESTO.heading}
						</h2>

						<p className="mt-5 max-w-xl font-sans text-sm leading-relaxed tracking-wide text-text-muted sm:text-base">
							{MANIFESTO.subheading}
						</p>
					</div>

					<div className="relative z-10">
						<div className="flex flex-col gap-8 sm:gap-10">
							{MANIFESTO.paragraphs.map((p, index) => (
								<div
									key={p.label}
									className="relative grid gap-3 pt-6 first:pt-0 sm:grid-cols-[8.75rem_minmax(0,1fr)]"
								>
									{index > 0 ? (
										<span
											aria-hidden="true"
											className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--alpha-300),transparent)]"
										/>
									) : null}
									<p className={`whitespace-nowrap pt-[0.35em] text-text-faint ${typeRole.manifestoEntryLabel}`}>
										{p.label}
									</p>
									<p className={`text-left text-base leading-relaxed sm:text-lg ${textRole.muted}`}>
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
