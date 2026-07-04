import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIALS, EMAIL, type SectionId } from "@/lib/constants";
import { Surface } from "@/components/ui/surface";

export function ConnectSection() {
	return (
		<section
			id={"connect" satisfies SectionId}
			className="relative w-full min-h-[80dvh] overflow-hidden"
			aria-label="Connect"
		>
			<div className="flex items-center justify-center min-h-[80dvh] px-6 sm:px-8 md:px-12 lg:px-16 py-24">
				<Surface
					variant="panel"
					radius="lg"
					className="relative isolate mx-auto grid w-full max-w-4xl gap-8 overflow-hidden border-alpha-300/70 p-8 text-left sm:p-12 md:grid-cols-[1fr_auto] md:items-end md:p-16"
				>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_72%_at_78%_54%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_70%),radial-gradient(48%_52%_at_18%_20%,var(--alpha-200),transparent_64%)]"
					/>

					<div className="relative z-10">
						<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
							Connect
						</p>

						<h2 className="mt-3 text-fluid-36-60 font-light tracking-tight text-foreground font-sans">
							Say hello.
						</h2>

						<p className="mt-5 max-w-xl text-lg text-text-muted leading-relaxed font-light">
							Email first. Catch me on X. Everything else, eventually.
						</p>
					</div>

					<div className="relative z-10 flex flex-col items-start gap-5 rounded-2xl border border-alpha-300 bg-alpha-100 p-3 shadow-[inset_0_1px_0_var(--glass-sheen)] md:items-end">
						<Button
							asChild
							size="lg"
							className="h-12 gap-2 border border-alpha-300 bg-primary text-base shadow-[0_0_28px_color-mix(in_oklch,var(--primary)_24%,transparent)] hover:bg-primary/90"
						>
							<a href={`mailto:${EMAIL}`}>
								<Mail className="size-5" />
								{EMAIL}
							</a>
						</Button>

						<div className="flex flex-wrap items-center gap-3">
							{SOCIALS.map(({ label, href, icon: Icon }) => (
								<a
									key={label}
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={label}
									title={label}
									className="group flex items-center justify-center rounded-xl border border-alpha-300 bg-alpha-100 p-3 text-text-faint transition-colors hover:border-alpha-500 hover:bg-alpha-200 hover:text-foreground"
								>
									<Icon className="size-5" />
								</a>
							))}
						</div>
					</div>
				</Surface>
			</div>
		</section>
	);
}
