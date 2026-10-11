import type { RwaWrapperGroup } from "@/lib/playground/types";
import { formatPrice, formatUsdCompact } from "@/lib/playground/format";

/**
 * The wrapper race — one underlying asset (say NVDA), several competing
 * wrappers across issuers and chains. Price spread is the widest gap between
 * wrapper prices; volume shows where the trading actually happens.
 */
export function WrapperRace({ groups }: { groups: RwaWrapperGroup[] }) {
	return (
		<div className="flex flex-col gap-3">
			{groups.map((group) => (
				<div
					key={group.underlying}
					className="rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-4 sm:px-5"
				>
					<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
						<div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
							<span className="text-heading text-kumo-default">{group.underlying}</span>
							<span className="text-code text-kumo-default opacity-70">
								{group.wrappers.length} wrappers · {formatUsdCompact(group.totalVolume)} volume
							</span>
						</div>
						<span className="text-code text-kumo-default opacity-80">
							spread {group.spreadPct.toFixed(2)}%
						</span>
					</div>

					<div className="mt-3">
						{group.wrappers.map((wrapper, index) => (
							<div
								key={`${wrapper.chain}:${wrapper.symbol}`}
								className={`flex items-baseline justify-between gap-3 py-2 ${
									index > 0 ? "border-t border-kumo-hairline" : ""
								}`}
							>
								<div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
									<span className="text-code text-kumo-default">{wrapper.symbol}</span>
									<span className="truncate text-label text-kumo-default opacity-70">
										{wrapper.issuer} · {wrapper.chain}
									</span>
								</div>
								<div className="flex shrink-0 items-baseline gap-4">
									<span className="text-code text-kumo-default">
										{formatPrice(wrapper.price)}
									</span>
									<span className="w-20 text-right text-code text-kumo-default opacity-80">
										{formatUsdCompact(wrapper.volume24h)}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
