#!/usr/bin/env node
/**
 * Generates src/data/playground/chess-fallback.json - the committed fallback
 * the Playground chess puzzle page renders when the Lichess daily endpoint is
 * unreachable.
 *
 * Run from the repo root:  node scripts/fetch-chess-snapshot.mjs
 *
 * Source: https://lichess.org/api/puzzle/daily (keyless; database exports are
 * CC0; fair use: one request at a time). The payload is trimmed to the fields
 * the page uses: the game line (id, perf, rated, clock, players) and the
 * puzzle (id, rating, plays, solution, themes, fen, lastMove, initialPly).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/playground/chess-fallback.json");
const DAILY_URL = "https://lichess.org/api/puzzle/daily";
const USER_AGENT = "thatssoheil.website playground (+https://thatssoheil.website/playground)";

const res = await fetch(DAILY_URL, {
	headers: { accept: "application/json", "user-agent": USER_AGENT },
});
if (!res.ok) throw new Error(`${DAILY_URL}: HTTP ${res.status}`);
const payload = await res.json();

const game = payload.game;
const puzzle = payload.puzzle;
if (!game || !puzzle) throw new Error("chess feed: game or puzzle missing");
if (typeof puzzle.id !== "string" || puzzle.id === "") {
	throw new Error("chess feed: puzzle id missing");
}
if (!Array.isArray(puzzle.solution) || puzzle.solution.length === 0) {
	throw new Error("chess feed: solution missing");
}
if (typeof puzzle.fen !== "string" || !puzzle.fen.includes("/")) {
	throw new Error("chess feed: fen missing");
}
if (typeof puzzle.lastMove !== "string") throw new Error("chess feed: lastMove missing");
if (!Array.isArray(game.players) || game.players.length === 0) {
	throw new Error("chess feed: players missing");
}

const trimmed = {
	generatedAt: new Date().toISOString(),
	source: DAILY_URL,
	attribution: "Puzzle by Lichess",
	game: {
		id: game.id,
		perf: game.perf && typeof game.perf === "object" ? game.perf.name : game.perf,
		rated: game.rated === true,
		clock: game.clock,
		players: game.players.map((player) => ({
			name: player.name,
			color: player.color,
			rating: player.rating,
		})),
	},
	puzzle: {
		id: puzzle.id,
		rating: puzzle.rating,
		plays: puzzle.plays,
		solution: puzzle.solution,
		themes: puzzle.themes,
		fen: puzzle.fen,
		lastMove: puzzle.lastMove,
		initialPly: puzzle.initialPly,
	},
};

mkdirSync(dirname(OUT), { recursive: true });
const json = JSON.stringify(trimmed);
writeFileSync(OUT, json);

console.log(
	`wrote ${OUT} (${json.length} bytes; puzzle ${puzzle.id}, rating ${puzzle.rating}, ` +
		`${puzzle.plays} plays, ${puzzle.solution.length} solution moves)`,
);
