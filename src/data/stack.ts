// ─── Tech Stack Data ───
// Edit this file to update the Stack section content.

export interface TechItem {
  name: string;
  /** SVG path data or a simple icon identifier */
  icon: string;
}

export interface TechCategory {
  label: string;
  items: TechItem[];
}

export const STACK: TechCategory[] = [
  {
    label: "Languages",
    items: [
      { name: "TypeScript", icon: "typescript" },
      { name: "JavaScript", icon: "javascript" },
      { name: "Python", icon: "python" },
      { name: "Rust", icon: "rust" },
      { name: "Go", icon: "go" },
      { name: "HTML", icon: "html" },
      { name: "CSS", icon: "css" },
      { name: "SQL", icon: "sql" },
      { name: "WGSL", icon: "wgsl" },
    ],
  },
  {
    label: "Frameworks",
    items: [
      { name: "React", icon: "react" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Node.js", icon: "nodejs" },
      { name: "Tailwind CSS", icon: "tailwind" },
      { name: "Express", icon: "express" },
      { name: "FastAPI", icon: "fastapi" },
      { name: "Three.js", icon: "threejs" },
      { name: "Framer Motion", icon: "framer" },
    ],
  },
  {
    label: "Tools",
    items: [
      { name: "Git", icon: "git" },
      { name: "Docker", icon: "docker" },
      { name: "Figma", icon: "figma" },
      { name: "VS Code", icon: "vscode" },
      { name: "Webpack", icon: "webpack" },
      { name: "Vite", icon: "vite" },
      { name: "ESLint", icon: "eslint" },
      { name: "Postgres", icon: "postgres" },
    ],
  },
  {
    label: "Platforms",
    items: [
      { name: "Cloudflare", icon: "cloudflare" },
      { name: "AWS", icon: "aws" },
      { name: "Vercel", icon: "vercel" },
      { name: "GitHub", icon: "github" },
      { name: "Linux", icon: "linux" },
      { name: "WebGPU", icon: "webgpu" },
    ],
  },
] as const;
