/**
 * Section label in the site's eyebrow register, with an optional right-aligned
 * note (a timestamp, a count, a method hint).
 */
export function SectionHeading({ label, note }: { label: string; note?: string }) {
	return (
		<div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
			<h2 className="font-sans text-sm  uppercase text-kumo-link">{label}</h2>
			{note ? <span className="text-code text-kumo-default opacity-70">{note}</span> : null}
		</div>
	);
}
