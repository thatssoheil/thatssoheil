import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/brand-icons";

// ─── Identity — the single source of truth for who Soheil is ───
// Every surface (hero, metadata, JSON-LD, the AI persona) derives from these, so
// the role / tagline / handle / domain can never drift apart again (audit #9).

/** Role, styled form — the visual hero treatment (the × is the signal accent). */
export const ROLE = "Frontend Engineer × Product Curator";
/** Role, prose form — for meta descriptions, schema.org jobTitle, alt text. */
export const ROLE_PROSE = "Frontend Engineer and Product Curator";
/** The motto, canonical casing (sentence case). */
export const TAGLINE = "Coding vision into existence";
/** X / Twitter handle — display casing for social cards and metadata. */
export const X_HANDLE = "@thatssoheil";

// ─── Site Constants ───

export const SITE = {
	name: "Soheil Fakour",
	title: `Soheil Fakour — ${TAGLINE}`,
	description:
		"Soheil Fakour is a frontend engineer and product curator building refined, AI-aware product interfaces with React, Next.js, TypeScript, and Cloudflare.",
	url: "https://thatssoheil.website",
	ogImage: "/opengraph-image",
	ogImageAlt:
		"Soheil Fakour, frontend engineer and product curator, coding vision into existence.",
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
export const NAV_LINKS = [
	...SECTIONS.filter((section) => section.id !== "hero").map((section) => ({
		label: section.label,
		href: `#${section.id}`,
	})),
	{ label: "Resume", href: "/resume" },
] as const;

// ─── Contact / social ───

export const EMAIL = "soheil.fakour@gmail.com";
export const PHONE = "+98 910 313 9376";
export const LOCATION = "Tehran, Iran";
export const AVAILABILITY =
	"Open to remote roles in Iran and international opportunities across Europe and GCC.";

/** Canonical social profiles — single source for the command menu, the connect
    section, and the Person JSON-LD `sameAs`, so the three can't drift. Icons +
    command-menu search keywords ride along as data. */
export const SOCIALS = [
	{ label: "GitHub", href: "https://github.com/thatssoheil", icon: GitHubIcon, keywords: "code repos source" },
	{ label: "LinkedIn", href: "https://linkedin.com/in/soheilfakour", icon: LinkedInIcon, keywords: "work cv resume" },
	{ label: "X / Twitter", href: "https://x.com/Thatssoheil", icon: XIcon, keywords: "tweets social" },
] as const;
