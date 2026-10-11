import { LogoMark } from "@/components/logo";
import { Surface } from "@/components/ui";
import { SITE } from "@/lib/constants";

/** Static page-end bookend. */
export function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer
			role="contentinfo"
			className="relative z-10 w-full px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-16 sm:px-8 md:px-12 lg:px-16"
		>
			<Surface
				layer="elevated"
				className="relative mx-auto flex min-h-14 w-full max-w-4xl flex-col items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-3 font-sans text-sm shadow-xs ring ring-kumo-line sm:flex-row sm:justify-between sm:px-5 sm:py-0"
			>
				<div className="flex min-h-8 items-center gap-2.5 text-kumo-default opacity-80">
					<LogoMark className="h-4" />
					<span>&copy; {year} {SITE.name}</span>
				</div>

				<p className="text-kumo-default opacity-70">
					Built with Next.js, deployed on Cloudflare.
				</p>
			</Surface>
		</footer>
	);
}
