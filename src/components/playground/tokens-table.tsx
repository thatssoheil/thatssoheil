import type { RwaToken } from "@/lib/playground/types";
import { formatPct, formatPrice, formatUsdCompact } from "@/lib/playground/format";

function changeClass(change: number): string {
	if (change > 0) return "text-kumo-link";
	if (change < 0) return "text-kumo-default";
	return "text-kumo-default opacity-80";
}

/**
 * Top tokens by 24-hour volume across chains. The same stock appears once per
 * wrapper — that duplication is the point (see the wrapper race above).
 */
export function TokensTable({ tokens }: { tokens: RwaToken[] }) {
	return (
		<div className="overflow-x-auto rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-2 sm:px-6 sm:py-3">
			<table className="w-full border-collapse text-left">
				<thead>
					<tr className="text-label uppercase  text-kumo-default opacity-70">
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
							className="border-t border-kumo-hairline align-top"
						>
							<td className="py-2.5 pr-3">
								<span className="flex flex-col gap-0.5">
									<span className="text-body-sm text-kumo-default">{token.symbol}</span>
									<span className="max-w-44 truncate text-label text-kumo-default opacity-70">
										{token.name}
									</span>
								</span>
							</td>
							<td className="hidden py-2.5 pr-3 sm:table-cell">
								<span className="flex flex-col gap-0.5">
									<span className="text-body-sm text-kumo-default opacity-80">{token.issuer}</span>
									<span className="text-code text-kumo-default opacity-70">{token.chain}</span>
								</span>
							</td>
							<td className="py-2.5 pr-3 text-right text-code text-kumo-default">
								{formatPrice(token.price)}
							</td>
							<td className="py-2.5 pr-3 text-right text-code text-kumo-default">
								{formatUsdCompact(token.volume24h)}
							</td>
							<td
								className={`py-2.5 pr-3 text-right text-code ${changeClass(token.change24h)}`}
							>
								{formatPct(token.change24h)}
							</td>
							<td className="hidden py-2.5 text-right text-code text-kumo-default opacity-80 md:table-cell">
								{formatUsdCompact(token.liquidity)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
