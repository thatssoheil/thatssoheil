import type { RwaToken } from "@/lib/playground/types";
import { formatPct, formatPrice, formatUsdCompact } from "@/lib/playground/format";

function changeClass(change: number): string {
	if (change > 0) return "text-brand";
	if (change < 0) return "text-destructive";
	return "text-text-muted";
}

/**
 * Top tokens by 24-hour volume across chains. The same stock appears once per
 * wrapper — that duplication is the point (see the wrapper race above).
 */
export function TokensTable({ tokens }: { tokens: RwaToken[] }) {
	return (
		<div className="overflow-x-auto rounded-xl border border-border bg-card px-4 py-2 sm:px-6 sm:py-3">
			<table className="w-full border-collapse text-left">
				<thead>
					<tr className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
						<th className="py-2.5 pr-3 font-normal">Token</th>
						<th className="hidden py-2.5 pr-3 font-normal sm:table-cell">Issuer</th>
						<th className="py-2.5 pr-3 text-right font-normal">Price</th>
						<th className="py-2.5 pr-3 text-right font-normal">24-hour volume</th>
						<th className="py-2.5 pr-3 text-right font-normal">24-hour change</th>
						<th className="hidden py-2.5 text-right font-normal md:table-cell">Liquidity</th>
					</tr>
				</thead>
				<tbody>
					{tokens.map((token) => (
						<tr
							key={`${token.chain}:${token.symbol}:${token.issuer}`}
							className="border-t border-alpha-200 align-top"
						>
							<td className="py-2.5 pr-3">
								<span className="flex flex-col gap-0.5">
									<span className="text-copy-14 text-foreground">{token.symbol}</span>
									<span className="max-w-44 truncate text-label-12 text-text-faint">
										{token.name}
									</span>
								</span>
							</td>
							<td className="hidden py-2.5 pr-3 sm:table-cell">
								<span className="flex flex-col gap-0.5">
									<span className="text-copy-13 text-text-muted">{token.issuer}</span>
									<span className="text-label-12-mono text-text-faint">{token.chain}</span>
								</span>
							</td>
							<td className="py-2.5 pr-3 text-right text-copy-14-mono text-foreground">
								{formatPrice(token.price)}
							</td>
							<td className="py-2.5 pr-3 text-right text-copy-14-mono text-foreground">
								{formatUsdCompact(token.volume24h)}
							</td>
							<td
								className={`py-2.5 pr-3 text-right text-copy-14-mono ${changeClass(token.change24h)}`}
							>
								{formatPct(token.change24h)}
							</td>
							<td className="hidden py-2.5 text-right text-copy-14-mono text-text-muted md:table-cell">
								{formatUsdCompact(token.liquidity)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
