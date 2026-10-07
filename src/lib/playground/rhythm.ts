// ─── Euclidean rhythms: Bjorklund's algorithm + the pinned catalogue ───
// Toussaint (2005) showed that the timeline patterns of much of the world's
// music are Euclid's algorithm in disguise: spread k pulses as evenly as
// possible across n steps and out come the tresillo, the bossa nova clave,
// the Turkish aksak. This module is the pure core of the instrument: the
// algorithm (a deterministic function - no data, nothing to fetch) and the
// catalogue from the paper with its canonical starting rotations pinned.

export interface RhythmPreset {
	slug: string;
	name: string;
	pulses: number;
	steps: number;
	origin: string;
	/** Canonical rotation from Toussaint 2005, as a 0/1 string. */
	pattern: string;
}

/**
 * The catalogue from Toussaint, G. T. (2005), "The Euclidean Algorithm
 * Generates Traditional Musical Rhythms", Renaissance Banff: Mathematics,
 * Music, Art, Culture, pp. 47-56. Every pattern is pinned to the string the
 * paper prints; the generator below may emit the same necklace from a
 * different starting point.
 */
export const RHYTHM_PRESETS: readonly RhythmPreset[] = [
	{ slug: "tresillo", name: "Tresillo", pulses: 3, steps: 8, origin: "Cuba", pattern: "10010010" },
	{ slug: "cinquillo", name: "Cinquillo", pulses: 5, steps: 8, origin: "Cuba", pattern: "10110110" },
	{ slug: "bossa-nova", name: "Bossa nova", pulses: 5, steps: 16, origin: "Brazil", pattern: "1001001001001000" },
	{ slug: "samba", name: "Samba", pulses: 7, steps: 16, origin: "Brazil", pattern: "1001010100101010" },
	{ slug: "aksak", name: "Aksak", pulses: 4, steps: 9, origin: "Turkey", pattern: "101010100" },
	{ slug: "cumbia", name: "Cumbia", pulses: 3, steps: 4, origin: "Colombia", pattern: "1011" },
	{ slug: "khafif-e-ramal", name: "Khafif-e-ramal", pulses: 2, steps: 5, origin: "Persia, 13th century", pattern: "10100" },
	{ slug: "venda-clapping", name: "Venda clapping", pulses: 5, steps: 12, origin: "South Africa", pattern: "101001010010" },
	{ slug: "ruchenitza", name: "Ruchenitza", pulses: 3, steps: 7, origin: "Bulgaria", pattern: "1010100" },
	{ slug: "west-african-bell", name: "West African bell", pulses: 7, steps: 12, origin: "Ghana", pattern: "101101011010" },
];

/**
 * Bjorklund's algorithm (the bucket method): distribute `pulses` onsets over
 * `steps` positions as evenly as possible, then rotate the result so it
 * starts with an onset. Returns one boolean per step.
 */
export function bjorklund(pulses: number, steps: number): boolean[] {
	const n = Math.max(Math.round(steps), 1);
	const k = Math.min(Math.max(Math.round(pulses), 0), n);
	if (k === 0) return new Array<boolean>(n).fill(false);
	if (k === n) return new Array<boolean>(n).fill(true);

	// Bucket method: repeatedly split the slots into buckets of full and
	// remainder size until every bucket holds one or two entries, then
	// unroll the recursion.
	const counts: number[] = [];
	const remainders: number[] = [k];
	let divisor = n - k;
	let level = 0;
	while (true) {
		counts.push(Math.floor(divisor / remainders[level]));
		remainders.push(divisor % remainders[level]);
		divisor = remainders[level];
		level += 1;
		if (remainders[level] <= 1) break;
	}
	counts.push(divisor);

	const bits: number[] = [];
	const build = (l: number) => {
		if (l === -1) {
			bits.push(0);
		} else if (l === -2) {
			bits.push(1);
		} else {
			for (let i = 0; i < counts[l]; i += 1) build(l - 1);
			if (remainders[l] !== 0) build(l - 2);
		}
	};
	build(level);

	const first = bits.indexOf(1);
	const rotated = first > 0 ? [...bits.slice(first), ...bits.slice(0, first)] : bits;
	return rotated.map((bit) => bit === 1);
}

/** The pattern as a 0/1 string, the form the paper prints. */
export function patternToString(pattern: boolean[]): string {
	return pattern.map((on) => (on ? "1" : "0")).join("");
}
