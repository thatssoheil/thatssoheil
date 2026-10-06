/** The view shape the strip renders: one hourly PM2.5 value per bin. */
export interface PmStripBin {
	t: string;
	pm25: number;
	/** True for bins after the current hour (the model's forecast). */
	forecast?: boolean;
}

/**
 * Hand-rolled SVG strip for hourly PM2.5: bar height encodes the value, a
 * dashed hairline marks the WHO 24-hour guideline, forecast bins render
 * faded, and the current hour gets a dot. Static markup (no client JS); the
 * strip scales with its container.
 */
export function PmStrip({
	bins,
	ariaLabel,
	guideline,
	currentIndex,
}: {
	bins: PmStripBin[];
	ariaLabel: string;
	/** The comparison value (WHO 24-hour guideline), drawn as a hairline. */
	guideline: number;
	/** Marks this bin with a dot above the bar (the current hour). */
	currentIndex?: number;
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
	const scaleMax = Math.max(...bins.map((bin) => bin.pm25), guideline * 1.5) * 1.05;
	const barY = (value: number) => baseline - Math.max((value / scaleMax) * chartHeight, 2);
	const guidelineY = barY(guideline);

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			className="h-auto w-full"
			role="img"
			aria-label={ariaLabel}
		>
			{/* dashed hairline at the WHO 24-hour guideline */}
			<line
				x1={0}
				x2={width}
				y1={guidelineY}
				y2={guidelineY}
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
				const y = barY(bin.pm25);
				const opacity = bin.forecast ? 0.3 : 0.22 + (bin.pm25 / scaleMax) * 0.7;
				return (
					<rect
						key={bin.t}
						x={index * step + gap / 2}
						y={y}
						width={barWidth}
						height={baseline - y}
						rx={2}
						className="text-brand"
						fill="currentColor"
						fillOpacity={opacity}
					/>
				);
			})}
			{typeof currentIndex === "number" && bins[currentIndex] ? (
				<circle
					cx={currentIndex * step + step / 2}
					cy={barY(bins[currentIndex].pm25) - 6}
					r={3}
					className="text-brand"
					fill="currentColor"
					fillOpacity={0.95}
				/>
			) : null}
		</svg>
	);
}
