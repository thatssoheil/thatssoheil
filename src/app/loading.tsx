export default function Loading() {
	return (
		<div className="min-h-screen bg-background flex flex-col" role="status" aria-label="Loading page">
			{/* Header skeleton */}
			<div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-6 sm:px-8 md:px-12 lg:px-16 bg-background/80 backdrop-blur-md border-b border-border/40">
				<div className="h-4 w-28 rounded bg-foreground/10 animate-pulse" />
				<div className="hidden sm:flex items-center gap-6">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="h-3 w-16 rounded bg-foreground/8 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
					))}
				</div>
			</div>

			{/* Hero skeleton */}
			<div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
				<div className="h-12 sm:h-16 md:h-20 w-80 sm:w-[28rem] rounded bg-foreground/8 animate-pulse" />
				<div className="h-4 w-56 rounded bg-foreground/5 animate-pulse" style={{ animationDelay: "150ms" }} />
			</div>

			<span className="sr-only">Loading…</span>
		</div>
	);
}
