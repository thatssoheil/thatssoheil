"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

type ThemeName = "light" | "dark";
type ThemeOverride = {
	theme: ThemeName;
	expiresAt: number;
};

type ThemeContextValue = {
	theme: ThemeName;
	overrideExpiresAt: number | null;
	setSessionTheme: (theme: ThemeName) => void;
	toggleSessionTheme: () => void;
};

const THEME_OVERRIDE_KEY = "thatssoheil-theme-override";
const THEME_OVERRIDE_TTL_MS = 24 * 60 * 60 * 1000;
const THEME_SYNC_INTERVAL_MS = 60 * 1000;
const DAY_START_HOUR = 7;
const NIGHT_START_HOUR = 18;

const ThemeContext = createContext<ThemeContextValue | null>(null);

function removeThemeOverride() {
	try {
		window.localStorage.removeItem(THEME_OVERRIDE_KEY);
	} catch {}
}

function isThemeName(value: unknown): value is ThemeName {
	return value === "light" || value === "dark";
}

function getScheduledTheme(date = new Date()): ThemeName {
	const hour = date.getHours();

	return hour >= DAY_START_HOUR && hour < NIGHT_START_HOUR ? "light" : "dark";
}

function readThemeOverride(): ThemeOverride | null {
	if (typeof window === "undefined") return null;

	try {
		const rawOverride = window.localStorage.getItem(THEME_OVERRIDE_KEY);
		if (!rawOverride) return null;

		const override = JSON.parse(rawOverride) as Partial<ThemeOverride>;
		if (!isThemeName(override.theme) || typeof override.expiresAt !== "number") {
			removeThemeOverride();
			return null;
		}

		if (override.expiresAt <= Date.now()) {
			removeThemeOverride();
			return null;
		}

		return {
			theme: override.theme,
			expiresAt: override.expiresAt,
		};
	} catch {
		removeThemeOverride();
		return null;
	}
}

function getActiveTheme() {
	return readThemeOverride()?.theme ?? getScheduledTheme();
}

function disableThemeTransitions() {
	const style = document.createElement("style");
	style.appendChild(
		document.createTextNode(
			"*,*::before,*::after{transition:none!important}",
		),
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
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setTheme] = useState<ThemeName>(() =>
		typeof window === "undefined" ? "dark" : getActiveTheme(),
	);
	const [overrideExpiresAt, setOverrideExpiresAt] = useState<number | null>(() =>
		typeof window === "undefined" ? null : readThemeOverride()?.expiresAt ?? null,
	);

	const syncTheme = useCallback((disableTransitions = false) => {
		const override = readThemeOverride();
		const nextTheme = override?.theme ?? getScheduledTheme();

		setTheme(nextTheme);
		setOverrideExpiresAt(override?.expiresAt ?? null);
		applyDocumentTheme(nextTheme, disableTransitions);
	}, []);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => syncTheme(), 0);
		const intervalId = window.setInterval(syncTheme, THEME_SYNC_INTERVAL_MS);
		const handleStorage = (event: StorageEvent) => {
			if (event.key === THEME_OVERRIDE_KEY) {
				syncTheme(true);
			}
		};

		window.addEventListener("storage", handleStorage);

		return () => {
			window.clearTimeout(timeoutId);
			window.clearInterval(intervalId);
			window.removeEventListener("storage", handleStorage);
		};
	}, [syncTheme]);

	const setSessionTheme = useCallback((nextTheme: ThemeName) => {
		const override = {
			theme: nextTheme,
			expiresAt: Date.now() + THEME_OVERRIDE_TTL_MS,
		};

		try {
			window.localStorage.setItem(THEME_OVERRIDE_KEY, JSON.stringify(override));
		} catch {}

		setTheme(nextTheme);
		setOverrideExpiresAt(override.expiresAt);
		applyDocumentTheme(nextTheme, true);
	}, []);

	const toggleSessionTheme = useCallback(() => {
		setSessionTheme(theme === "dark" ? "light" : "dark");
	}, [setSessionTheme, theme]);

	const value = useMemo(
		() => ({
			theme,
			overrideExpiresAt,
			setSessionTheme,
			toggleSessionTheme,
		}),
		[overrideExpiresAt, setSessionTheme, theme, toggleSessionTheme],
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
