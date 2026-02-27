"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SITE, NAV_LINKS } from "@/lib/constants";
import type { SectionId } from "@/lib/constants";
import { useActiveSection } from "@/hooks/use-active-section";
import { ScrollProgress } from "@/components/scroll-progress";

/**
 * Fixed minimal header with staggered page-load entrance.
 * Name (left) — section links (right), monospace throughout.
 */
export function Header() {
	const { activeSection, scrollTo } = useActiveSection();

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
			e.preventDefault();
			const id = href.replace("#", "") as SectionId;
			scrollTo(id);
		},
		[scrollTo],
	);

	return (
		<>
			<ScrollProgress />
			<motion.header
				role="banner"
				initial={{ y: -56, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
				className={cn(
					"fixed inset-x-0 top-0 z-50",
					"flex h-14 items-center justify-between",
					"px-6 sm:px-8 md:px-12 lg:px-16",
					"bg-background/80 backdrop-blur-md",
					"border-b border-border/40",
					"font-mono text-sm",
				)}
			>
				{/* ── Branding ── */}
				<a
					href="#hero"
					onClick={(e) => handleClick(e, "#hero")}
					className="tracking-tight text-foreground hover:text-foreground/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
				>
					{SITE.name}
				</a>

				{/* ── Navigation ── */}
				<nav aria-label="Main navigation" className="hidden sm:flex items-center gap-6">
					{NAV_LINKS.map(({ label, href }) => {
						const sectionId = href.replace("#", "");
						const isActive = activeSection === sectionId;

						return (
							<a
								key={href}
								href={href}
								onClick={(e) => handleClick(e, href)}
								aria-current={isActive ? "true" : undefined}
								className={cn(
									"relative py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
									isActive
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground/80",
								)}
							>
								{label}
								{/* active underline indicator */}
								<span
									aria-hidden="true"
									className={cn(
										"absolute inset-x-0 -bottom-px h-px bg-foreground transition-opacity duration-200",
										isActive ? "opacity-100" : "opacity-0",
									)}
								/>
							</a>
						);
					})}
				</nav>

				{/* ── Mobile menu toggle ── */}
				<button
					type="button"
					className="sm:hidden text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
					aria-label="Toggle navigation menu"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<line x1="4" y1="7" x2="20" y2="7" />
						<line x1="4" y1="12" x2="20" y2="12" />
						<line x1="4" y1="17" x2="20" y2="17" />
					</svg>
				</button>
			</motion.header>
		</>
	);
}
