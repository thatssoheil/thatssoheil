import { NAV_LINKS } from "@/lib/constants";
import { Surface } from "@/components/ui/surface";

export default function Loading() {
	return (
		<div className="min-h-screen bg-background flex flex-col" role="status" aria-label="Loading page">
			{/* Header skeleton */}
			<div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[var(--z-header)] px-5 sm:px-6 md:px-8">
				<Surface
					variant="chrome"
					radius="md"
					className="mx-auto flex min-h-14 w-full max-w-4xl items-center justify-between px-4 sm:px-5"
				>
					<div className="h-4 w-28 rounded bg-alpha-300" />
					<div className="hidden sm:flex items-center gap-6">
						{Array.from({ length: NAV_LINKS.length }).map((_, i) => (
							<div key={i} className="h-3 w-16 rounded bg-alpha-200" />
						))}
					</div>
				</Surface>
			</div>

			{/* Hero skeleton */}
			<div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
				<div className="h-12 sm:h-16 md:h-20 w-64 sm:w-[28rem] rounded bg-foreground/8" />
				<div className="h-4 w-56 rounded bg-foreground/5" />
			</div>

			<span className="sr-only">Loading…</span>
		</div>
	);
}
