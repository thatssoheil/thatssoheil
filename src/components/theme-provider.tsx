"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

type ThemeName = "light" | "dark";
type ThemeOverride = {
	theme: ThemeName;
};

type ThemeContextValue = {
	theme: ThemeName;
	setSessionTheme: (theme: ThemeName) => void;
	toggleSessionTheme: () => void;
};

const THEME_OVERRIDE_KEY = "thatssoheil-theme-override";
const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

const ThemeContext = createContext<ThemeContextValue | null>(null);
const useIsomorphicLayoutEffect =
	typeof window === "undefined" ? useEffect : useLayoutEffect;

function removeThemeOverride() {
	try {
		window.localStorage.removeItem(THEME_OVERRIDE_KEY);
	} catch {}
}

function isThemeName(value: unknown): value is ThemeName {
	return value === "light" || value === "dark";
}

function getSystemTheme(): ThemeName {
	return window.matchMedia(SYSTEM_THEME_QUERY).matches ? "dark" : "light";
}

function readThemeOverride(): ThemeOverride | null {
	if (typeof window === "undefined") return null;

	try {
		const rawOverride = window.localStorage.getItem(THEME_OVERRIDE_KEY);
		if (!rawOverride) return null;

		const override = JSON.parse(rawOverride) as Partial<ThemeOverride>;
		if (!isThemeName(override.theme)) {
			removeThemeOverride();
			return null;
		}

		// Ignore legacy expiresAt fields so manual choices made before this release
		// remain valid under the persistent-override contract.
		return { theme: override.theme };
	} catch {
		removeThemeOverride();
		return null;
	}
}

function disableThemeTransitions() {
	const style = document.createElement("style");
	style.appendChild(
		document.createTextNode("*,*::before,*::after{transition:none!important}"),
	);
	document.head.appendChild(style);

	window.getComputedStyle(document.body);
	window.setTimeout(() => {
		document.head.removeChild(style);
	}, 1);
}

function applyDocumentTheme(theme: ThemeName, disableTransitions = false) {
	if (typeof document === "undefined") return;

	if (disableTransitions) {
		disableThemeTransitions();
	}

	const root = document.documentElement;
	root.setAttribute("data-mode", theme);
	// Keep the legacy class until the old styling system is removed in R2.
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	// Match the server render, then resolve the bootstrapped system/override mode
	// in a layout effect before paint to avoid theme-dependent hydration drift.
	const [theme, setTheme] = useState<ThemeName>("light");

	useIsomorphicLayoutEffect(() => {
		const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
		const syncTheme = (disableTransitions = false) => {
			const nextTheme = readThemeOverride()?.theme ?? getSystemTheme();
			setTheme(nextTheme);
			applyDocumentTheme(nextTheme, disableTransitions);
		};

		syncTheme();

		const handleStorage = (event: StorageEvent) => {
			if (event.key === THEME_OVERRIDE_KEY || event.key === null) {
				syncTheme(true);
			}
		};
		const handleSystemPreferenceChange = () => {
			if (!readThemeOverride()) syncTheme();
		};

		window.addEventListener("storage", handleStorage);
		mediaQuery.addEventListener("change", handleSystemPreferenceChange);

		return () => {
			window.removeEventListener("storage", handleStorage);
			mediaQuery.removeEventListener("change", handleSystemPreferenceChange);
		};
	}, []);

	const setSessionTheme = useCallback((nextTheme: ThemeName) => {
		try {
			window.localStorage.setItem(
				THEME_OVERRIDE_KEY,
				JSON.stringify({ theme: nextTheme }),
			);
		} catch {}

		setTheme(nextTheme);
		applyDocumentTheme(nextTheme, true);
	}, []);

	const toggleSessionTheme = useCallback(() => {
		setSessionTheme(theme === "dark" ? "light" : "dark");
	}, [setSessionTheme, theme]);

	const value = useMemo(
		() => ({ theme, setSessionTheme, toggleSessionTheme }),
		[setSessionTheme, theme, toggleSessionTheme],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useLocalTheme() {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useLocalTheme must be used inside ThemeProvider");
	}

	return context;
}
