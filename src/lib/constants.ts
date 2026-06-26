import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/brand-icons";

// ─── Site Constants ───

export const SITE = {
	name: "Soheil Fakour",
	title: "Soheil Fakour — Coding Vision into Existence",
	description:
		"Portfolio of Soheil Fakour — Frontend Engineer and Product Curator.",
	url: "https://thatssoheil.com",
	ogImage: "/og.png",
} as const;

/** All navigable sections — order matters for scroll tracking and homepage render order. */
export const SECTIONS = [
	{ id: "hero", label: "Hero" },
	{ id: "manifesto", label: "Manifesto" },
	{ id: "connect", label: "Connect" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** The `sm` breakpoint in px, matching Tailwind's default. Single source of
    truth for JS-side width gates (e.g. GSAP `matchMedia`) so the "mobile vs.
    desktop" boundary can't silently drift from the CSS `sm:` utilities. */
export const SM_BREAKPOINT_PX = 640;

/** Links shown in the header nav (hero excluded). */
export const NAV_LINKS = SECTIONS.filter((s) => s.id !== "hero").map((s) => ({
	label: s.label,
	href: `#${s.id}`,
}));

// ─── Contact / social ───

export const EMAIL = "soheil.fakour@gmail.com";

/** Canonical social profiles — single source for the command menu, the connect
    section, and the Person JSON-LD `sameAs`, so the three can't drift. Icons +
    command-menu search keywords ride along as data. */
export const SOCIALS = [
	{ label: "GitHub", href: "https://github.com/thatssoheil", icon: GitHubIcon, keywords: "code repos source" },
	{ label: "LinkedIn", href: "https://linkedin.com/in/soheilfakour", icon: LinkedInIcon, keywords: "work cv resume" },
	{ label: "X / Twitter", href: "https://x.com/Thatssoheil", icon: XIcon, keywords: "tweets social" },
] as const;
