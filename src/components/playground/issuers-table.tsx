import type { RwaIssuer } from "@/lib/playground/types";
import { formatNumberCompact, formatUsdCompact } from "@/lib/playground/format";

function ChainList({ chains }: { chains: string[] }) {
	if (chains.length === 0) return null;
	const shown = chains.slice(0, 2).join(", ");
	const rest = chains.length - 2;
	return (
		<span className="text-label-12-mono text-text-faint">
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
		<div className="overflow-x-auto rounded-xl border border-border bg-card px-4 py-2 sm:px-6 sm:py-3">
			<table className="w-full border-collapse text-left">
				<thead>
					<tr className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
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
						<tr key={issuer.name} className="border-t border-alpha-200 align-top">
							<td className="py-2.5 pr-3 text-label-13-mono text-text-faint">{index + 1}</td>
							<td className="py-2.5 pr-3">
								<span className="flex flex-col gap-0.5">
									<span className="text-copy-14 text-foreground">{issuer.name}</span>
									<ChainList chains={issuer.chains} />
								</span>
							</td>
							<td className="py-2.5 pr-3 text-right">
								<span className="block text-copy-14-mono text-foreground">
									{formatUsdCompact(issuer.volume24h)}
								</span>
								<span className="ml-auto mt-1.5 block h-0.5 w-24 rounded-full bg-alpha-100">
									<span
										className="block h-0.5 rounded-full bg-primary"
										style={{ width: `${Math.min(issuer.share, 100).toFixed(1)}%` }}
									/>
								</span>
							</td>
							<td className="hidden py-2.5 pr-3 text-right text-copy-14-mono text-text-muted sm:table-cell">
								{formatUsdCompact(issuer.marketCap)}
							</td>
							<td className="hidden py-2.5 pr-3 text-right text-copy-14-mono text-text-muted sm:table-cell">
								{formatNumberCompact(issuer.assets)}
							</td>
							<td className="hidden py-2.5 pr-3 text-right text-copy-14-mono text-text-muted md:table-cell">
								{formatUsdCompact(issuer.liquidity)}
							</td>
							<td className="hidden py-2.5 text-right text-copy-14-mono text-text-muted md:table-cell">
								{formatNumberCompact(issuer.holders)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
