// ─── Now / Work Data ───
// The concrete, hireable facts — current work, availability, stack, background.
// These used to live only in README.md and reached neither visitors nor the AI
// persona (audit #1). Edit here to update both the on-page "Now" block and the chat.
// Voice: plain, grounded, first-person-adjacent. No corporate fluff.

import { AVAILABILITY } from "@/lib/constants";

export interface WorkNote {
	label: string;
	body: string;
}

export const NOW = {
	/** One-line availability — answers the "are you available?" starter chip. */
	status: AVAILABILITY,
	/** What he's anchoring right now. */
	current:
		"Owning frontend delivery on a small team building clinical AI that turns physician-patient conversations into structured medical documentation.",
	/** The tools he actually reaches for. */
	stack: [
		"TypeScript",
		"React 19",
		"Next.js 16",
		"Tailwind",
		"GSAP",
		"Cloudflare Workers",
	],
	/** Background, most-recent first. */
	past: [
		{
			label: "Before this",
			body: "Travel and hotel channel-management infrastructure, then a deliberate move to the frontend.",
		},
		{
			label: "Shipped",
			body: "B2C and B2B products across healthcare, conversational AI, customer support, publishing, and commerce.",
		},
	] satisfies readonly WorkNote[],
} as const;
