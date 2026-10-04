import { formatDateShort } from "@/lib/playground/format";

interface AreaChartPoint {
	date: string;
	value: number;
}

/**
 * Hand-rolled SVG area chart - no chart dependency, static markup (no client
 * JS), scales fluidly with its container. One series, one story: the shape of
 * the trend, with the peak called out in the caption. Linear by default; an
 * optional log value scale suits series that span orders of magnitude.
 */
export function AreaChart({
	points,
	formatValue,
	ariaLabel,
	height = 180,
	peakLabel = "peak",
	scale = "linear",
}: {
	points: AreaChartPoint[];
	formatValue: (value: number) => string;
	ariaLabel: string;
	height?: number;
	peakLabel?: string;
	scale?: "linear" | "log";
}) {
	if (points.length < 2) return null;

	const width = 1000;
	const pad = 6;
	const values = points.map((point) => point.value);
	const max = Math.max(...values, 1);
	const positives = values.filter((value) => value > 0);
	const min = positives.length > 0 ? Math.min(...positives) : 1;
	const logSpan = Math.log(max) - Math.log(min);
	const norm = (value: number) => {
		if (scale === "log" && logSpan > 0 && value > 0) {
			return (Math.log(value) - Math.log(min)) / logSpan;
		}
		return value / max;
	};
	const step = width / (points.length - 1);
	const y = (value: number) => height - pad - norm(value) * (height - pad * 2);

	const line = points
		.map(
			(point, index) =>
				`${index === 0 ? "M" : "L"}${(index * step).toFixed(2)},${y(point.value).toFixed(2)}`,
		)
		.join(" ");
	const area = `${line} L${width},${height} L0,${height} Z`;

	const peakIndex = values.indexOf(max);
	const peak = points[peakIndex];
	const midValue = scale === "log" && logSpan > 0 ? Math.sqrt(max * min) : max / 2;
	const midY = y(midValue);

	return (
		<figure className="w-full">
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="h-auto w-full text-brand"
				role="img"
				aria-label={ariaLabel}
			>
				<line
					x1={0}
					x2={width}
					y1={midY}
					y2={midY}
					className="text-alpha-200"
					stroke="currentColor"
					strokeWidth={1}
					strokeDasharray="4 6"
					vectorEffect="non-scaling-stroke"
				/>
				<path d={area} fill="currentColor" fillOpacity={0.1} />
				<path
					d={line}
					fill="none"
					stroke="currentColor"
					strokeWidth={1.5}
					vectorEffect="non-scaling-stroke"
				/>
			</svg>
			<figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-label-12-mono text-text-faint">
				<span>
					{formatDateShort(points[0].date)} to {formatDateShort(points[points.length - 1].date)}
				</span>
				<span>
					{peakLabel} {formatValue(peak.value)} · {formatDateShort(peak.date)}
				</span>
			</figcaption>
		</figure>
	);
}
