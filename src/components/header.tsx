"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { useActiveSection } from "@/hooks/use-active-section";
import { jumpToSection } from "@/lib/section-navigation";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoMark } from "@/components/logo";
import { surfaceVariants } from "@/components/ui/surface";

/**
 * Fixed minimal header (static — no entrance animation).
 * Name (left) — section links + theme toggle + command menu (right), monospace throughout.
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
			className={cn(
				"fixed inset-x-0 top-0 z-[var(--z-header)]",
				"flex h-14 items-center justify-between",
				"px-6 sm:px-8 md:px-12 lg:px-16",
				surfaceVariants({ variant: "chrome", edge: false, radius: "none" }),
				"border-b border-[color:var(--glass-rim)]",
				"font-sans text-sm",
			)}
		>
			{/* ── Branding ── */}
			<a
				href="#hero"
				onClick={(e) => handleClick(e, "#hero")}
				aria-label={`${SITE.name}, home`}
				className="flex h-full items-center gap-2.5 tracking-tight text-foreground hover:text-foreground/80 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)] rounded-sm"
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
									"relative py-1 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)] rounded-sm",
									isActive
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground/80",
								)}
							>
								{label}
								<span
									aria-hidden="true"
									className={cn(
										"absolute inset-x-0 -bottom-px h-px bg-foreground",
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
	);
}
