/**
 * Section label in the site's eyebrow register, with an optional right-aligned
 * note (a timestamp, a count, a method hint).
 */
export function SectionHeading({ label, note }: { label: string; note?: string }) {
	return (
		<div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
			<h2 className="font-sans text-sm tracking-[0.2em] uppercase text-brand">{label}</h2>
			{note ? <span className="text-label-12-mono text-text-faint">{note}</span> : null}
		</div>
	);
}
