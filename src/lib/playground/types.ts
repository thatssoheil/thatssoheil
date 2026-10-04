// ─── Playground data model ───
// The normalized shape every Playground surface renders from. The raw Birdeye
// payloads are mapped into this once (live and fallback share the mapping).

export interface RwaTotals {
	volume24h: number;
	marketCap: number;
	assets: number;
	issuers: number;
	tokens: number;
}

export interface RwaIssuer {
	name: string;
	chains: string[];
	assetClasses: string[];
	volume24h: number;
	marketCap: number;
	assets: number;
	liquidity: number;
	holders: number;
	/** Share of sector 24h volume, 0-100. */
	share: number;
}

export interface RwaHistoryPoint {
	date: string;
	volume: number;
	assets: number;
}

export interface RwaToken {
	symbol: string;
	name: string;
	chain: string;
	issuer: string;
	underlying: string | null;
	price: number;
	volume24h: number;
	marketCap: number;
	liquidity: number;
	change24h: number;
	trades: number;
	wallets: number;
}

export interface RwaWrapperGroup {
	underlying: string;
	wrappers: RwaToken[];
	/** (max - min) / min across wrapper prices, in percent. */
	spreadPct: number;
	totalVolume: number;
}

export interface RwaData {
	/** When the data was fetched (live) or generated (snapshot). */
	asOf: string;
	provenance: "live" | "snapshot";
	totals: RwaTotals;
	issuers: RwaIssuer[];
	history: RwaHistoryPoint[];
	tokens: RwaToken[];
	wrappers: RwaWrapperGroup[];
}

export interface MacroNoteSection {
	label: string;
	body: string[];
}

export interface MacroNote {
	/** ISO date of the read. */
	date: string;
	title: string;
	summary: string;
	verdict: {
		btc: string;
		eth: string;
		btcScore: string;
		ethScore: string;
		stance: string;
		phase: string;
	};
	sections: MacroNoteSection[];
	/** The dataset date the engine ran on. */
	dataThrough: string;
}
