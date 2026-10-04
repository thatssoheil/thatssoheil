// ─── Playground formatting helpers ───
// Compact, consistent number formatting for the data surfaces. All functions
// are pure and safe for server rendering.

export function formatUsdCompact(value: number): string {
	if (!Number.isFinite(value)) return "-";
	const abs = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`;
	if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
	if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
	if (abs >= 1) return `${sign}$${abs.toFixed(2)}`;
	return `${sign}$${abs.toFixed(4)}`;
}

export function formatNumberCompact(value: number): string {
	if (!Number.isFinite(value)) return "-";
	const abs = Math.abs(value);
	const sign = value < 0 ? "-" : "";
	if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B`;
	if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`;
	if (abs >= 1e4) return `${sign}${(abs / 1e3).toFixed(0)}K`;
	if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K`;
	return `${sign}${abs.toFixed(0)}`;
}

export function formatPrice(value: number): string {
	if (!Number.isFinite(value) || value === 0) return "-";
	if (value >= 1000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
	if (value >= 1) return `$${value.toFixed(2)}`;
	return `$${value.toFixed(4)}`;
}

export function formatPct(value: number, digits = 1): string {
	if (!Number.isFinite(value)) return "-";
	const sign = value > 0 ? "+" : "";
	return `${sign}${value.toFixed(digits)}%`;
}

export function formatDateLong(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export function formatDateShort(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export function formatDateTimeUtc(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	const formatted = new Intl.DateTimeFormat("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "UTC",
	}).format(date);
	return `${formatted} UTC`;
}
