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
		<div className="flex flex-col gap-1 rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-4">
			<span className="text-label uppercase  text-kumo-default opacity-70">
				{label}
			</span>
			<span className="text-heading text-kumo-default">{value}</span>
			{hint ? <span className="text-body-sm text-kumo-default opacity-80">{hint}</span> : null}
		</div>
	);
}
