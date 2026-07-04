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
				<Surface
					variant="panel"
					radius="lg"
					className="relative isolate mx-auto grid w-full max-w-4xl gap-10 overflow-hidden border-alpha-300/70 p-8 sm:p-12 md:grid-cols-[10rem_1fr] md:p-16"
				>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_18%_24%,var(--alpha-200),transparent_62%),radial-gradient(56%_46%_at_82%_72%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_70%)]"
					/>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-[linear-gradient(to_right,transparent,var(--alpha-400),transparent)] opacity-60"
					/>

					<div className="relative z-10 isolate flex flex-col gap-4 md:pt-1">
						<span
							aria-hidden="true"
							className="absolute -inset-x-3 -inset-y-4 -z-10 rounded-2xl bg-[linear-gradient(180deg,var(--alpha-100),transparent)] shadow-[inset_1px_0_0_var(--alpha-300)]"
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

						<div className="mt-14 flex flex-col gap-10">
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
