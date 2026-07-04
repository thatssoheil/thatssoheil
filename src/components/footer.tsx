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
			className="relative z-10 w-full px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-16 sm:px-6 md:px-8"
		>
			<Surface
				variant="chrome"
				radius="lg"
				className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-3 overflow-hidden px-4 py-5 font-sans text-xs tracking-wide sm:flex-row sm:justify-between sm:px-5"
			>
				{/* Signal lead-in — the hero rule motif, contained to the island edge. */}
				<span
					aria-hidden="true"
					className="absolute inset-x-4 top-0 block h-px bg-alpha-300 sm:inset-x-5"
				>
					<span className="absolute inset-y-0 left-0 w-24 bg-[linear-gradient(to_right,var(--brand),transparent)] [filter:drop-shadow(0_0_4px_var(--primary))]" />
				</span>

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
