// --- Playground: sugar cubes parsing and display helpers ---
// Pure functions shared by the server source module and the client component:
// mapping Open Food Facts payloads and the committed curated snapshot into one
// shape, the serving-label cleanup, and the cube math (one cube is about 4
// grams; the WHO's free-sugars guideline is 25 g/day, about six cubes).

import type { SugarProduct } from "@/lib/playground/types";

/** A standard sugar cube is about 4 grams (brand cubes run 2.5 to 5 g). */
export const CUBE_GRAMS = 4;
/** The WHO free-sugars guideline: under 25 grams a day. */
export const WHO_DAILY_G = 25;
/** Cap for the drawn stack; nothing realistic reaches it (100 g/100 g). */
export const MAX_CUBES = 25;

/** Round to 1 decimal; OFF floats carry noise (4.8000001907349). */
export function round1(value: number): number {
	return Math.round(Number((value * 10).toFixed(6))) / 10;
}

/** "35" / "10.6" - one decimal only when the value needs one. */
export function formatGrams(value: number): string {
	return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** The per-100 basis: "100 ml" when the pack or serving carries a volume. */
export function sugarUnit(quantity: string, servingSize: string | null): "100 g" | "100 ml" {
	const text = `${quantity} ${servingSize ?? ""}`.toLowerCase();
	return /(\d[\d.,]*)\s*(ml|cl|l|liters?|litres?)\b/.test(text) ? "100 ml" : "100 g";
}

/** Trailing " e" is the EU estimated-quantity mark ("400 g e"). */
export function cleanQuantity(raw: string): string {
	return raw.replace(/\s+/g, " ").trim().replace(/\s+e$/i, "");
}

/** The grams/ml a serving label carries ("1 serving (32 g)" -> 32); null
 * when the label has no clean measure. "l" converts to ml, "cl" x10. */
export function parseMeasure(label: string): number | null {
	const m =
		/(\d+(?:[.,]\d+)?)\s*(ml|cl|l|liters?|litres?)\b/i.exec(label) ??
		/(\d+(?:[.,]\d+)?)\s*(g|grams?)\b/i.exec(label);
	if (!m) return null;
	const n = Number.parseFloat(m[1].replace(",", "."));
	if (!Number.isFinite(n)) return null;
	const unit = m[2].toLowerCase();
	if (unit === "l" || unit.startsWith("liter") || unit.startsWith("litre")) return n * 1000;
	if (unit === "cl") return n * 10;
	return n;
}

/** "28 g ((28 g))" -> "28 g"; "1 cookie (20 g)" -> "cookie (20 g)"; the
 * redundant "100 g"/"100 ml" serving is null (that is the per-100 value). */
export function cleanServingLabel(raw: string): string | null {
	let s = raw.replace(/\s+/g, " ").trim();
	if (s === "") return "serving";
	const dup = /^(.+?)\s*\(\(?\s*\1\s*\)\)?$/.exec(s);
	if (dup) s = dup[1].trim();
	if (/^100\s*(g|ml)$/i.test(s)) return null;
	s = s.replace(/^1\s+(?=[A-Za-z])/, "");
	// "500ml" / "28G" -> "500 ml" / "28 g" for the clean-measure case.
	s = s.replace(/^(\d+(?:[.,]\d+)?)\s*(ml|cl|l|g)$/i, (_, n: string, unit: string) => `${n} ${unit.toLowerCase()}`);
	return s === "" ? "serving" : s;
}

export interface SugarServingInfo {
	/** Sugars in one serving, grams (OFF's own figure, or derived from the
	 * serving measure against the per-100 figure). */
	grams: number;
	/** The cleaned serving label ("250 ml", "cookie (20 g)", "serving"). */
	descriptor: string;
}

/** The serving readout for a product; null when no usable serving exists. */
export function servingInfo(product: SugarProduct): SugarServingInfo | null {
	const raw = (product.servingSize ?? "").replace(/\s+/g, " ").trim();
	const measure = parseMeasure(raw);
	if (measure === 100) return null;
	const grams =
		product.sugarsServing !== null
			? round1(product.sugarsServing)
			: measure !== null && measure > 0
				? round1((product.sugars100g * measure) / 100)
				: null;
	if (grams === null) return null;
	const descriptor = raw === "" ? "serving" : cleanServingLabel(raw);
	if (descriptor === null) return null;
	return { grams, descriptor };
}

/** Whole cubes plus the partial-cube fraction, capped for the drawing. */
export function cubeParts(grams: number, max: number): { whole: number; frac: number; capped: boolean } {
	const exact = grams / CUBE_GRAMS;
	const capped = exact > max + 0.5;
	const whole = Math.min(Math.floor(exact + 1e-9), max);
	const frac = capped ? 0 : exact - whole;
	return { whole, frac, capped };
}

/** "about 7 cubes" / "about 1 cube" / "no cubes" / "under a cube". */
export function cubeText(grams: number): string {
	const n = Math.round(grams / CUBE_GRAMS);
	if (n === 0) return grams === 0 ? "no cubes" : "under a cube";
	return `about ${n} ${n === 1 ? "cube" : "cubes"}`;
}

/** Share of the 25 g daily guideline, whole percent. */
export function guidelinePct(grams: number): number {
	return Math.round((grams / WHO_DAILY_G) * 100);
}

/** Collapse case, whitespace, and dashes so "coca cola" matches "coca-cola". */
export function normalizeQuery(query: string): string {
	return query.toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

// --- The committed curated snapshot ---

export interface SugarCuratedEntry {
	query: string;
	code: string;
	name: string;
	brands: string;
	quantity: string;
	servingSize: string | null;
	sugars100g: number;
	sugarsServing: number | null;
}

export interface SugarFallbackFile {
	generatedAt: string;
	source: string;
	note: string;
	products: SugarCuratedEntry[];
}

/** Map one committed curated entry into the display shape. */
export function curatedProduct(entry: SugarCuratedEntry): SugarProduct {
	return {
		code: entry.code,
		name: entry.name,
		brands: entry.brands,
		quantity: cleanQuantity(entry.quantity),
		servingSize: entry.servingSize,
		sugars100g: round1(entry.sugars100g),
		sugarsServing: entry.sugarsServing === null ? null : round1(entry.sugarsServing),
	};
}

export function curatedProducts(file: SugarFallbackFile): SugarProduct[] {
	return file.products.map(curatedProduct);
}

/** The curated entry for a query, when the committed set has one: exact
 * normalized match first, then all-token containment over query and name. */
export function findCuratedMatch(file: SugarFallbackFile, query: string): SugarProduct | null {
	const q = normalizeQuery(query);
	if (q === "") return null;
	const exact = file.products.find((entry) => normalizeQuery(entry.query) === q);
	if (exact) return curatedProduct(exact);
	const tokens = q.split(" ").filter((token) => token.length >= 3);
	if (tokens.length === 0) return null;
	const hit = file.products.find((entry) => {
		const text = normalizeQuery(`${entry.query} ${entry.name} ${entry.brands}`);
		return tokens.every((token) => text.includes(token));
	});
	return hit ? curatedProduct(hit) : null;
}

// --- Live search payload mapping ---

function numOrNull(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim() !== "") {
		const n = Number(value);
		return Number.isFinite(n) ? n : null;
	}
	return null;
}

/** One product from a cgi/search.pl payload (fields-limited shape). Entries
 * without a name or a sugars figure are skipped - the card needs both. */
function mapSearchProduct(item: unknown): SugarProduct | null {
	if (typeof item !== "object" || item === null) return null;
	const p = item as Record<string, unknown>;
	const code = typeof p.code === "string" ? p.code.trim() : typeof p.code === "number" ? String(p.code) : "";
	const name = typeof p.product_name === "string" ? p.product_name.replace(/\s+/g, " ").trim() : "";
	if (code === "" || name === "") return null;
	const nutriments =
		typeof p.nutriments === "object" && p.nutriments !== null ? (p.nutriments as Record<string, unknown>) : {};
	const sugars100g = numOrNull(nutriments.sugars_100g);
	if (sugars100g === null) return null;
	const sugarsServing = numOrNull(nutriments.sugars_serving);
	return {
		code,
		name,
		brands: typeof p.brands === "string" ? p.brands.replace(/\s+/g, " ").trim() : "",
		quantity: typeof p.quantity === "string" ? cleanQuantity(p.quantity) : "",
		servingSize:
			typeof p.serving_size === "string" && p.serving_size.trim() !== ""
				? p.serving_size.replace(/\s+/g, " ").trim()
				: null,
		sugars100g: round1(sugars100g),
		sugarsServing: sugarsServing === null ? null : round1(sugarsServing),
	};
}

export interface SugarSearchResult {
	products: SugarProduct[];
	/** The search's total match count, when the payload carries one. */
	totalCount: number | null;
}

/** Map a cgi/search.pl JSON payload; throws when the payload is not an object
 * (an HTML 503 wave served as a body must not read as "no matches"). */
export function parseSearchPayload(payload: unknown): SugarSearchResult {
	if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
		throw new Error("Open Food Facts search payload is not an object");
	}
	const record = payload as Record<string, unknown>;
	const list = Array.isArray(record.products) ? record.products : [];
	const seen = new Set<string>();
	const products: SugarProduct[] = [];
	for (const item of list) {
		const product = mapSearchProduct(item);
		if (product === null || seen.has(product.code)) continue;
		seen.add(product.code);
		products.push(product);
	}
	const total = numOrNull(record.count);
	return { products, totalCount: total === null ? null : Math.trunc(total) };
}
