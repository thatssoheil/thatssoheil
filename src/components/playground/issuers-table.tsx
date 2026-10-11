import type { RwaIssuer } from "@/lib/playground/types";
import { formatNumberCompact, formatUsdCompact } from "@/lib/playground/format";

function ChainList({ chains }: { chains: string[] }) {
	if (chains.length === 0) return null;
	const shown = chains.slice(0, 2).join(", ");
	const rest = chains.length - 2;
	return (
		<span className="text-code text-kumo-default opacity-70">
			{shown}
			{rest > 0 ? ` +${rest}` : ""}
		</span>
	);
}

/**
 * Issuer leaderboard — ranked by 24-hour volume, with a share bar so the
 * concentration is visible at a glance.
 */
export function IssuersTable({ issuers }: { issuers: RwaIssuer[] }) {
	return (
		<div className="overflow-x-auto rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-2 sm:px-6 sm:py-3">
			<table className="w-full border-collapse text-left">
				<thead>
					<tr className="text-label uppercase  text-kumo-default opacity-70">
						<th className="py-2.5 pr-3 font-normal">#</th>
						<th className="py-2.5 pr-3 font-normal">Issuer</th>
						<th className="py-2.5 pr-3 text-right font-normal">24-hour volume</th>
						<th className="hidden py-2.5 pr-3 text-right font-normal sm:table-cell">
							Market cap
						</th>
						<th className="hidden py-2.5 pr-3 text-right font-normal sm:table-cell">Assets</th>
						<th className="hidden py-2.5 pr-3 text-right font-normal md:table-cell">
							Liquidity
						</th>
						<th className="hidden py-2.5 text-right font-normal md:table-cell">Holders</th>
					</tr>
				</thead>
				<tbody>
					{issuers.map((issuer, index) => (
						<tr key={issuer.name} className="border-t border-kumo-hairline align-top">
							<td className="py-2.5 pr-3 text-code text-kumo-default opacity-70">{index + 1}</td>
							<td className="py-2.5 pr-3">
								<span className="flex flex-col gap-0.5">
									<span className="text-body-sm text-kumo-default">{issuer.name}</span>
									<ChainList chains={issuer.chains} />
								</span>
							</td>
							<td className="py-2.5 pr-3 text-right">
								<span className="block text-code text-kumo-default">
									{formatUsdCompact(issuer.volume24h)}
								</span>
								<span className="ml-auto mt-1.5 block h-0.5 w-24 rounded-full bg-kumo-fill-hover">
									<span
										className="block h-0.5 rounded-full bg-kumo-brand"
										style={{ width: `${Math.min(issuer.share, 100).toFixed(1)}%` }}
									/>
								</span>
							</td>
							<td className="hidden py-2.5 pr-3 text-right text-code text-kumo-default opacity-80 sm:table-cell">
								{formatUsdCompact(issuer.marketCap)}
							</td>
							<td className="hidden py-2.5 pr-3 text-right text-code text-kumo-default opacity-80 sm:table-cell">
								{formatNumberCompact(issuer.assets)}
							</td>
							<td className="hidden py-2.5 pr-3 text-right text-code text-kumo-default opacity-80 md:table-cell">
								{formatUsdCompact(issuer.liquidity)}
							</td>
							<td className="hidden py-2.5 text-right text-code text-kumo-default opacity-80 md:table-cell">
								{formatNumberCompact(issuer.holders)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
