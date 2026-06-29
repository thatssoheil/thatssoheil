import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIALS, EMAIL, type SectionId } from "@/lib/constants";

export function ConnectSection() {
	return (
		<section
			id={"connect" satisfies SectionId}
			className="relative w-full min-h-[80dvh] overflow-hidden"
			aria-label="Connect"
		>
			<div className="flex items-center justify-center min-h-[80dvh] px-6 sm:px-8 md:px-12 lg:px-16 py-24">
				<div className="glass-panel glass-edge mx-auto w-full max-w-3xl flex flex-col items-center text-center gap-8 rounded-3xl p-8 sm:p-12 md:p-16">
					<p className="font-mono text-sm tracking-[0.2em] uppercase text-brand">
						Connect
					</p>

					<h2 className="text-fluid-36-60 font-light tracking-tight text-foreground font-sans">
						Say hello.
					</h2>

					<p className="text-lg text-foreground/55 max-w-xl leading-relaxed font-light">
						Email first. Catch me on X. Everything else, eventually.
					</p>

					<div>
						<Button asChild size="lg" className="gap-2 text-base h-12">
							<a href={`mailto:${EMAIL}`}>
								<Mail className="size-5" />
								{EMAIL}
							</a>
						</Button>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-3 pt-4">
						{SOCIALS.map(({ label, href, icon: Icon }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
								title={label}
								className="group flex items-center justify-center rounded-full border border-foreground/10 p-3.5 text-foreground/50 hover:border-foreground/30 hover:text-foreground hover:bg-foreground/5"
							>
								<Icon className="size-5" />
							</a>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
