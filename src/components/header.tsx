"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
	const [navOpen, setNavOpen] = useState(false);

	useEffect(() => {
		if (!navOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setNavOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [navOpen]);

	// Close the overlay when a nav link jumps (pathname/activeSection change).
	const lastNav = useRef(false);
	const handleNavClick = useCallback(() => {
		lastNav.current = true;
		setNavOpen(false);
	}, []);
	useEffect(() => {
		if (lastNav.current) lastNav.current = false;
	}, [pathname, activeSection]);

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
			if (!href.startsWith("#") || !isHome) return;
			e.preventDefault();
			setNavOpen(false);
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

					{/* Mobile nav trigger — morphing hamburger → ✕ */}
					<button
						type="button"
						onClick={() => setNavOpen((o) => !o)}
						aria-label="Toggle navigation"
						aria-expanded={navOpen}
						className="sm:hidden inline-flex size-11 -mr-2 items-center justify-center rounded-xl text-text-faint hover:bg-alpha-100 hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
					>
						<span className="relative block h-3.5 w-5" aria-hidden="true">
							<span
								className={cn(
									"absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[var(--ease-swift)]",
									navOpen && "translate-y-[0.625rem] rotate-45",
								)}
							/>
							<span
								className={cn(
									"absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200",
									navOpen && "opacity-0",
								)}
							/>
							<span
								className={cn(
									"absolute left-0 bottom-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-[var(--ease-swift)]",
									navOpen && "-translate-y-[0.625rem] -rotate-45",
								)}
							/>
						</span>
					</button>

					<div className="flex items-center gap-2">
						<ThemeToggle />
						<CommandMenu />
					</div>
				</div>
			</Surface>

			{/* Mobile full-screen glass overlay with staggered link reveal */}
			<div
				className={cn(
					"fixed inset-0 -z-10 flex flex-col items-center justify-center gap-2 px-8 backdrop-blur-2xl transition-opacity duration-300 ease-[var(--ease-swift)]",
					navOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
				)}
				style={{
					backgroundColor: "color-mix(in oklch, var(--background) 82%, transparent)",
				}}
			>
				<nav
					aria-label="Mobile navigation"
					className="flex flex-col items-center gap-6 font-sans text-2xl font-light tracking-tight"
				>
					{NAV_LINKS.map(({ label, href }, i) => (
						<a
							key={href}
							href={resolveHref(href)}
							onClick={(e) => {
								handleNavClick();
								handleClick(e, href);
							}}
							className={cn(
								"text-foreground transition-all duration-500 ease-[var(--ease-swift)] hover:text-brand focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]",
								navOpen
									? "translate-y-0 opacity-100"
									: "translate-y-12 opacity-0",
							)}
							style={{ transitionDelay: navOpen ? `${120 + i * 70}ms` : "0ms" }}
						>
							{label}
						</a>
					))}
				</nav>
			</div>
		</header>
	);
}
