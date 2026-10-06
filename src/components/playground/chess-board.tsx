"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { ChessData } from "@/lib/playground/types";

// --- The board model ---
// The puzzle arrives as a FEN position plus a solution line of UCI moves, so
// the board is a plain map of square -> piece and a move is a from/to pair.
// No engine and no chess library: the page replays the known line and checks
// the solver's moves against it.

type Board = Record<string, string>;

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

/** Unicode chess glyphs; U+FE0E pins text presentation (never emoji). */
const GLYPHS: Record<string, string> = {
	K: "\u2654\uFE0E",
	Q: "\u2655\uFE0E",
	R: "\u2656\uFE0E",
	B: "\u2657\uFE0E",
	N: "\u2658\uFE0E",
	P: "\u2659\uFE0E",
	k: "\u265A\uFE0E",
	q: "\u265B\uFE0E",
	r: "\u265C\uFE0E",
	b: "\u265D\uFE0E",
	n: "\u265E\uFE0E",
	p: "\u265F\uFE0E",
};

const PIECE_NAMES: Record<string, string> = {
	p: "pawn",
	n: "knight",
	b: "bishop",
	r: "rook",
	q: "queen",
	k: "king",
};

/** Symbol fonts first so the glyphs resolve as outlines, not emoji. */
const PIECE_FONT_STACK =
	'"Segoe UI Symbol", "Noto Sans Symbols 2", "Noto Sans Symbols", "DejaVu Sans", "Apple Symbols", "Arial Unicode MS", sans-serif';

function parseFen(fen: string): { pieces: Board; turn: "w" | "b" } {
	const [placement = "", turnRaw = "w"] = fen.split(" ");
	const pieces: Board = {};
	placement.split("/").forEach((row, index) => {
		const rank = 8 - index;
		let file = 0;
		for (const ch of row) {
			const skip = Number(ch);
			if (Number.isInteger(skip) && skip > 0) {
				file += skip;
				continue;
			}
			if (file < 8 && rank >= 1 && rank <= 8) {
				pieces[`${FILES[file]}${rank}`] = ch;
			}
			file += 1;
		}
	});
	return { pieces, turn: turnRaw === "b" ? "b" : "w" };
}

function applyMove(board: Board, uci: string): Board {
	const from = uci.slice(0, 2);
	const to = uci.slice(2, 4);
	const piece = board[from];
	if (!piece || to.length < 2) return board;
	const next: Board = { ...board };
	const promotion = uci.length > 4 ? uci[4] : "";
	const isPawn = piece.toLowerCase() === "p";
	const isKing = piece.toLowerCase() === "k";
	// En passant: a pawn landing diagonally on an empty square captures the
	// pawn beside it (defensive - the known line never needs it).
	if (isPawn && from[0] !== to[0] && !next[to]) {
		delete next[`${to[0]}${from[1]}`];
	}
	delete next[from];
	next[to] = promotion
		? piece === piece.toUpperCase()
			? promotion.toUpperCase()
			: promotion.toLowerCase()
		: piece;
	// Castling: the king moves two files and the rook follows (defensive).
	if (isKing && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2) {
		const rank = from[1];
		if (to[0] === "g") {
			next[`f${rank}`] = next[`h${rank}`];
			delete next[`h${rank}`];
		} else if (to[0] === "c") {
			next[`d${rank}`] = next[`a${rank}`];
			delete next[`a${rank}`];
		}
	}
	return next;
}

export function ChessBoard({ data }: { data: ChessData }) {
	const { puzzle } = data;
	const solution = puzzle.solution;

	const initial = useMemo(() => parseFen(puzzle.fen), [puzzle.fen]);
	const turn = initial.turn;
	const colorName = turn === "w" ? "white" : "black";
	const userPlaysUpper = turn === "w";

	const [step, setStep] = useState(0);
	const [selected, setSelected] = useState<string | null>(null);
	const [note, setNote] = useState<string | null>(null);
	const [usedHint, setUsedHint] = useState(false);
	const reducedMotion = useReducedMotion();

	const solved = step >= solution.length;
	const userTurn = !solved && step % 2 === 0;

	const pieces = useMemo(() => {
		let board = initial.pieces;
		for (let i = 0; i < step && i < solution.length; i += 1) {
			board = applyMove(board, solution[i]);
		}
		return board;
	}, [initial.pieces, solution, step]);

	// The opponent's replies play themselves after a beat; reduced motion
	// shortens the beat (the global stylesheet already freezes transitions).
	useEffect(() => {
		if (solved || step % 2 === 0) return;
		const delay = reducedMotion ? 120 : 650;
		const timer = window.setTimeout(() => {
			setStep((current) => Math.min(current + 1, solution.length));
		}, delay);
		return () => window.clearTimeout(timer);
	}, [step, solved, solution.length, reducedMotion]);

	const lastMove = step === 0 ? puzzle.lastMove : solution[step - 1];
	const lastFrom = lastMove.slice(0, 2);
	const lastTo = lastMove.slice(2, 4);
	const moveTotal = Math.ceil(solution.length / 2);
	const moveIndex = Math.min(Math.floor(step / 2) + 1, moveTotal);
	const canReset = step > 0 || selected !== null || note !== null || usedHint;

	// The board is oriented with the side to move at the bottom (Lichess
	// convention): white at the bottom means ranks 8..1 top to bottom, black
	// at the bottom flips both axes.
	const displayFiles = turn === "w" ? FILES : [...FILES].reverse();
	const displayRanks = turn === "w" ? [...RANKS].reverse() : RANKS;
	const squares = displayRanks.flatMap((rank) =>
		displayFiles.map((file) => ({ square: `${file}${rank}`, file, rank })),
	);

	function handleSquare(square: string) {
		if (!userTurn) return;
		const piece = pieces[square];
		const isOwn = piece
			? userPlaysUpper
				? piece === piece.toUpperCase()
				: piece === piece.toLowerCase()
			: false;
		if (selected === null) {
			if (isOwn) {
				setSelected(square);
				setNote(null);
			}
			return;
		}
		if (square === selected) {
			setSelected(null);
			return;
		}
		if (isOwn) {
			setSelected(square);
			setNote(null);
			return;
		}
		if (`${selected}${square}` === solution[step].slice(0, 4)) {
			setSelected(null);
			setNote(null);
			setStep((current) => current + 1);
		} else {
			setSelected(null);
			setNote("Not that one. The position stays as it is - try another move.");
		}
	}

	function handleHint() {
		if (!userTurn) return;
		setUsedHint(true);
		setSelected(null);
		setNote(null);
		setStep((current) => current + 1);
	}

	function handleReset() {
		setStep(0);
		setSelected(null);
		setNote(null);
		setUsedHint(false);
	}

	return (
		<div className="rounded-xl border border-border bg-card p-3 sm:p-4">
			<div className="mx-auto w-full max-w-md">
				<div
					role="group"
					className="grid grid-cols-8 overflow-hidden rounded-md border border-border"
					aria-label={`Chess puzzle board. You play ${colorName}, the side to move. Select a piece, then its destination square.`}
				>
					{squares.map(({ square, file, rank }) => {
						const piece = pieces[square];
						const isSelected = selected === square;
						const isLast = !isSelected && (square === lastFrom || square === lastTo);
						const isLight = (FILES.indexOf(file) + Number(rank)) % 2 === 0;
						const label = piece
							? `${square}, ${piece === piece.toUpperCase() ? "white" : "black"} ${PIECE_NAMES[piece.toLowerCase()]}`
							: `${square}, empty`;
						return (
							<button
								key={square}
								type="button"
								onClick={() => handleSquare(square)}
								aria-disabled={!userTurn}
								aria-label={label}
								className={cn(
									"relative flex aspect-square items-center justify-center transition-colors",
									isLight ? "bg-card" : "bg-muted",
									isLast && "bg-brand/10",
									isSelected && "bg-brand/20",
									userTurn ? "cursor-pointer hover:bg-brand/15" : "cursor-default",
								)}
							>
								{piece ? (
									<span
										aria-hidden="true"
										className={cn(
											"select-none text-[length:clamp(1.5rem,7vw,2.4rem)] leading-none",
											piece === piece.toUpperCase()
												? "text-foreground"
												: "text-text-muted",
										)}
										style={{ fontFamily: PIECE_FONT_STACK }}
									>
										{GLYPHS[piece]}
									</span>
								) : null}
								{rank === displayRanks[7] ? (
									<span
										aria-hidden="true"
										className="pointer-events-none absolute bottom-0.5 right-1 text-label-12 text-text-faint opacity-70"
									>
										{file}
									</span>
								) : null}
								{file === displayFiles[0] ? (
									<span
										aria-hidden="true"
										className="pointer-events-none absolute left-1 top-0.5 text-label-12 text-text-faint opacity-70"
									>
										{rank}
									</span>
								) : null}
							</button>
						);
					})}
				</div>

				<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
					<p className="text-copy-14 text-text-muted" role="status" aria-live="polite">
						{solved ? (
							<>
								Solved{usedHint ? " with a hint" : ""} - that is the full line.{" "}
								<a
									href={`https://lichess.org/training/${puzzle.id}`}
									target="_blank"
									rel="noreferrer"
									className="text-brand transition-opacity hover:opacity-75"
								>
									See it on Lichess
								</a>
							</>
						) : step % 2 === 1 ? (
							"Opponent replies..."
						) : (
							`Your move (${moveIndex} of ${moveTotal}).`
						)}
					</p>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={handleHint} disabled={!userTurn}>
							Hint
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleReset}
							disabled={!canReset}
						>
							Reset
						</Button>
					</div>
				</div>
				{note ? <p className="mt-2 text-copy-13 text-text-faint">{note}</p> : null}
				<p className="mt-3 text-copy-13 text-text-faint">
					You play {colorName}, the side to move. Click a piece, then its destination
					square; a hint plays the next move of the line.
				</p>
			</div>
		</div>
	);
}
