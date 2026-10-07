// --- Playground: Hafez fal payload parsing ---
// Shared by the server source module and the client redraw path: both ask
// Ganjoor's fal endpoint and must trim the payload to the render shape the
// same way. Text is kept exactly as served - ZWNJ and diacritics included,
// nothing normalized.

import type { HafezGhazal, HafezVerse } from "@/lib/playground/types";

function isString(value: unknown): value is string {
	return typeof value === "string" && value.length > 0;
}

/** Validate one fal payload and trim it to the render shape; throws when unusable. */
export function parseFalPayload(raw: unknown): HafezGhazal {
	const record = (raw ?? {}) as {
		id?: unknown;
		title?: unknown;
		fullTitle?: unknown;
		fullUrl?: unknown;
		verses?: unknown;
	};
	if (typeof record.id !== "number" || !Number.isFinite(record.id)) {
		throw new Error("fal payload: id missing");
	}
	if (!isString(record.title) || !isString(record.fullTitle)) {
		throw new Error("fal payload: title missing");
	}
	if (!isString(record.fullUrl) || !record.fullUrl.startsWith("/hafez/ghazal/")) {
		throw new Error("fal payload: fullUrl unexpected");
	}
	if (!Array.isArray(record.verses) || record.verses.length === 0) {
		throw new Error("fal payload: verses missing");
	}
	const verses: HafezVerse[] = record.verses.map((entry) => {
		const verse = (entry ?? {}) as {
			versePosition?: unknown;
			coupletIndex?: unknown;
			text?: unknown;
		};
		if (verse.versePosition !== 0 && verse.versePosition !== 1) {
			throw new Error("fal payload: verse position missing");
		}
		if (typeof verse.coupletIndex !== "number" || !Number.isFinite(verse.coupletIndex)) {
			throw new Error("fal payload: couplet index missing");
		}
		if (!isString(verse.text)) {
			throw new Error("fal payload: verse text missing");
		}
		return {
			versePosition: verse.versePosition,
			coupletIndex: verse.coupletIndex,
			text: verse.text,
		};
	});
	return {
		id: record.id,
		title: record.title,
		fullTitle: record.fullTitle,
		fullUrl: record.fullUrl,
		verses,
	};
}
