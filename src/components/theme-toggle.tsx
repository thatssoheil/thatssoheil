"use client";

import { Sun, Moon } from "lucide-react";
import { useLocalTheme } from "@/components/theme-provider";

export function ThemeToggle() {
	const { theme, toggleSessionTheme } = useLocalTheme();

	return (
		<button
			type="button"
			onClick={toggleSessionTheme}
			aria-label="Toggle light and dark theme"
			aria-pressed={theme === "dark"}
			className="inline-flex size-11 sm:size-8 items-center justify-center rounded-xl border border-alpha-300 text-text-faint hover:text-foreground hover:border-alpha-500 hover:bg-alpha-100 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
		>
			{theme === "dark" ? (
				<Sun className="size-4" strokeWidth={1.5} aria-hidden="true" />
			) : (
				<Moon className="size-4" strokeWidth={1.5} aria-hidden="true" />
			)}
		</button>
	);
}
