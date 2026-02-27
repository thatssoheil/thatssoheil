// ─── Site Constants ───

export const SITE = {
  name: "Soheil Fakour",
  title: "Soheil Fakour — Coding Vision into Existence",
  description:
    "Portfolio of Soheil Fakour — developer, designer, and creative technologist.",
  url: "https://thatssoheil.com",
  ogImage: "/og.png",
} as const;

/** All navigable sections — order matters for scroll tracking. */
export const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

/** Links shown in the header nav (hero excluded). */
export const NAV_LINKS = SECTIONS.filter((s) => s.id !== "hero").map((s) => ({
  label: s.label,
  href: `#${s.id}`,
}));
