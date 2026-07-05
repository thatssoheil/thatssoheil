"use client";

import { Sun, Moon } from "lucide-react";
import { useLocalTheme } from "@/components/theme-provider";

export function ThemeToggle() {
	const { toggleSessionTheme } = useLocalTheme();

	return (
		<button
			type="button"
			onClick={toggleSessionTheme}
			aria-label="Toggle light and dark theme"
			className="inline-flex size-11 sm:size-8 items-center justify-center rounded-xl border border-alpha-300 text-text-faint hover:text-foreground hover:border-alpha-500 hover:bg-alpha-100 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
		>
			{/* Icons swap via the `.dark` class, which is set before paint in layout.tsx. */}
			<Sun className="hidden size-4 dark:block" strokeWidth={1.5} aria-hidden="true" />
			<Moon className="block size-4 dark:hidden" strokeWidth={1.5} aria-hidden="true" />
		</button>
	);
}
