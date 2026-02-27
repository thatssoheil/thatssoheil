// ─── Tech Stack Data ───
// Edit this file to update the Stack section content.
// slug → key used to look up the icon in simple-icons (e.g. siTypescript)
// hex  → brand colour WITHOUT the leading #

export interface TechItem {
  name: string;
  slug: string;
  hex: string;
}

export interface TechCategory {
  label: string;
  items: TechItem[];
}

export const STACK: TechCategory[] = [
  {
    label: "Languages",
    items: [
      { name: "TypeScript",   slug: "typescript",   hex: "3178C6" },
      { name: "JavaScript",   slug: "javascript",   hex: "F7DF1E" },
      { name: "HTML5",        slug: "html5",        hex: "E34F26" },
      { name: "CSS3",         slug: "css",          hex: "1572B6" },
    ],
  },
  {
    label: "Frameworks & Libraries",
    items: [
      { name: "React",        slug: "react",        hex: "61DAFB" },
      { name: "Next.js",      slug: "nextdotjs",    hex: "FFFFFF" },
      { name: "Node.js",      slug: "nodedotjs",    hex: "5FA04E" },
      { name: "Tailwind CSS", slug: "tailwindcss",  hex: "06B6D4" },
      { name: "Material UI",  slug: "mui",          hex: "007FFF" },
      { name: "WordPress",    slug: "wordpress",    hex: "21759B" },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Git",          slug: "git",          hex: "F05032" },
      { name: "Figma",        slug: "figma",        hex: "F24E1E" },
      { name: "VS Code",      slug: "vscodium",     hex: "2F80ED" },
      { name: "Vite",         slug: "vite",         hex: "646CFF" },
    ],
  },
  {
    label: "Platforms",
    items: [
      { name: "GitHub",       slug: "github",       hex: "FFFFFF" },
      { name: "Vercel",       slug: "vercel",       hex: "FFFFFF" },
      { name: "Cloudflare",   slug: "cloudflare",   hex: "F38020" },
    ],
  },
];
