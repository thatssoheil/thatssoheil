import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIALS, EMAIL, type SectionId } from "@/lib/constants";
import { Surface } from "@/components/ui/surface";

export function ConnectSection() {
	return (
		<section
			id={"connect" satisfies SectionId}
			className="relative min-h-[100dvh] w-full overflow-hidden"
			aria-label="Connect"
		>
			<div className="flex min-h-[100dvh] items-start justify-center px-5 pb-16 pt-32 sm:px-8 md:items-center md:px-12 md:py-24 lg:px-16">
				<Surface
					variant="panel"
					radius="lg"
					className="relative isolate mx-auto grid w-full max-w-4xl gap-10 overflow-hidden p-6 text-left sm:p-12 md:p-16"
				>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_72%_at_78%_54%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_72%)]"
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

					<div className="relative z-10 flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center">
						<Button
							asChild
							size="lg"
							className="h-12 w-full min-w-0 justify-center gap-2 border border-alpha-300 bg-primary text-sm shadow-[0_0_16px_color-mix(in_oklch,var(--primary)_14%,transparent)] hover:bg-primary/90 sm:w-auto sm:text-base"
						>
							<a href={`mailto:${EMAIL}`} className="min-w-0">
								<Mail className="size-5 shrink-0" />
								<span className="min-w-0 truncate">{EMAIL}</span>
							</a>
						</Button>

						<div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
							{SOCIALS.map(({ label, href, icon: Icon }) => (
								<a
									key={label}
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={label}
									title={label}
									className="group flex size-11 items-center justify-center rounded-xl border border-transparent text-text-faint transition-colors hover:border-alpha-300 hover:bg-alpha-100 hover:text-foreground"
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
