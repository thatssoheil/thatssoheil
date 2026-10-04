// ─── Playground: BTC and ETH macro notes ───
// One entry per weekly read, newest first. Every number comes from a live run
// of the crypto-macro-analysis engines on their committed dataset
// (strategies/macro_regime_v3.py and strategies/eth_macro_regime.py).
// The repo is stateless by design: never hand-edit a number here without
// re-running the engines.

import type { MacroNote } from "@/lib/playground/types";

export const MACRO_NOTES: readonly MacroNote[] = [
	{
		date: "2026-10-04",
		title: "Risk-on holds, trends confirmed",
		summary:
			"Both engines stay in phase 1: BTC scores +1.8 and ETH +2.1 out of a possible +3. Liquidity is expanding, credit is calm, and both assets trade well above their 200-day averages. The stance stays hold and accumulate on drawdowns.",
		verdict: {
			btc: "$85,148",
			eth: "$2,698",
			btcScore: "+1.8",
			ethScore: "+2.1",
			stance: "HOLD / ACCUMULATE",
			phase: "Phase 1 · risk-on",
		},
		sections: [
			{
				label: "Where we are",
				body: [
					"The composite regime scores are +1.8 (BTC engine) and +2.1 (ETH engine) of a possible +3. Both stay in phase 1: risk-on, hold and accumulate. The validated execution rule agrees on both. BTC closed at $85,148, about 19 percent above its 200-day average near $71,500; ETH closed at $2,698, about 27 percent above its 200-day average near $2,118.",
					"Nothing in the picture argues for cash right now. The more useful question is what would turn this read.",
				],
			},
			{
				label: "What the engines see",
				body: [
					"Liquidity leans positive: M2 is up 5.7 percent year over year, the Fed's balance sheet has expanded 1.5 percent over 60 days, and the 10-year minus 3-month curve sits at +1.28 percent, a steep and normal shape.",
					"Risk appetite is calm: the VIX at 15.3, high-yield credit spreads tight at 3.24 percent, and the S&P 500 about 7 percent above its 200-day average.",
					"ETH's own internals are the strongest part of its read: ETH trades above its 200-day average, ETH/BTC holds above its own 200-day average, and ecosystem TVL sits at $53.7 billion, above its 60-day average.",
					"The engines still score two shared headwinds: real yields at 2.88 percent, and gold below its 200-day average. For BTC, the hash rate below its 60-day average is the only crypto-internal signal in the red.",
				],
			},
			{
				label: "What would change the read",
				body: [
					"The execution rule is mechanical: a daily close below the 200-day average flips the regime to cash-and-wait. For BTC that level is near $71,500, about 16 percent below the current price; for ETH it is near $2,118, about 21 percent below. These are not hair-triggers.",
					"The earlier-warning layer is the macro cluster: M2 rolling over, the stablecoin float draining, the dollar index pushing further up. The two-stage design matters because this layer usually turns months before price does. Today it is mostly quiet; the dollar is the one to keep an eye on.",
				],
			},
		],
		dataThrough: "2026-10-04",
	},
];
