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
			<div className="flex min-h-[100dvh] items-center justify-center px-5 py-20 sm:px-8 sm:py-24 md:px-12 lg:px-16">
				<Surface
					variant="panel"
					radius="lg"
					className="relative isolate mx-auto grid w-full max-w-4xl gap-8 overflow-hidden p-6 sm:gap-10 sm:p-12 md:grid-cols-[10rem_1fr] md:p-16"
				>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_58%_at_22%_24%,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_68%)]"
					/>

					<div className="relative z-10 isolate flex flex-col gap-4 md:pt-1">
						<span
							aria-hidden="true"
							className="absolute -left-3 top-0 -z-10 h-28 w-24 rounded-2xl bg-[linear-gradient(180deg,var(--alpha-100),transparent)] shadow-[inset_1px_0_0_var(--alpha-300)]"
						/>
						<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
							{MANIFESTO.label}
						</p>
						<p className="font-sans text-xs leading-relaxed tracking-wide text-text-muted">
							{MANIFESTO.subheading}
						</p>
					</div>

					<div className="relative z-10">
						<h2 className="text-fluid-36-48 font-light tracking-tight text-foreground font-sans">
							{MANIFESTO.heading}
						</h2>

						<div className="mt-10 flex flex-col gap-8 sm:mt-14 sm:gap-10">
							{MANIFESTO.paragraphs.map((p, index) => (
								<div
									key={p.label}
									className="relative grid gap-3 pt-6 first:pt-0 sm:grid-cols-[7rem_1fr]"
								>
									{index > 0 ? (
										<span
											aria-hidden="true"
											className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--alpha-300),transparent)]"
										/>
									) : null}
									<p className="pt-[0.35em] font-sans text-[11px] tracking-[0.16em] uppercase text-text-faint">
										{p.label}
									</p>
									<p className="text-left text-base leading-relaxed text-foreground/75 sm:text-lg">
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
