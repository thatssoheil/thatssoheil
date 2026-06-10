"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIALS, EMAIL, type SectionId } from "@/lib/constants";
import { useReveal } from "@/hooks/use-reveal";

export function ConnectSection() {
	const scope = useReveal<HTMLElement>();

	return (
		<section
			ref={scope}
			id={"connect" satisfies SectionId}
			className="relative w-full min-h-[80dvh] overflow-hidden bg-background"
			aria-label="Connect"
		>
			<div className="flex items-center justify-center min-h-[80dvh] px-6 sm:px-8 md:px-12 lg:px-16">
				<div className="mx-auto w-full max-w-3xl flex flex-col items-center text-center gap-8 py-24">
					<p
						data-reveal
						className="font-mono text-sm tracking-[0.2em] uppercase text-brand"
					>
						Connect
					</p>

					<h2
						data-reveal
						className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-foreground font-sans"
					>
						Say hello.
					</h2>

					<p
						data-reveal
						className="text-lg text-foreground/55 max-w-xl leading-relaxed font-light"
					>
						Email first. Catch me on X. Everything else, eventually.
					</p>

					<div data-reveal>
						<Button asChild size="lg" className="gap-2 text-base h-12">
							<a href={`mailto:${EMAIL}`}>
								<Mail className="size-5" />
								{EMAIL}
							</a>
						</Button>
					</div>

					<div
						data-reveal
						className="flex flex-wrap items-center justify-center gap-3 pt-4"
					>
						{SOCIALS.map(({ label, href, icon: Icon }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
								title={label}
								className="group flex items-center justify-center rounded-full border border-foreground/10 p-3.5 text-foreground/50 transition-all duration-300 hover:border-foreground/30 hover:text-foreground hover:bg-foreground/5"
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
