"use client";

import { Separator } from "@/components/ui/separator";
import { useReveal } from "@/hooks/use-reveal";

export function Footer() {
	const scope = useReveal<HTMLElement>();

	return (
		<footer
			ref={scope}
			role="contentinfo"
			className="relative w-full px-6 sm:px-8 md:px-12 lg:px-16 pb-8 pt-0"
		>
			<div className="mx-auto w-full max-w-5xl" data-reveal>
				<Separator className="mb-8 bg-foreground/10" />

				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/30">
					<p className="font-mono text-xs tracking-wide">
						&copy; {new Date().getFullYear()} Soheil Fakour
					</p>
					<p className="font-mono text-xs tracking-wide">
						Built with Next.js and a sprinkle of Matrix magic.
					</p>
				</div>
			</div>
		</footer>
	);
}
