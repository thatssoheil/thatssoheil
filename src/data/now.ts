// ─── Now / Work Data ───
// The concrete, hireable facts — current work, availability, stack, background.
// These used to live only in README.md and reached neither visitors nor the AI
// persona (audit #1). Edit here to update both the on-page "Now" block and the chat.
// Voice: plain, grounded, first-person-adjacent. No corporate fluff.

export interface WorkNote {
	label: string;
	body: string;
}

export const NOW = {
	/** One-line availability — answers the "are you available?" starter chip. */
	status:
		"Open to senior frontend + product engineering work — remote, or on the ground in Oman.",
	/** What he's anchoring right now. */
	current:
		"Anchoring frontend and product on a small team building a medical AI tool that helps clinicians navigate patient data. Heading to Oman next.",
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
			body: "Several products since, B2C and B2B — including remote work with teams in Dallas and Toronto.",
		},
	] satisfies readonly WorkNote[],
} as const;
