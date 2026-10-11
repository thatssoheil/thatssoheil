import { NAV_LINKS, SITE } from "@/lib/constants";
import { Surface } from "@/components/ui";

export default function Loading() {
	return (
		<>
			<title>{`Loading | ${SITE.name}`}</title>
			<div className="flex min-h-stable-screen flex-col bg-kumo-canvas" role="status" aria-label="Loading page">
				<div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[var(--z-header)] px-5 sm:px-8 md:px-12 lg:px-16">
					<Surface
						layer="elevated"
						className="mx-auto flex min-h-14 w-full max-w-4xl items-center justify-between rounded-lg px-4 shadow-xs ring ring-kumo-line sm:px-5"
					>
						<div className="h-4 w-28 rounded bg-kumo-fill-hover" />
						<div className="hidden items-center gap-6 sm:flex">
							{Array.from({ length: NAV_LINKS.length }).map((_, i) => (
								<div key={i} className="h-3 w-16 rounded bg-kumo-fill-hover" />
							))}
						</div>
					</Surface>
				</div>

				<div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
					<div className="h-12 w-64 rounded bg-kumo-fill-hover sm:h-16 sm:w-[28rem] md:h-20" />
					<div className="h-4 w-56 rounded bg-kumo-fill-hover" />
				</div>
				<span className="sr-only">Loading…</span>
			</div>
		</>
	);
}
