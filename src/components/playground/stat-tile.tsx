/**
 * A single headline number with a quiet label and an optional hint line.
 */
export function StatTile({
	label,
	value,
	hint,
}: {
	label: string;
	value: string;
	hint?: string;
}) {
	return (
		<div className="flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-4">
			<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
				{label}
			</span>
			<span className="text-heading-24 text-foreground">{value}</span>
			{hint ? <span className="text-copy-13 text-text-muted">{hint}</span> : null}
		</div>
	);
}
