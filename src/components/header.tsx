"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { SITE, NAV_LINKS } from "@/lib/constants";
import type { SectionId } from "@/lib/constants";
import { useActiveSection } from "@/hooks/use-active-section";
import { jumpToSection } from "@/lib/section-navigation";
import { ScrollProgress } from "@/components/scroll-progress";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoMark } from "@/components/logo";
import { gsap } from "@/lib/gsap";
import { useMotion } from "@/hooks/use-motion";
import { MOTION_EASE } from "@/lib/motion";

/**
 * Fixed minimal header with a staggered page-load entrance.
 * Name (left) — section links + theme toggle + command menu (right), monospace throughout.
 */
export function Header() {
	const { activeSection } = useActiveSection();
	const headerRef = useRef<HTMLElement>(null);

	// fromTo (not from): the CSS FOUC gate holds the header hidden in the SSR
	// markup, so we state the visible end explicitly. clearProps:"transform"
	// drops the inline translate but keeps the inline opacity:1 (which the
	// fixed header needs so the gate never re-hides it).
	useMotion(
		{
			full: () => {
				gsap.fromTo(
					headerRef.current,
					{ y: -56, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.5,
						delay: 0.1,
						ease: MOTION_EASE,
						clearProps: "transform",
					},
				);
			},
			reduced: () => {
				gsap.fromTo(
					headerRef.current,
					{ opacity: 0 },
					{ opacity: 1, duration: 0.3 },
				);
			},
		},
		{ scope: headerRef },
	);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
			e.preventDefault();
			jumpToSection(href.replace("#", "") as SectionId);
		},
		[],
	);

	return (
		<>
			<ScrollProgress />
			<header
				ref={headerRef}
				data-header
				role="banner"
				className={cn(
					"fixed inset-x-0 top-0 z-[var(--z-header)]",
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
					aria-label={`${SITE.name} — home`}
					className="flex h-full items-center gap-2.5 tracking-tight text-foreground hover:text-foreground/80 transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)] rounded-sm"
				>
					<LogoMark className="h-[18px]" />
					{SITE.name}
				</a>

				{/* ── Right cluster: nav (desktop) + theme toggle + command menu ── */}
				<div className="flex items-center gap-4 sm:gap-6">
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
										"relative py-1 transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)] rounded-sm",
										isActive
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground/80",
									)}
								>
									{label}
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

					<div className="flex items-center gap-2">
						<ThemeToggle />
						<CommandMenu />
					</div>
				</div>
			</header>
		</>
	);
}
