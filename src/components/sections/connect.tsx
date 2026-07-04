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
				<Surface variant="panel" radius="lg" className="mx-auto grid w-full max-w-4xl gap-8 p-8 text-left sm:p-12 md:grid-cols-[1fr_auto] md:items-end md:p-16">
					<div>
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

					<div className="flex flex-col items-start gap-5 md:items-end">
						<Button asChild size="lg" className="gap-2 text-base h-12">
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
									className="group flex items-center justify-center rounded-full border border-alpha-300 p-3.5 text-text-faint hover:border-alpha-500 hover:text-foreground hover:bg-alpha-100"
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
