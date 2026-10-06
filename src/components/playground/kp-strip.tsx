import type { SolarForecastBin } from "@/lib/playground/types";

/** The view shape both strips render: one Kp value per 3-hour bin. */
export interface KpStripBin {
	t: string;
	kp: number;
	scale?: string | null;
	type?: SolarForecastBin["type"];
}

/**
 * Hand-rolled SVG strip for Kp bins: bar height encodes the index, and the
 * fill carries the reading's character - storm-labeled bins take the alert
 * hue, everything else rides the brand ramp. Static markup (no client JS);
 * the strip scales with its container.
 */
export function KpStrip({
	bins,
	ariaLabel,
	mode = "level",
	peakIndex,
}: {
	bins: KpStripBin[];
	ariaLabel: string;
	/** "level": opacity tracks the Kp value. "outlook": opacity tracks bin type. */
	mode?: "level" | "outlook";
	/** Marks this bin with a dot above the bar (the week's peak). */
	peakIndex?: number;
}) {
	if (bins.length === 0) return null;

	const width = 1000;
	const height = 150;
	const baseline = 144;
	const topPad = 12;
	const gap = bins.length > 40 ? 4 : 6;
	const step = width / bins.length;
	const barWidth = Math.max(step - gap, 2);
	const chartHeight = baseline - topPad;
	const thresholdY = baseline - (5 / 9) * chartHeight;

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			className="h-auto w-full"
			role="img"
			aria-label={ariaLabel}
		>
			{/* dashed hairline at Kp 5, NOAA's storm threshold */}
			<line
				x1={0}
				x2={width}
				y1={thresholdY}
				y2={thresholdY}
				className="text-alpha-400"
				stroke="currentColor"
				strokeWidth={1}
				strokeDasharray="4 5"
				vectorEffect="non-scaling-stroke"
			/>
			<line
				x1={0}
				x2={width}
				y1={baseline}
				y2={baseline}
				className="text-alpha-200"
				stroke="currentColor"
				strokeWidth={1}
				vectorEffect="non-scaling-stroke"
			/>
			{bins.map((bin, index) => {
				const barHeight = Math.max((bin.kp / 9) * chartHeight, 2);
				const storm = Boolean(bin.scale);
				const opacity =
					mode === "outlook"
						? bin.type === "predicted"
							? 0.3
							: 0.72
						: 0.22 + (bin.kp / 9) * 0.7;
				return (
					<rect
						key={bin.t}
						x={index * step + gap / 2}
						y={baseline - barHeight}
						width={barWidth}
						height={barHeight}
						rx={2}
						className={storm ? "text-destructive" : "text-brand"}
						fill="currentColor"
						fillOpacity={storm ? 0.8 : opacity}
					/>
				);
			})}
			{typeof peakIndex === "number" && bins[peakIndex] ? (
				<circle
					cx={peakIndex * step + step / 2}
					cy={baseline - Math.max((bins[peakIndex].kp / 9) * chartHeight, 2) - 6}
					r={3}
					className={bins[peakIndex].scale ? "text-destructive" : "text-brand"}
					fill="currentColor"
					fillOpacity={0.95}
				/>
			) : null}
		</svg>
	);
}
