import { LogoMark } from "@/components/logo";
import { Surface } from "@/components/ui/surface";
import { SITE } from "@/lib/constants";

/**
 * Bottom glass island — the page-end bookend to the fixed header.
 * Static and crisp by design: the page ends at the footer, so a scroll reveal
 * can never reliably complete.
 */
export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer
			role="contentinfo"
			className="relative z-10 w-full px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-16 sm:px-8 md:px-12 lg:px-16"
		>
			<Surface
				variant="chrome"
				radius="md"
				className="relative mx-auto flex min-h-14 w-full max-w-4xl flex-col items-center justify-center gap-2 overflow-hidden px-4 py-3 font-sans text-xs tracking-wide sm:flex-row sm:justify-between sm:px-5 sm:py-0"
			>
				<div className="flex min-h-8 items-center gap-2.5 text-text-muted">
					<LogoMark className="h-4" />
					<span>
						&copy; {year} {SITE.name}
					</span>
				</div>

				<p className="text-text-faint">
					Built with Next.js, deployed on Cloudflare.
				</p>
			</Surface>
		</footer>
	);
}
