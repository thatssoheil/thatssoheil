// ─── Projects Data ───
// Edit this file to update the Projects showcase section.

export interface Project {
  title: string;
  description: string;
  tech: string[];
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
      title: "Realtime Shader Playground",
      description:
        "A browser-based WebGPU sandbox for authoring and live-previewing WGSL shaders with hot reload, multi-pass pipelines, and exportable screenshots.",
      tech: ["WebGPU", "WGSL", "TypeScript", "Next.js"],
      github: "https://github.com/soheil/shader-playground",
      live: "https://shaders.thatssoheil.com",
    },
    {
      title: "Edge Analytics Dashboard",
      description:
        "High-performance analytics dashboard running entirely at the edge with Cloudflare Workers and D1. Sub-50 ms p99 latency for complex aggregations.",
      tech: ["Cloudflare Workers", "D1", "React", "Tailwind CSS"],
      github: "https://github.com/soheil/edge-analytics",
      live: "https://analytics.thatssoheil.com",
    },
    {
      title: "Generative Art Engine",
      description:
        "A creative-coding framework for producing deterministic generative artwork from seed values. Exports to SVG and high-res PNG for print.",
      tech: ["Canvas API", "TypeScript", "Node.js", "SVG"],
      github: "https://github.com/soheil/gen-art-engine",
    },
    {
      title: "Collaborative Whiteboard",
      description:
        "Real-time multiplayer whiteboard with CRDT-based conflict resolution, infinite canvas, and pressure-sensitive brush engine.",
      tech: ["WebSockets", "Y.js", "React", "PostgreSQL"],
      github: "https://github.com/soheil/collab-board",
      live: "https://board.thatssoheil.com",
    },
  ],
} as const;
