"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { SITE, NAV_LINKS } from "@/lib/constants";
import type { SectionId } from "@/lib/constants";
import { useActiveSection } from "@/hooks/use-active-section";
import { ScrollProgress } from "@/components/scroll-progress";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoMark } from "@/components/logo";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Fixed minimal header with a staggered page-load entrance.
 * Name (left) — section links + theme toggle + command menu (right), monospace throughout.
 */
export function Header() {
	const { activeSection, scrollTo } = useActiveSection();
	const headerRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.from(headerRef.current, {
					y: -56,
					opacity: 0,
					duration: 0.5,
					delay: 0.1,
					ease: "power2.out",
				});
			});
			mm.add("(prefers-reduced-motion: reduce)", () => {
				gsap.from(headerRef.current, { opacity: 0, duration: 0.3 });
			});
		},
		{ scope: headerRef },
	);

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
			<header
				ref={headerRef}
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
					className="flex items-center gap-2.5 tracking-tight text-foreground hover:text-foreground/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
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
										"relative py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
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
