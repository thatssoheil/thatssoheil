import type { Metadata } from "next";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { SectionHeading } from "@/components/playground/section-heading";
import { StatTile } from "@/components/playground/stat-tile";
import { ChessBoard } from "@/components/playground/chess-board";
import { getChessData } from "@/lib/playground/chess-source";
import { formatDateShort, formatDateTimeUtc } from "@/lib/playground/format";

// The page renders per request from the live feed (with a per-isolate cache
// in the source module) - never baked into the build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Chess puzzle",
	description:
		"The day's chess puzzle from Lichess, playable on the page: find the winning line from the real position, checked against the known solution. No engine, no account.",
	alternates: { canonical: "/playground/chess" },
};

/** "veryLong" -> "very long", so theme slugs read as words. */
function prettifyTheme(theme: string): string {
	return theme.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
}

/** Hour and minute (UTC) of an ISO timestamp, for as-of stamps. */
function hmUtc(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	const hh = String(date.getUTCHours()).padStart(2, "0");
	const mm = String(date.getUTCMinutes()).padStart(2, "0");
	return `${hh}:${mm} UTC`;
}

export default async function ChessPuzzlePage() {
	const data = await getChessData();
	const { puzzle, game } = data;

	const turn = puzzle.fen.split(" ")[1] === "b" ? "b" : "w";
	const colorName = turn === "w" ? "white" : "black";
	const puzzleUrl = `https://lichess.org/training/${puzzle.id}`;

	const white = game.players.find((player) => player.color === "white");
	const black = game.players.find((player) => player.color === "black");
	const perfPrefix = game.perf ? `${game.perf} ` : "";
	const gameLine =
		white && black
			? `${white.name} (${white.rating}) vs ${black.name} (${black.rating}) - a ${game.rated ? "rated" : "casual"} ${perfPrefix}game${game.clock ? `, ${game.clock}` : ""}.`
			: `A ${perfPrefix}game from Lichess.`;
	const themesText =
		puzzle.themes.length > 0
			? `${puzzle.themes.map(prettifyTheme).join(", ")}.`
			: "None listed for this puzzle.";

	return (
		<PlaygroundShell
			eyebrow="Playground"
			title="Chess puzzle"
			intro="The day's puzzle from Lichess, solvable right here: click a piece, then its destination square. You play the side to move, and the page checks your moves against the known line. No engine involved."
			meta={
				<>
					Data: Lichess daily puzzle feed · reading {formatDateTimeUtc(data.asOf)}
					{data.provenance === "snapshot"
						? ` · showing the last good snapshot (puzzle from ${formatDateShort(data.asOf)})`
						: ""}
				</>
			}
		>
			<section aria-label="Today's puzzle">
				<SectionHeading label="Today's puzzle" note={`puzzle ${puzzle.id} · ${colorName} to move`} />
				<div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
					<ChessBoard data={data} />
					<div className="flex flex-col gap-3">
						<div className="grid grid-cols-2 gap-3">
							<StatTile
								label="Puzzle rating"
								value={`${puzzle.rating}`}
								hint={`as of ${hmUtc(data.asOf)}`}
							/>
							<StatTile
								label="Plays"
								value={puzzle.plays.toLocaleString("en-US")}
								hint={`solver attempts · as of ${hmUtc(data.asOf)}`}
							/>
						</div>
						<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-5">
							<p className="text-label-12 uppercase tracking-[0.14em] text-text-faint">
								Themes
							</p>
							<p className="mt-1 text-copy-14 text-text-muted">{themesText}</p>
							<p className="mt-4 text-label-12 uppercase tracking-[0.14em] text-text-faint">
								The game behind it
							</p>
							<p className="mt-1 text-copy-14 text-text-muted">{gameLine}</p>
							<p className="mt-4 text-copy-13 text-text-faint">
								<a
									href={puzzleUrl}
									target="_blank"
									rel="noreferrer"
									className="text-brand transition-opacity hover:opacity-75"
								>
									Puzzle by Lichess
								</a>{" "}
								- the position and its solution arrive together from the Lichess API.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section aria-label="Method and sources">
				<SectionHeading label="Method and sources" />
				<div className="flex max-w-2xl flex-col gap-3 text-copy-13 text-text-faint">
					<p>
						This is the daily puzzle from Lichess. The position arrives as a FEN string
						together with the solution as coordinate moves, and the page checks your moves
						against that known line. No engine runs here and nothing is analyzed - if a
						move matches the line, it lands; if not, the board stays as it is.
					</p>
					<p>
						The puzzle rotates once a day. The rating and play count are readings taken at
						fetch time - they move as the puzzle is played around the world - so each
						number carries its own as-of stamp. The page re-reads the feed about once a
						minute and, when Lichess is unreachable, serves the last good snapshot and
						says so.
					</p>
					<p>
						Data:{" "}
						<a
							href="https://lichess.org/api"
							target="_blank"
							rel="noreferrer"
							className="text-brand transition-opacity hover:opacity-75"
						>
							the Lichess public API
						</a>{" "}
						(keyless; the database exports are CC0). Requests are kept to one per minute
						per running instance; on any failure the page falls back rather than
						retrying.
					</p>
				</div>
			</section>
		</PlaygroundShell>
	);
}
