// ─── Projects Data ───
// Edit this file to update the Projects showcase section.

export interface Project {
  title: string;
  description: string;
  tech: string[];
  context: string; // employer / context label
  github?: string;
  live?: string;
}

export const PROJECTS: {
  heading: string;
  subheading: string;
  entries: Project[];
} = {
  heading: "Projects",
  subheading: "Selected work",
  entries: [
    {
      title: "Rechat CRM Template Engine",
      description:
        "A dynamic, CMS-integrated template system that lets US and Canadian realtors create, edit, and publish marketing assets — deal papers, email campaigns, and social media posts — without leaving the platform. Templates are pixel-perfect, responsive, and fully customisable via declared attributes.",
      tech: ["JavaScript", "HTML", "CSS", "CMS Integration"],
      context: "Rechat · Dallas, TX",
      live: "https://rechat.com",
    },
    {
      title: "Engenesis Platform",
      description:
        "A social-learning platform that brings together the professional networking of LinkedIn and the structured course delivery of Coursera. Built a scalable component architecture, enforced clean-code standards, and collaborated cross-functionally to ship features consistently.",
      tech: ["React", "TypeScript", "Node.js", "REST API"],
      context: "Zaman · Tehran",
    },
    {
      title: "Nova Panel — Legacy Redesign",
      description:
        "Full modernisation of a legacy B2B enterprise panel at MCINEXT. Migrated the entire UI to Material UI, implemented a new design system aligned with contemporary UX principles, and rewired complex backend interactions to support dynamic, real-time data updates.",
      tech: ["React", "Material UI", "TypeScript", "REST API"],
      context: "MCINEXT · Tehran",
    },
    {
      title: "Dideban Watcher Platform",
      description:
        "A web-scraping SaaS that lets users monitor anything that changes cyclically online — from cryptocurrency prices to product availability. Joined at the founding stage and built the entire frontend panel from scratch, establishing the component system and design language.",
      tech: ["React", "TypeScript", "Tailwind CSS", "REST API"],
      context: "Dideban · Tehran",
    },
  ],
} as const;
