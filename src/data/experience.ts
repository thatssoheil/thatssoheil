// ─── Experience / Career Data ───
// Edit this file to update the Experience timeline section.

export interface ExperienceEntry {
  company: string;
  role: string;
  dateRange: string;
  location: string;
  description: string;
  bullets?: string[];
}

export const EXPERIENCE: {
  heading: string;
  subheading: string;
  entries: ExperienceEntry[];
} = {
  heading: "Experience",
  subheading: "Career timeline",
  entries: [
    {
      company: "mom.ir",
      role: "Frontend Web Developer",
      dateRange: "Feb 2026 — Present",
      location: "Tehran, Iran",
      description:
        "Contributing to frontend development at mom.ir, building performant and user-focused web experiences.",
    },
    {
      company: "MCINEXT",
      role: "Frontend Web Developer",
      dateRange: "Dec 2023 — Nov 2025",
      location: "Tehran, Iran",
      description:
        "Worked across three teams over two years at MCI Next — an innovative branch of MCI behind products like Shaadbin and Zarebin.",
      bullets: [
        "Team Anzu (B2B): Implemented scalable frontend solutions for B2B products, improving performance and usability while collaborating closely with business stakeholders.",
        "Team Nova (B2B): Led a full legacy-to-modern redesign, migrating the product to Material UI and aligning complex backend logic with a new, dynamic UI.",
        "Team Daani (B2C): Joined as an early member, delivered pixel-perfect UI, raised code quality standards, and drove roadmap discussions in bi-weekly scrum sessions.",
      ],
    },
    {
      company: "Dideban",
      role: "Frontend Web Developer",
      dateRange: "Aug 2023 — Dec 2023",
      location: "Tehran, Iran",
      description:
        "Joined the early-stage web-scraping startup Dideban to build their UI panel from the ground up — enabling users to set automated watchers on anything from crypto prices to product listings.",
      bullets: [
        "Pixel-perfect implementation of the full UI/UX design.",
        "Developed a reusable component library following SOLID principles.",
        "Worked directly with product founders to understand and translate business ideas into code.",
      ],
    },
    {
      company: "Zaman",
      role: "Frontend Web Developer",
      dateRange: "Jul 2022 — Oct 2023",
      location: "Tehran, Iran",
      description:
        "Primary project: Engenesis Platform — a social-learning product that combines the networking of LinkedIn with the course structure of Coursera.",
      bullets: [
        "Collaborated with designers and backend developers to ship cohesive product features.",
        "Developed reusable, maintainable components following standard clean-code principles.",
        "Reviewed requirements to ensure accurate design-to-code translation.",
      ],
    },
    {
      company: "Epic Labs",
      role: "Frontend Web Developer",
      dateRange: "Jun 2022 — Jun 2023",
      location: "Toronto, Canada",
      description:
        "Epic Labs is an online incubator for first-time founders in the Canada Startup Visa Program. Built websites showcasing startup ideas to immigration officers.",
      bullets: [
        "Delivered pixel-perfect client websites using HTML, CSS, JavaScript, and WordPress.",
        "Implemented custom features via the WordPress plugin ecosystem.",
      ],
    },
    {
      company: "Rechat",
      role: "Frontend Web Developer",
      dateRange: "Sep 2021 — Jun 2022",
      location: "Dallas, Texas, US",
      description:
        "Rechat is a cutting-edge CRM and marketing automation platform for realtors across the US and Canada. Specialised in building the dynamic template engine inside the CMS.",
      bullets: [
        "Built pixel-perfect, responsive, accessible HTML/CSS templates integrated into an internal panel.",
        "Enabled realtors to create and publish deal papers, email campaigns, and social posts directly in the CRM.",
        "Collaborated with QA to ensure seamless performance and client alignment.",
        "Awarded Developer of the Month twice for excellence and team contribution.",
      ],
    },
    {
      company: "Lamasoo",
      role: "Backend Developer",
      dateRange: "Jan 2019 — Mar 2020",
      location: "Tehran, Iran",
      description:
        "Began my career as a backend developer, building a channel management service that queued requests between travel agencies and hotels. Discovered a deep passion for frontend and pivoted — using my Node.js foundation to make the transition natural.",
    },
  ],
} as const;
