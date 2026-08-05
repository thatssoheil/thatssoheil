"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SITE, NAV_LINKS } from "@/lib/constants";
import { useActiveSection } from "@/hooks/use-active-section";
import { jumpToSection } from "@/lib/section-navigation";
import { CommandMenu } from "@/components/command-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoMark } from "@/components/logo";
import { Surface } from "@/components/ui/surface";
import { textRole } from "@/components/ui/typography";

/**
 * Fixed glass island header (static — no entrance animation).
 * Name (left) — section links + theme toggle + command menu (right).
 */
export function Header() {
	const { activeSection } = useActiveSection();
	const pathname = usePathname();
	const isHome = pathname === "/";

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
			if (!href.startsWith("#") || !isHome) return;
			e.preventDefault();
			jumpToSection(href);
		},
		[isHome],
	);

	const resolveHref = (href: string) =>
		href.startsWith("#") && !isHome ? `/${href}` : href;

	return (
		<header
			role="banner"
			className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[var(--z-header)] px-5 sm:px-8 md:px-12 lg:px-16"
		>
			<Surface
				variant="chrome"
				radius="md"
				className="pointer-events-auto mx-auto flex min-h-14 w-full max-w-4xl items-center justify-between px-4 font-sans text-sm sm:px-5"
			>
				{/* ── Branding ── */}
				<a
					href={isHome ? "#hero" : "/"}
					onClick={(e) => {
						if (isHome) handleClick(e, "#hero");
					}}
					aria-label={`${SITE.name}, home`}
					className="flex min-h-11 items-center gap-2.5 rounded-lg tracking-tight text-foreground hover:text-text-muted focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
				>
					<LogoMark className="h-[18px]" />
					{SITE.name}
				</a>

				{/* ── Right cluster: nav (desktop) + theme toggle + command menu ── */}
				<div className="flex items-center gap-4 sm:gap-6">
					<nav aria-label="Main navigation" className="hidden sm:flex items-center gap-6">
						{NAV_LINKS.map(({ label, href }) => {
							const isHash = href.startsWith("#");
							const isActive = isHash
								? isHome && activeSection === href.slice(1)
								: pathname === href;
							const resolvedHref = resolveHref(href);

							return (
								<a
									key={href}
									href={resolvedHref}
									onClick={(e) => handleClick(e, href)}
									aria-current={isActive ? "page" : undefined}
									className={cn(
										"rounded-lg py-1 transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]",
										isActive
											? textRole.default
											: "text-text-faint hover:text-foreground",
									)}
								>
									{label}
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
