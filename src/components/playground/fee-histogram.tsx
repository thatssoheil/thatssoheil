import type { NetworkHistogramBucket } from "@/lib/playground/types";

/** Band lower edges (sat/vB) that get an axis label; the open top band adds "+". */
const LABEL_EDGES = new Set([0.5, 1, 2, 4, 8, 20, 80, 320]);

function formatEdge(edge: number): string {
	return edge < 1 ? edge.toFixed(1) : String(edge);
}

/**
 * Hand-rolled SVG bar chart for the mempool backlog: waiting volume by
 * fee-rate band. Static markup (no client JS); the bars scale with the
 * container and the labels ride a matching flex row underneath.
 */
export function FeeHistogram({
	buckets,
	ariaLabel,
}: {
	buckets: NetworkHistogramBucket[];
	ariaLabel: string;
}) {
	if (buckets.length === 0) return null;

	const width = 1000;
	const height = 150;
	const baseline = 144;
	const topPad = 8;
	const gap = 5;
	const max = Math.max(...buckets.map((bucket) => bucket.vsize), 1);
	const step = width / buckets.length;
	const barWidth = Math.max(step - gap, 2);
	const chartHeight = baseline - topPad;

	return (
		<div>
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="h-auto w-full"
				role="img"
				aria-label={ariaLabel}
			>
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
				{buckets.map((bucket, index) => {
					const barHeight =
						bucket.vsize > 0 ? Math.max((bucket.vsize / max) * chartHeight, 2) : 0;
					return (
						<rect
							key={bucket.lo}
							x={index * step + gap / 2}
							y={baseline - barHeight}
							width={barWidth}
							height={barHeight}
							rx={2}
							className="text-brand"
							fill="currentColor"
							fillOpacity={0.85}
						/>
					);
				})}
			</svg>
			<div className="mt-2 flex" aria-hidden="true">
				{buckets.map((bucket) => (
					<span
						key={bucket.lo}
						className="flex-1 text-center text-label-12-mono text-text-faint"
					>
						{LABEL_EDGES.has(bucket.lo)
							? Number.isFinite(bucket.hi)
								? formatEdge(bucket.lo)
								: `${formatEdge(bucket.lo)}+`
							: "\u00A0"}
					</span>
				))}
			</div>
		</div>
	);
}
