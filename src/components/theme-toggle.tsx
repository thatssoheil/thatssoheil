"use client";

import { Moon, Sun } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui";
import { useLocalTheme } from "@/components/theme-provider";

export function ThemeToggle() {
	const { theme, toggleSessionTheme } = useLocalTheme();

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-sm"
			onClick={toggleSessionTheme}
			aria-label="Toggle light and dark theme"
			aria-pressed={theme === "dark"}
			className="size-11 sm:size-9"
		>
			{theme === "dark" ? (
				<Sun className="size-4" weight="regular" aria-hidden="true" />
			) : (
				<Moon className="size-4" weight="regular" aria-hidden="true" />
			)}
		</Button>
	);
}
