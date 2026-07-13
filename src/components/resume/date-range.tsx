interface DateRangeProps {
	label: string;
	startDate: string;
	endDate?: string;
}

export function DateRange({ label, startDate, endDate }: DateRangeProps) {
	const [startLabel, endLabel] = label.split(" — ");

	if (!endLabel) return <span><time dateTime={startDate}>{label}</time></span>;

	return (
		<span>
			<time dateTime={startDate}>{startLabel}</time>
			<span> — </span>
			{endDate ? <time dateTime={endDate}>{endLabel}</time> : <span>{endLabel}</span>}
		</span>
	);
}
