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

export interface StablecoinHistoryPoint {
	/** ISO date (UTC midnight) of the daily reading. */
	date: string;
	/** Total circulating value of all stablecoins, in USD. */
	usd: number;
}

export interface StablecoinData {
	/** When the data was fetched (live) or generated (snapshot). */
	asOf: string;
	provenance: "live" | "snapshot";
	/** The latest daily reading. */
	latest: number;
	/** ISO date of the latest daily reading. */
	latestDate: string;
	/** Percent change vs 7 days earlier; null when history is too short. */
	change7d: number | null;
	/** Percent change vs 30 days earlier; null when history is too short. */
	change30d: number | null;
	peak: { value: number; date: string };
	/** Percent below the all-time peak (0 when at the peak). */
	distanceFromPeakPct: number;
	history: StablecoinHistoryPoint[];
}

export interface VolatilityHistoryPoint {
	/** ISO date (UTC) of the daily close. */
	date: string;
	/** DVOL close, in annualized volatility points. */
	value: number;
}

export interface VolatilitySeriesData {
	currency: "BTC" | "ETH";
	/** The latest daily close. */
	latest: number;
	/** Percent change vs the previous day's close. */
	dayChangePct: number;
	/** Share (0-100) of daily closes at or below the latest reading. */
	percentile: number;
	history: VolatilityHistoryPoint[];
}

export interface VolatilityData {
	/** When the snapshot was generated (ISO date). */
	asOf: string;
	provenance: "snapshot";
	btc: VolatilitySeriesData;
	eth: VolatilitySeriesData;
}

export interface NetworkFeeEstimate {
	/** Next block, about 10 minutes. */
	fastest: number;
	/** About 30 minutes (about 3 blocks). */
	halfHour: number;
	/** About 1 hour (about 6 blocks). */
	hour: number;
	/** No rush. */
	economy: number;
	/** Relay floor. */
	minimum: number;
}

export interface NetworkHistogramBucket {
	/** Fee-rate band lower edge, sat/vB. */
	lo: number;
	/** Band upper edge, sat/vB (Infinity for the open top band). */
	hi: number;
	/** Waiting virtual size in the band, vB. */
	vsize: number;
}

export interface NetworkMempoolSummary {
	/** Waiting transactions. */
	count: number;
	/** Waiting virtual size, vB. */
	vsize: number;
	/** Sum of the fees offered by the queue, sats. */
	totalFee: number;
}

export interface NetworkDifficulty {
	/** Progress through the current 2,016-block epoch, 0-100. */
	progressPercent: number;
	/** Estimated change at the next retarget, percent. */
	changePercent: number;
	/** Blocks remaining until the retarget. */
	remainingBlocks: number;
	/** Estimated retarget time, ms epoch. */
	retargetAt: number;
	/** Change locked in at the previous retarget, percent. */
	previousChangePercent: number;
}

export interface NetworkBlock {
	height: number;
	/** Block time, unix seconds. */
	timestamp: number;
	txCount: number;
	/** Serialized block size, bytes. */
	size: number;
}

export interface NetworkPulseData {
	/** When the data was fetched (live) or generated (snapshot). */
	asOf: string;
	provenance: "live" | "snapshot";
	fees: NetworkFeeEstimate;
	mempool: NetworkMempoolSummary;
	/** Waiting volume by fee-rate band, sat/vB. */
	histogram: NetworkHistogramBucket[];
	difficulty: NetworkDifficulty;
	/** Most recent blocks, newest first. */
	blocks: NetworkBlock[];
	/** BTC price in USD from the same feed. */
	priceUsd: number;
}

export interface SeismicEvent {
	/** Event time, ISO 8601 UTC. */
	time: string;
	/** USGS network magnitude. */
	mag: number;
	/** Depth below the surface, kilometers. */
	depthKm: number;
	place: string;
	/** USGS event page. */
	url: string;
}

export interface SeismicData {
	/** When the feed was generated (live) or the snapshot written (snapshot). */
	asOf: string;
	provenance: "live" | "snapshot";
	/** Quakes in the rolling past-7-days window (the M4.5+ cut). */
	count: number;
	/** Of those, at magnitude 5.0 and above. */
	m5plus: number;
	/** Of those, at magnitude 6.0 and above. */
	m6plus: number;
	largest: SeismicEvent;
	latest: SeismicEvent;
	/** All events, newest first. */
	events: SeismicEvent[];
}
