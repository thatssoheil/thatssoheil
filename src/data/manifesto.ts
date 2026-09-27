// ─── Manifesto Data ───
// Edit this file to update the Manifesto section content.
// Voice: plain, grounded English. Direct, sharp, confident. No corporate fluff.
// No mechanical metaphors ("logic loops", "operating system", "codeblocks").

export interface ManifestoParagraph {
	label: string;
	body: string;
}

export const MANIFESTO = {
	label: "About",
	heading: "Manifesto",
	subheading: "Frontend Engineer and Product Curator",
	paragraphs: [
		{
			label: "On curation",
			body: "I stopped chasing perfection a while ago. Reality moves too fast for finished work. What I do instead is curate: choose what stays, cut what doesn't hold up, and build from the pieces that survive. A product isn't great because it has everything. It's great because someone decided what to leave out.",
		},
		{
			label: "On working",
			body: "I'd rather show you the thing than argue about the thing. If an idea matters, I'll build a small working version of it before the next meeting. If it doesn't survive contact with the real product, I'll remove it without ceremony. The work wins the room. Words rarely do.",
		},
		{
			label: "On the medium",
			body: "I started in backend, writing infrastructure that kept hotel inventory and travel agencies in sync. No one ever saw it. No one ever felt it. I left to build what people actually touch. Frontend isn't decoration for me. It's the surface where every product decision either lands or doesn't. That's where the work matters.",
		},
		{
			label: "On AI",
			body: "I work with AI every day: closely, with high standards, and without illusions. It drafts, it explores, it deletes the blank page. It has no taste, and it can't decide what deserves to ship. That part is still mine, and it is the part that matters. The tools are new. The taste is not.",
		},
	] satisfies readonly ManifestoParagraph[],
} as const;
