// ─── Experience / Career Data ───
// Edit this file to update the Experience timeline section.

export interface ExperienceEntry {
  company: string;
  role: string;
  dateRange: string;
  description: string;
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
      company: "Freelance",
      role: "Creative Technologist",
      dateRange: "2024 — Present",
      description:
        "Building high-performance web experiences with WebGPU, Next.js, and edge-first architecture. Focused on real-time graphics, generative UI, and design-engineering consulting.",
    },
    {
      company: "Acme Corp",
      role: "Senior Front-End Engineer",
      dateRange: "2022 — 2024",
      description:
        "Led the design-system team, shipped a component library used across 12 products, and introduced GPU-accelerated data-visualization dashboards that cut render times by 60 %.",
    },
    {
      company: "Nebula Studios",
      role: "Full-Stack Developer",
      dateRange: "2020 — 2022",
      description:
        "Architected a real-time collaboration platform on WebSockets and React, serving 50 k+ daily active users. Built CI/CD pipelines and migrated infrastructure to Kubernetes.",
    },
    {
      company: "PixelForge",
      role: "Junior Developer",
      dateRange: "2018 — 2020",
      description:
        "Developed interactive marketing sites and e-commerce storefronts. First exposure to shader programming and creative coding — sparked a lasting passion for real-time graphics.",
    },
  ],
} as const;
