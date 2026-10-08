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

export interface SolarKpBin {
	/** Bin start, ISO 8601 UTC. */
	t: string;
	/** Planetary K index, third-step resolution. */
	kp: number;
	/** NOAA storm-scale label (G1-G5) from the feed, when issued. */
	scale: string | null;
}

export interface SolarForecastBin {
	/** Bin start, ISO 8601 UTC. */
	t: string;
	/** Planetary K index for the bin. */
	kp: number;
	/** NOAA's processing stage for the bin. */
	type: "observed" | "estimated" | "predicted";
	/** NOAA storm-scale label (G1-G5) from the feed, when issued. */
	scale: string | null;
}

export interface SolarWindSummary {
	/** Proton speed, km/s. */
	speed: number;
	t: string;
}

export interface SolarMagSummary {
	/** Total field strength, nT. */
	bt: number;
	/** North-south component of the interplanetary field, nT (GSM). */
	bz: number;
	t: string;
}

export interface SolarFluxSummary {
	/** F10.7 solar radio flux, solar flux units. */
	v: number;
	t: string;
}

export interface SolarData {
	/** When the bundle was fetched (live) or the snapshot written (snapshot). */
	asOf: string;
	provenance: "live" | "snapshot";
	/** Past 7 days of 3-hour Kp bins, oldest first. */
	kp: SolarKpBin[];
	/** NOAA's observed + estimated + predicted bins, oldest first. */
	forecast: SolarForecastBin[];
	/** Near-real-time solar wind speed from the L1 monitors. */
	wind: SolarWindSummary;
	/** Near-real-time interplanetary magnetic field. */
	mag: SolarMagSummary;
	/** F10.7 solar radio flux. */
	flux: SolarFluxSummary;
}

export interface AirReading {
	/** Bin time, Tehran local ("YYYY-MM-DDTHH:MM"), as the feed returns it. */
	t: string;
	/** PM2.5, micrograms per cubic meter. */
	pm25: number;
	/** PM10, micrograms per cubic meter. */
	pm10: number;
	/** European AQI (the feed's EAQI scale). */
	aqiEu: number;
	/** US AQI (the feed's USAQI scale). */
	aqiUs: number;
}

export interface AirData {
	/** When the bundle was fetched (live) or the snapshot written (snapshot). */
	asOf: string;
	provenance: "live" | "snapshot";
	/** The current-hour reading (the feed's current bin). */
	current: AirReading;
	/** Hourly bins, oldest first: the past two days plus today. */
	hourly: AirReading[];
}

export interface ChessGamePlayer {
	name: string;
	color: "white" | "black";
	rating: number;
}

export interface ChessGame {
	id: string;
	/** Time-control name from the feed ("Rapid"). */
	perf: string;
	rated: boolean;
	/** Time control ("10+0"). */
	clock: string;
	/** Both players, as the feed lists them. */
	players: ChessGamePlayer[];
}

export interface ChessPuzzle {
	id: string;
	/** Puzzle rating, a reading that moves through the day. */
	rating: number;
	/** Solver attempts so far, a reading that moves through the day. */
	plays: number;
	/** UCI move strings: the known solution line, in order. */
	solution: string[];
	themes: string[];
	/** Position FEN; the side to move plays first. */
	fen: string;
	/** The opponent's last move before the position (UCI). */
	lastMove: string;
	/** 0-based ply index of lastMove within the source game. */
	initialPly: number;
}

export interface ChessData {
	/** When the puzzle was fetched (live) or the snapshot written (snapshot). */
	asOf: string;
	provenance: "live" | "snapshot";
	game: ChessGame;
	puzzle: ChessPuzzle;
}

export interface DryPowderHistoryPoint {
	/** ISO date (YYYY-MM-DD) of the daily balance. */
	date: string;
	/** Balance, USD billions. */
	value: number;
}

/** The headline numbers the reading tiles need; the history stays server-side. */
export interface DryPowderReadingSeries {
	/** The latest balance, USD billions. */
	latest: number;
	/** ISO date of the latest reading. */
	latestDate: string;
	/** Change vs about 7 days earlier, USD billions; null when history is short. */
	change7d: number | null;
	/** Change vs about 30 days earlier, USD billions; null when history is short. */
	change30d: number | null;
	/** The all-time high of the series. */
	peak: { value: number; date: string };
	/** Percent below the all-time peak (0 when at the peak). */
	distanceFromPeakPct: number;
}

export interface DryPowderSeriesData extends DryPowderReadingSeries {
	history: DryPowderHistoryPoint[];
}

export interface DryPowderData {
	/** When the snapshot was generated (ISO date-time). */
	asOf: string;
	provenance: "snapshot";
	/** The Treasury General Account (TGA). */
	tga: DryPowderSeriesData;
	/** The overnight reverse repo pool (RRP). */
	rrp: DryPowderSeriesData;
}

export interface HafezVerse {
	/** Hemistich position within the couplet: 0 (first) or 1 (second). */
	versePosition: 0 | 1;
	/** Couplet index within the ghazal, 0-based. */
	coupletIndex: number;
	/** The hemistich text, exactly as Ganjoor serves it. */
	text: string;
}

export interface HafezGhazal {
	/** Ganjoor's poem id. */
	id: number;
	/** "غزل شمارهٔ ۱۱۳" */
	title: string;
	/** "حافظ » غزلیات » غزل شمارهٔ ۱۱۳" */
	fullTitle: string;
	/** Site-relative path on ganjoor.net ("/hafez/ghazal/sh113"). */
	fullUrl: string;
	verses: HafezVerse[];
}

/** The committed set the page draws from when the live fal is unreachable. */
export interface HafezFallbackSet {
	/** When the set was generated (ISO date-time). */
	generatedAt: string;
	ghazals: HafezGhazal[];
}

export interface HafezData {
	/** When the draw happened (live) or the set was generated (local). */
	asOf: string;
	/** "live" = fetched from Ganjoor; "local" = drawn from the committed set. */
	provenance: "live" | "local";
	ghazal: HafezGhazal;
}

export interface FreeShelfBook {
	/** Project Gutenberg ebook id. */
	id: number;
	title: string;
	/** Null for the few chart entries PG lists without an author. */
	author: string | null;
	/** PG's own download counter for the chart window. */
	downloads: number;
}

export type FreeShelfWindowKey = "last1" | "last7" | "last30";

export interface FreeShelfData {
	/** When the chart was read (live) or the snapshot generated (snapshot). */
	asOf: string;
	/** The chart page's own last-modified time, when the server sends one. */
	chartModified: string | null;
	provenance: "live" | "snapshot";
	/** Top books per window, as PG ranks them (top 30 carried; 20 shown). */
	windows: Record<FreeShelfWindowKey, FreeShelfBook[]>;
}
