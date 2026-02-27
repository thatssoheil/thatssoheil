"use client";

/**
 * Monochrome SVG icons for the tech stack grid.
 * Each icon is a simple 24×24 SVG rendered in currentColor.
 */
export function TechIcon({ id, className }: { id: string; className?: string }) {
  const props = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (id) {
    case "typescript":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" />
          <path d="M10 10v7M7.5 10H12.5" />
          <path d="M15 10c1.5 0 2.5.8 2.5 1.8s-1 1.7-2.5 1.7c-1.5 0-2.5.7-2.5 1.7S14 17 15.5 17" />
        </svg>
      );
    case "javascript":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" />
          <path d="M10 10v5c0 1.1-.9 2-2 2" />
          <path d="M15 10c1.5 0 2.5.8 2.5 1.8s-1 1.7-2.5 1.7-2.5.7-2.5 1.7S14 17 15.5 17" />
        </svg>
      );
    case "python":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 3c-4.97 0-5 2.5-5 2.5V8h5v1H6.5S3 8.6 3 12.5 5.8 17 5.8 17H8v-2.9c0-1.6 1.4-3.1 3-3.1h4c1.4 0 2-1 2-2V6.5S17.5 3 12 3z" />
          <path d="M12 21c4.97 0 5-2.5 5-2.5V16h-5v-1h5.5S21 15.4 21 11.5 18.2 7 18.2 7H16v2.9c0 1.6-1.4 3.1-3 3.1H9c-1.4 0-2 1-2 2v2.5S6.5 21 12 21z" />
          <circle cx="9.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="14.5" cy="17.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "rust":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4V6M12 18v2M4 12H6M18 12h2" />
          <path d="M9 9h3v6H9M15 9v6" />
        </svg>
      );
    case "go":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M3 12l2-1 2 1M17 12l2-1 2 1" />
          <ellipse cx="12" cy="13" rx="5" ry="4" />
          <path d="M9 12h3l-1 3" />
        </svg>
      );
    case "html":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 3l1.5 17L12 22l6.5-2L20 3H4z" />
          <path d="M8 8h8l-.5 5H10l.25 3L12 17l3.5-1" />
        </svg>
      );
    case "css":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 3l1.5 17L12 22l6.5-2L20 3H4z" />
          <path d="M15 7H9l.3 3h5.4l-.4 5L12 16.5 9.7 15l-.2-2" />
        </svg>
      );
    case "sql":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
          <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" />
        </svg>
      );
    case "wgsl":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 6l4 12L12 10l4 8 4-12" />
        </svg>
      );
    case "react":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
          <ellipse cx="12" cy="12" rx="9" ry="4" />
          <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" />
        </svg>
      );
    case "nextjs":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 8v8M9 8l8 10" />
          <path d="M15 8v4" />
        </svg>
      );
    case "nodejs":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
          <path d="M12 7v5l4 2" />
        </svg>
      );
    case "tailwind":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M7 10c1-3 3.5-4 6-4 3.5 0 4 2.5 6 3 1.3.3 2.5 0 3.5-1" />
          <path d="M1.5 16c1-3 3.5-4 6-4 3.5 0 4 2.5 6 3 1.3.3 2.5 0 3.5-1" />
        </svg>
      );
    case "express":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M3 12h18M3 12c3-4 6-6 9-6s6 2 9 6M3 12c3 4 6 6 9 6s6-2 9-6" />
        </svg>
      );
    case "fastapi":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M13 3L7 14h5l-1 7 6-11h-5l1-7z" />
        </svg>
      );
    case "threejs":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M6 19l6-14 6 14H6z" />
          <path d="M9 13h6" />
        </svg>
      );
    case "framer":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M6 3h12v6H12l6 6H6v6l6-6V9H6V3z" fill="none" />
        </svg>
      );
    case "git":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="6" cy="18" r="2" />
          <path d="M6 8v8M8 6h8M6 18h0" />
          <path d="M18 8v4c0 2-2 4-4 4H6" />
        </svg>
      );
    case "docker":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="2" y="11" width="20" height="8" rx="2" />
          <rect x="5" y="7" width="3" height="4" />
          <rect x="9" y="7" width="3" height="4" />
          <rect x="13" y="7" width="3" height="4" />
          <rect x="9" y="3" width="3" height="4" />
        </svg>
      );
    case "figma":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="8" y="2" width="4" height="6" rx="2" />
          <rect x="12" y="2" width="4" height="6" rx="2" />
          <rect x="8" y="8" width="4" height="6" rx="2" />
          <circle cx="16" cy="11" r="3" />
          <rect x="8" y="14" width="4" height="6" rx="2" />
        </svg>
      );
    case "vscode":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M17 2l4 2v16l-4 2L3 14l3-2.5L17 20V4L6 12 3 10 17 2z" fill="none" />
        </svg>
      );
    case "webpack":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
          <path d="M12 7v10M7 9.5l5 3M17 9.5l-5 3M7 14.5l5-3M17 14.5l-5-3" />
        </svg>
      );
    case "vite":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M20 3L12 21 4 3l8 3 8-3z" />
          <path d="M14 2l-2 9" />
        </svg>
      );
    case "eslint":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
          <path d="M12 8l4 2.5v4L12 17l-4-2.5v-4L12 8z" />
        </svg>
      );
    case "postgres":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <ellipse cx="12" cy="6" rx="7" ry="3" />
          <path d="M5 6v5c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
          <path d="M5 11v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" />
          <path d="M15 10v5.5c0 1 1 2 3 2" />
        </svg>
      );
    case "cloudflare":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M16 17H7a5 5 0 1 1 .1-10A7 7 0 0 1 20 11a4 4 0 0 1 0 6h-4z" />
        </svg>
      );
    case "aws":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M4 15l4-10 4 10" />
          <path d="M5.5 12h5" />
          <path d="M14 5l2 7 2-7 2 7 2-7" />
          <path d="M2 18c5 2 15 2 20 0" />
        </svg>
      );
    case "vercel":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 3l10 17H2L12 3z" fill="none" />
        </svg>
      );
    case "github":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z" fill="none" />
        </svg>
      );
    case "linux":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <path d="M12 2c-2.21 0-4 2.69-4 6v3c-1.5 1-3 2.5-3 4 0 2 2 4 7 4s7-2 7-4c0-1.5-1.5-3-3-4V8c0-3.31-1.79-6-4-6z" />
          <circle cx="10" cy="8" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="14" cy="8" r="0.8" fill="currentColor" stroke="none" />
          <path d="M10 12c.7.7 3.3.7 4 0" />
        </svg>
      );
    case "webgpu":
      return (
        <svg {...props} viewBox="0 0 24 24">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M8 10l2 2-2 2M13 10h3M13 14h3" />
        </svg>
      );
    default:
      return (
        <svg {...props} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      );
  }
}
