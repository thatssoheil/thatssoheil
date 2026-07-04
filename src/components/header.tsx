"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { useActiveSection } from "@/hooks/use-active-section";
import { jumpToSection } from "@/lib/section-navigation";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoMark } from "@/components/logo";
import { Surface } from "@/components/ui/surface";

/**
 * Fixed glass island header (static — no entrance animation).
 * Name (left) — section links + theme toggle + command menu (right).
 */
export function Header() {
	const { activeSection } = useActiveSection();

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
			e.preventDefault();
			jumpToSection(href);
		},
		[],
	);

	return (
		<header
			role="banner"
			className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[var(--z-header)] px-3 sm:px-6 md:px-8"
		>
			<Surface
				variant="chrome"
				radius="lg"
				className="pointer-events-auto mx-auto flex min-h-14 w-full max-w-6xl items-center justify-between px-4 font-sans text-sm sm:px-5"
			>
				{/* ── Branding ── */}
				<a
					href="#hero"
					onClick={(e) => handleClick(e, "#hero")}
					aria-label={`${SITE.name}, home`}
					className="flex min-h-11 items-center gap-2.5 rounded-sm tracking-tight text-foreground hover:text-foreground/80 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
				>
					<LogoMark className="h-[18px]" />
					{SITE.name}
				</a>

				{/* ── Right cluster: nav (desktop) + theme toggle + command menu ── */}
				<div className="flex items-center gap-4 sm:gap-6">
					<nav aria-label="Main navigation" className="hidden sm:flex items-center gap-6">
						{NAV_LINKS.map(({ label, href }) => {
							const isActive = activeSection === href.replace("#", "");

							return (
								<a
									key={href}
									href={href}
									onClick={(e) => handleClick(e, href)}
									aria-current={isActive ? "true" : undefined}
									className={cn(
										"relative rounded-sm py-1 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]",
										isActive
											? "text-foreground"
											: "text-text-faint hover:text-foreground",
									)}
								>
									{label}
									<span
										aria-hidden="true"
										className={cn(
											"absolute inset-x-0 -bottom-px h-px bg-[linear-gradient(to_right,transparent,var(--brand),transparent)] [filter:drop-shadow(0_0_4px_var(--primary))]",
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
			</Surface>
		</header>
	);
}
