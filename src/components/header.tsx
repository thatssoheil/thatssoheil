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
import { Link, Surface, textRole } from "@/components/ui";

/** Static Kumo surface navigation; section links remain keyboard and touch friendly. */
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
				layer="elevated"
				className="pointer-events-auto mx-auto flex min-h-14 w-full max-w-4xl items-center justify-between rounded-lg px-4 font-sans text-sm shadow-xs ring ring-kumo-line sm:px-5"
			>
				<Link
					variant="plain"
					href={isHome ? "#hero" : "/"}
					onClick={(e) => {
						if (isHome) handleClick(e, "#hero");
					}}
					aria-label={`${SITE.name}, home`}
					className="flex min-h-11 items-center gap-2.5 rounded-lg font-medium"
				>
					<LogoMark className="h-[18px]" />
					{SITE.name}
				</Link>

				<div className="flex items-center gap-4 sm:gap-6">
					<nav aria-label="Main navigation" className="hidden items-center gap-6 sm:flex">
						{NAV_LINKS.map(({ label, href }) => {
							const isHash = href.startsWith("#");
							const isActive = isHash
								? isHome && activeSection === href.slice(1)
								: pathname === href;
							return (
								<Link
									key={href}
									variant="plain"
									href={resolveHref(href)}
									onClick={(e) => handleClick(e, href)}
									aria-current={isActive ? "page" : undefined}
									className={cn(
										"rounded-lg py-1",
										isActive ? textRole.default : "opacity-70",
									)}
								>
									{label}
								</Link>
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
