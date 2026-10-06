// --- Playground: chess puzzle data source ---
// Fetches the day's puzzle from Lichess's daily endpoint and degrades
// gracefully:
//
//   live fetch (per worker isolate) -> in-memory cache (60 s)
//                                   -> committed fallback snapshot
//
// The API is keyless and public; database exports are CC0, and fair use is
// "one request at a time" (lichess.org/page/api-tips). Refresh the fallback
// with `node scripts/fetch-chess-snapshot.mjs`. The page never depends on the
// live fetch to render.

import rawFallback from "@/data/playground/chess-fallback.json";
import type { ChessData, ChessGame, ChessGamePlayer, ChessPuzzle } from "@/lib/playground/types";

const DAILY_URL = "https://lichess.org/api/puzzle/daily";
const CACHE_TTL_MS = 60 * 1000;
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

/** UCI move, with the optional promotion piece. */
const UCI_MOVE = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
/** UCI from/to pair, no promotion. */
const UCI_PAIR = /^[a-h][1-8][a-h][1-8]$/;

function isString(value: unknown): value is string {
	return typeof value === "string" && value.length > 0;
}

function toPlayers(raw: unknown): ChessGamePlayer[] {
	if (!Array.isArray(raw) || raw.length === 0) throw new Error("chess payload: players missing");
	const players: ChessGamePlayer[] = [];
	for (const entry of raw) {
		const player = (entry ?? {}) as { name?: unknown; color?: unknown; rating?: unknown };
		if (!isString(player.name)) throw new Error("chess payload: player name missing");
		if (player.color !== "white" && player.color !== "black") {
			throw new Error("chess payload: player color missing");
		}
		if (typeof player.rating !== "number" || !Number.isFinite(player.rating)) {
			throw new Error("chess payload: player rating missing");
		}
		players.push({ name: player.name, color: player.color, rating: player.rating });
	}
	return players;
}

function toGame(raw: unknown): ChessGame {
	const game = (raw ?? {}) as {
		id?: unknown;
		perf?: unknown;
		rated?: unknown;
		clock?: unknown;
		players?: unknown;
	};
	if (!isString(game.id)) throw new Error("chess payload: game id missing");
	// The raw feed nests perf as { key, name }; the fallback stores the name.
	const perfRaw = game.perf;
	const perf = isString(perfRaw)
		? perfRaw
		: isString((perfRaw as { name?: unknown } | null | undefined)?.name)
			? String((perfRaw as { name: string }).name)
			: "";
	return {
		id: game.id,
		perf,
		rated: game.rated === true,
		clock: isString(game.clock) ? game.clock : "",
		players: toPlayers(game.players),
	};
}

function toPuzzle(raw: unknown): ChessPuzzle {
	const puzzle = (raw ?? {}) as {
		id?: unknown;
		rating?: unknown;
		plays?: unknown;
		solution?: unknown;
		themes?: unknown;
		fen?: unknown;
		lastMove?: unknown;
		initialPly?: unknown;
	};
	if (!isString(puzzle.id)) throw new Error("chess payload: puzzle id missing");
	if (typeof puzzle.rating !== "number" || !Number.isFinite(puzzle.rating)) {
		throw new Error("chess payload: rating missing");
	}
	if (typeof puzzle.plays !== "number" || !Number.isFinite(puzzle.plays) || puzzle.plays < 0) {
		throw new Error("chess payload: plays missing");
	}
	if (!Array.isArray(puzzle.solution) || puzzle.solution.length === 0) {
		throw new Error("chess payload: solution missing");
	}
	const solution = puzzle.solution.filter(isString);
	if (solution.length !== puzzle.solution.length || !solution.every((move) => UCI_MOVE.test(move))) {
		throw new Error("chess payload: solution has unusable moves");
	}
	if (!isString(puzzle.fen) || !puzzle.fen.includes("/")) {
		throw new Error("chess payload: fen missing");
	}
	if (!isString(puzzle.lastMove) || !UCI_PAIR.test(puzzle.lastMove)) {
		throw new Error("chess payload: lastMove missing");
	}
	const themes = Array.isArray(puzzle.themes) ? puzzle.themes.filter(isString) : [];
	const initialPly =
		typeof puzzle.initialPly === "number" && Number.isFinite(puzzle.initialPly)
			? puzzle.initialPly
			: 0;
	return {
		id: puzzle.id,
		rating: puzzle.rating,
		plays: puzzle.plays,
		solution,
		themes: themes.slice(0, 6),
		fen: puzzle.fen,
		lastMove: puzzle.lastMove,
		initialPly,
	};
}

async function fetchJson(url: string): Promise<unknown> {
	const res = await fetch(url, {
		headers: { accept: "application/json", "user-agent": USER_AGENT },
		cache: "no-store",
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
	return res.json();
}

async function fetchLive(): Promise<ChessData> {
	const payload = (await fetchJson(DAILY_URL)) as { game?: unknown; puzzle?: unknown };
	return {
		asOf: new Date().toISOString(),
		provenance: "live",
		game: toGame(payload.game),
		puzzle: toPuzzle(payload.puzzle),
	};
}

interface RawFallback {
	generatedAt?: unknown;
	game?: unknown;
	puzzle?: unknown;
}

function normalizeFallback(raw: RawFallback): ChessData {
	if (!isString(raw.generatedAt)) throw new Error("chess fallback: generatedAt missing");
	return {
		asOf: raw.generatedAt,
		provenance: "snapshot",
		game: toGame(raw.game),
		puzzle: toPuzzle(raw.puzzle),
	};
}

let memoryCache: { at: number; data: ChessData } | null = null;

/**
 * The page-facing entry point. Live data with a 60-second per-isolate cache;
 * on any failure, the last good data (memory, then committed snapshot).
 */
export async function getChessData(): Promise<ChessData> {
	if (memoryCache && Date.now() - memoryCache.at < CACHE_TTL_MS) {
		return memoryCache.data;
	}
	try {
		const data = await fetchLive();
		memoryCache = { at: Date.now(), data };
		return data;
	} catch (error) {
		// Keep fallbacks visible: a silent catch once hid a live-fetch
		// regression behind the snapshot (stablecoins, 2026-10).
		console.warn(
			"[playground/chess] live fetch failed; serving snapshot:",
			error instanceof Error ? `${error.name}: ${error.message}` : String(error),
		);
		if (memoryCache) return memoryCache.data;
		return normalizeFallback(rawFallback as unknown as RawFallback);
	}
}
