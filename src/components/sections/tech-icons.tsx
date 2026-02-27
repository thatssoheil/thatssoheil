"use client";

/**
 * Real brand icons from simple-icons, rendered as coloured SVGs.
 * Each icon path comes from the official simple-icons dataset.
 */
import {
  siTypescript,
  siJavascript,
  siHtml5,
  siCss,
  siReact,
  siNextdotjs,
  siNodedotjs,
  siTailwindcss,
  siMui,
  siWordpress,
  siGit,
  siFigma,
  siVscodium,
  siVite,
  siGithub,
  siVercel,
  siCloudflare,
} from "simple-icons";

// ─── Icon registry ─────────────────────────────────────────────────────────

const ICON_REGISTRY: Record<string, { path: string; hex: string }> = {
  typescript:       siTypescript,
  javascript:       siJavascript,
  html5:            siHtml5,
  css:              siCss,
  react:            siReact,
  nextdotjs:        siNextdotjs,
  nodedotjs:        siNodedotjs,
  tailwindcss:      siTailwindcss,
  mui:              siMui,
  wordpress:        siWordpress,
  git:              siGit,
  figma:            siFigma,
  vscodium:         siVscodium,
  vite:             siVite,
  github:           siGithub,
  vercel:           siVercel,
  cloudflare:       siCloudflare,
};

// ─── Component ─────────────────────────────────────────────────────────────

interface TechIconProps {
  /** Slug matching a key in ICON_REGISTRY */
  slug: string;
  /** Brand hex WITHOUT the leading # */
  hex: string;
  className?: string;
  size?: number;
}

export function TechIcon({ slug, hex, className, size = 18 }: TechIconProps) {
  const icon = ICON_REGISTRY[slug];

  if (!icon) {
    // Fallback: generic box
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className={className}
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
    );
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={`#${hex}`}
      className={className}
      aria-hidden="true"
    >
      <path d={icon.path} />
    </svg>
  );
}

