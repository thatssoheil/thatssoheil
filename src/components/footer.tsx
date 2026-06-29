import { LogoMark } from "@/components/logo";
import { SITE } from "@/lib/constants";

/**
 * Full-width footer bar — the bottom bookend to the fixed header. A faint
 * signal hairline (the hero's rule motif) rides the top edge, and the bar
 * blends up out of the page's black via a soft surface gradient. Static and
 * crisp by design: the page ends at the footer, so a scroll reveal can never
 * reliably complete — this is chrome, so it's simply present.
 */
export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer
			role="contentinfo"
			className="relative w-full overflow-hidden bg-[linear-gradient(to_bottom,transparent,var(--card))]"
		>
			{/* Top hairline — faint neutral rule with a short signal lead-in (hero motif) */}
			<span
				aria-hidden="true"
				className="absolute inset-x-0 top-0 block h-px w-full bg-foreground/10"
			>
				<span className="absolute inset-y-0 left-0 w-24 bg-[linear-gradient(to_right,var(--brand),transparent)] [filter:drop-shadow(0_0_4px_var(--primary))]" />
			</span>

			<div className="flex w-full flex-col items-center gap-3 px-6 py-10 font-sans text-xs tracking-wide sm:flex-row sm:justify-between sm:px-8 md:px-12 lg:px-16">
				<div className="flex items-center gap-2.5 text-foreground/50">
					<LogoMark className="h-4" />
					<span>
						&copy; {year} {SITE.name}
					</span>
				</div>

				<p className="text-foreground/35">
					Built with Next.js, deployed on Cloudflare.
				</p>
			</div>
		</footer>
	);
}
