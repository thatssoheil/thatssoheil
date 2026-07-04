import type { Metadata } from "next";
import {
	Terminal,
	Command as CommandIcon,
	ArrowUpRight,
	Mail,
	Hash,
	Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { TokenValue } from "@/components/ds/token-value";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Design System — Soheil Fakour",
	description: "The living design system: color, type, motion, surface.",
	robots: { index: false, follow: false },
};

// ─── Token data (mirrors globals.css; swatches render from the live CSS vars) ───

const INK = [
	{ name: "ink-950", role: "background" },
	{ name: "ink-900", role: "card · popover" },
	{ name: "ink-850", role: "secondary · muted" },
	{ name: "ink-800", role: "accent (hover)" },
	{ name: "ink-700", role: "—" },
	{ name: "ink-600", role: "—" },
	{ name: "ink-500", role: "—" },
	{ name: "ink-400", role: "muted-foreground" },
	{ name: "ink-300", role: "—" },
	{ name: "ink-200", role: "—" },
	{ name: "ink-100", role: "—" },
	{ name: "ink-50", role: "foreground" },
] as const;

const SIGNAL = [
	{ name: "signal-200", role: "—" },
	{ name: "signal-300", role: "—" },
	{ name: "signal-400", role: "brand text (dark)" },
	{ name: "signal-500", role: "primary · ring · fills" },
	{ name: "signal-600", role: "—" },
	{ name: "signal-700", role: "brand text (light)" },
] as const;

const SEMANTIC = [
	{ token: "background", role: "Page surface", fg: "foreground" },
	{ token: "card", role: "Cards, header, popover", fg: "card-foreground" },
	{ token: "secondary", role: "Subtle filled surface", fg: "secondary-foreground" },
	{ token: "muted", role: "Muted surface", fg: "muted-foreground" },
	{ token: "accent", role: "Hover surface", fg: "accent-foreground" },
	{ token: "primary", role: "CTA · key accent", fg: "primary-foreground" },
	{ token: "destructive", role: "Danger", fg: "destructive-foreground" },
] as const;

const TYPE_SCALE = [
	{ label: "Display / Hero", cls: "text-6xl sm:text-7xl font-bold font-mono", note: "Geist Mono · bold — cipher hero only" },
	{ label: "H1", cls: "text-5xl font-light font-sans", note: "Lexend · weight 300" },
	{ label: "H2 — section heading", cls: "text-4xl font-light font-sans", note: "Lexend · weight 300" },
	{ label: "H3", cls: "text-2xl font-light font-sans", note: "Lexend · weight 300" },
	{ label: "Body", cls: "text-base font-normal font-sans", note: "Lexend · weight 400" },
	{ label: "Small / caption", cls: "text-sm font-normal font-sans", note: "Lexend" },
] as const;

// Geist's composite ramps (family+size+LH+weight+tracking in one class), retuned
// to the brand: headings keep weight 300 (Geist uses 600). Source: vercel.com/design.md
const TYPE_RAMPS = [
	{ cls: "text-heading-48", label: "heading-48", note: "48 / 56 · -0.06em · w300" },
	{ cls: "text-heading-32", label: "heading-32", note: "32 / 40 · -0.04em · w300" },
	{ cls: "text-heading-24", label: "heading-24", note: "24 / 32 · -0.04em · w300" },
	{ cls: "text-heading-20", label: "heading-20", note: "20 / 26 · -0.02em · w300" },
	{ cls: "text-copy-18", label: "copy-18", note: "18 / 28 · w400 — prose" },
	{ cls: "text-copy-16", label: "copy-16", note: "16 / 24 · w400 — body" },
	{ cls: "text-label-14", label: "label-14", note: "14 / 20 · w400 — UI label" },
	{ cls: "text-button-14", label: "button-14", note: "14 / 20 · w500 — controls" },
	{ cls: "text-label-13-mono", label: "label-13-mono", note: "13 / 16 · Geist Mono" },
] as const;

const FLUID = [
	{ name: "text-fluid-20-24", range: "20 → 24px" },
	{ name: "text-fluid-24-32", range: "24 → 32px" },
	{ name: "text-fluid-32-48", range: "32 → 48px" },
	{ name: "text-fluid-36-48", range: "36 → 48px — manifesto" },
	{ name: "text-fluid-36-60", range: "36 → 60px — connect" },
	{ name: "text-fluid-48-72", range: "48 → 72px" },
] as const;

const ALPHA = [
	{ name: "alpha-100", role: "—" },
	{ name: "alpha-200", role: "border · dark" },
	{ name: "alpha-300", role: "border · light + hairline" },
	{ name: "alpha-400", role: "input" },
	{ name: "alpha-500", role: "—" },
	{ name: "alpha-600", role: "strong edge" },
] as const;

const LAYOUT = [
	{ name: "Content width", value: "64rem wide · 48rem prose (max-w-5xl / max-w-3xl)" },
	{ name: "Section height", value: "full viewport — min-h-[100dvh] (80dvh for lighter sections)" },
	{ name: "Section padding", value: "6rem vertical (py-24)" },
	{ name: "Gutter", value: "1.5rem → 4rem (px-6 · sm:8 · md:12 · lg:16)" },
] as const;

const RADIUS = [
	{ name: "rounded-sm", cls: "rounded-sm", note: "≈ 6px" },
	{ name: "rounded-md", cls: "rounded-md", note: "≈ 8px" },
	{ name: "rounded-lg", cls: "rounded-lg", note: "10px (base --radius)" },
	{ name: "rounded-xl", cls: "rounded-xl", note: "≈ 14px — cards" },
] as const;

const BORDERS = [
	{
		name: "--border",
		light: "oklch(0 0 0 / 10%)",
		dark: "oklch(1 0 0 / 7%)",
		role: "separators, card edges",
	},
	{
		name: "--input",
		light: "oklch(0 0 0 / 14%)",
		dark: "oklch(1 0 0 / 12%)",
		role: "inputs, stronger edges",
	},
] as const;

const Z_INDEX = [
	{ name: "--z-sticky", value: "20", use: "in-page sticky bars (this nav)" },
	{ name: "--z-header", value: "50", use: "fixed site header" },
	{ name: "--z-progress", value: "60", use: "scroll-progress bar" },
	{ name: "--z-overlay", value: "100", use: "modal backdrop · skip link" },
	{ name: "--z-modal", value: "110", use: "modal content" },
] as const;

const SPACING = [
	{ name: "1", rem: "0.25rem" },
	{ name: "2", rem: "0.5rem" },
	{ name: "4", rem: "1rem" },
	{ name: "6", rem: "1.5rem" },
	{ name: "8", rem: "2rem" },
	{ name: "12", rem: "3rem" },
	{ name: "16", rem: "4rem" },
	{ name: "24", rem: "6rem" },
] as const;

const MOTION_EASE = [
	{ name: "--ease-signature", value: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", use: "everything entrance-y" },
	{ name: "--ease-snap", value: "cubic-bezier(0.4, 0, 0.2, 1)", use: "UI state changes" },
	{ name: "--ease-swift", value: "cubic-bezier(0.175, 0.885, 0.32, 1.1)", use: "popover / menu overshoot (Geist)" },
] as const;

const MOTION_DUR = [
	{ name: "--dur-micro", value: "150ms", use: "hover, focus, kbd" },
	{ name: "--dur-ui", value: "300ms", use: "component state" },
	{ name: "--dur-page", value: "500ms", use: "section reveals" },
	{ name: "--dur-grand", value: "800ms", use: "hero entrance" },
] as const;

const SHADOWS = [
	{ name: "--shadow-border", use: "1px hairline — border-first (Geist)" },
	{ name: "--shadow-soft", use: "resting elevated surface" },
	{ name: "--shadow-elevated", use: "raised / floating" },
	{ name: "--shadow-glow", use: "accent (blue) hover halo" },
] as const;

const ICONS = [Terminal, CommandIcon, ArrowUpRight, Mail, Hash, Search] as const;

const NAV = [
	{ id: "color", label: "Color" },
	{ id: "type", label: "Type" },
	{ id: "space", label: "Space" },
	{ id: "motion", label: "Motion" },
	{ id: "surface", label: "Surface" },
	{ id: "glass", label: "Glass" },
	{ id: "components", label: "Components" },
	{ id: "voice", label: "Voice" },
] as const;

// ─── Local building blocks ───

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="font-sans text-xs tracking-[0.2em] uppercase text-brand">
			{children}
		</p>
	);
}

function Block({
	id,
	label,
	title,
	children,
}: {
	id?: string;
	label: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section
			id={id}
			className="grid gap-8 border-t border-alpha-300 pt-12 scroll-mt-20 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-12"
		>
			<div className="flex flex-col gap-3 md:sticky md:top-24 md:self-start">
				<SectionLabel>{label}</SectionLabel>
				<h2 className="text-heading-32 text-foreground">
					{title}
				</h2>
			</div>
			<div className="flex min-w-0 flex-col gap-8">{children}</div>
		</section>
	);
}

function Pane({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-2xl border border-alpha-300 bg-card/70 p-5 shadow-[var(--shadow-border)]",
				"before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(var(--alpha-200)_1px,transparent_1px),linear-gradient(90deg,var(--alpha-200)_1px,transparent_1px)] before:bg-[size:24px_24px] before:opacity-40",
				className,
			)}
		>
			<div className="relative">{children}</div>
		</div>
	);
}

function Swatch({ name, role }: { name: string; role?: string }) {
	return (
		<div className="flex flex-col gap-2">
			<div
				className="h-14 w-full rounded-lg border border-border"
				style={{ background: `var(--${name})` }}
			/>
			<div className="flex flex-col gap-0.5">
				<span className="font-mono text-xs text-foreground/90">{name}</span>
				{role && role !== "—" && (
					<span className="font-mono text-[10px] text-foreground/40">{role}</span>
				)}
				<TokenValue name={name} />
			</div>
		</div>
	);
}

// ─── Page ───

export default function DesignSystemPage() {
	return (
		<main className="min-h-dvh bg-background text-foreground">
			{/* ── Sticky in-page nav ── */}
			<nav className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background/80 backdrop-blur-md">
				<div className="mx-auto flex w-full max-w-5xl items-center gap-5 overflow-x-auto px-6 py-3 font-mono text-xs sm:px-8 md:px-12">
					<span className="text-foreground/90 whitespace-nowrap">/ds</span>
					<span className="text-border">·</span>
					{NAV.map((n) => (
						<a
							key={n.id}
							href={`#${n.id}`}
							className="flex items-center self-stretch px-2 text-muted-foreground transition-colors hover:text-brand whitespace-nowrap"
						>
							{n.label}
						</a>
					))}
					<div className="ml-auto pl-4 shrink-0">
						<ThemeToggle />
					</div>
				</div>
			</nav>

			<div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-20 sm:px-8 md:px-12">
				{/* ── Masthead ── */}
				<header className="grid gap-8 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-12">
					<div className="pt-1">
						<SectionLabel>Design System</SectionLabel>
					</div>
					<Pane className="p-7 sm:p-9">
						<h1 className="max-w-3xl text-heading-56 text-foreground sm:text-heading-64">
							Neutral black, electric signal.
						</h1>
						<p className="mt-5 max-w-2xl text-copy-18 text-text-muted">
							The single source of truth for color, type, motion, and surface. Two
							themes ship — neutral black (default) and neutral paper — sharing one
							electric accent (iMessage blue), used sparingly. Toggle them top-right.
							Pure white and pure black are both off the table.
						</p>
					</Pane>
				</header>

				{/* ── Ink ramp ── */}
				<Block id="color" label="Color" title="Ink — neutral shades of black">
					<Pane>
						<div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
							{INK.map((c) => (
								<Swatch key={c.name} name={c.name} role={c.role} />
							))}
						</div>
					</Pane>
					<p className="max-w-2xl text-sm font-light text-foreground/45">
						Chroma is <code className="text-brand">0</code> across the ramp — no hue
						tint at all. Roles shown are the <strong className="font-normal text-foreground/70">dark</strong>{" "}
						mapping; in light mode the semantic tokens invert (background ≈ ink-50,
						foreground ≈ ink-900). Never <code className="text-brand">#000</code> or{" "}
						<code className="text-brand">#fff</code>.
					</p>
				</Block>

				{/* ── Signal ramp ── */}
				<Block label="Color" title="Signal — the accent (iMessage blue)">
					<Pane>
						<div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
							{SIGNAL.map((c) => (
								<Swatch key={c.name} name={c.name} role={c.role} />
							))}
						</div>
					</Pane>
					<p className="max-w-2xl text-sm font-light text-foreground/45">
						<strong className="font-normal text-foreground/70">Fills</strong> (CTA,
						focus ring, glow) use <code className="text-brand">signal-500</code> via{" "}
						<code className="text-brand">primary</code> / <code className="text-brand">ring</code>.{" "}
						<strong className="font-normal text-foreground/70">Text</strong> uses{" "}
						<code className="text-brand">text-brand</code>, which resolves to a
						legible per-theme step (signal-700 on light, signal-400 on dark) so it
						clears WCAG AA. The ramp name is generic (
						<code className="text-brand">--signal-*</code>) — swap the six values to
						retheme everything. Never fill a large surface with it.
					</p>
				</Block>

				{/* ── Semantic tokens ── */}
				<Block label="Color" title="Semantic tokens">
					<Pane>
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							{SEMANTIC.map((s) => (
								<div
									key={s.token}
									className="flex items-center justify-between rounded-xl border border-alpha-300 p-4"
									style={{ background: `var(--${s.token})` }}
								>
									<span className="font-mono text-sm" style={{ color: `var(--${s.fg})` }}>
										--{s.token}
									</span>
									<span
										className="font-mono text-[10px] opacity-70"
										style={{ color: `var(--${s.fg})` }}
									>
										{s.role}
									</span>
								</div>
							))}
						</div>
					</Pane>
				</Block>

				{/* ── Typography ── */}
				<Block id="type" label="Type" title="Lexend + Geist Mono">
					<Pane className="p-6">
					<div className="flex flex-col gap-8">
						{TYPE_SCALE.map((t) => (
							<div
								key={t.label}
								className="flex flex-col gap-2 border-b border-alpha-300 pb-6 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
							>
								<span className={`${t.cls} tracking-tight`}>{t.label}</span>
								<span className="shrink-0 font-mono text-[10px] text-foreground/40">
									{t.note}
								</span>
							</div>
						))}
						<div className="flex flex-col gap-2">
							<SectionLabel>Section eyebrow</SectionLabel>
							<span className="font-mono text-[10px] text-foreground/40">
								Lexend · uppercase · tracking-[0.2em] · text-brand (eyebrow register)
							</span>
						</div>
					</div>
					</Pane>

					{/* Composite ramps — Geist's named type system, brand weights */}
					<div className="flex flex-col gap-5 border-t border-border/60 pt-10">
						<SectionLabel>Composite ramps</SectionLabel>
						<p className="max-w-2xl text-sm font-light text-foreground/45">
							Geist&rsquo;s four named ramps —{" "}
							<code className="text-brand">text-heading/copy/label/button-*</code> — each set
							family + size + line-height + weight + tracking in one class. One brand deviation:
							headings keep our{" "}
							<strong className="font-normal text-foreground/70">weight 300</strong> (Geist sets
							600). Tracking law preserved: ≤20px → -0.02em, 24–32 → -0.04em, ≥40 → -0.06em.
						</p>
						<div className="flex flex-col gap-4">
							{TYPE_RAMPS.map((t) => (
								<div
									key={t.label}
									className="flex flex-col gap-1 border-b border-border/40 pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
								>
									<span className={t.cls}>{t.label}</span>
									<span className="shrink-0 font-mono text-[10px] text-foreground/40">
										{t.note}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Fluid type — clamp() ramps */}
					<div className="flex flex-col gap-5 border-t border-border/60 pt-10">
						<SectionLabel>Fluid type</SectionLabel>
						<p className="max-w-2xl text-sm font-light text-foreground/45">
							<code className="text-brand">text-fluid-*</code> tokens interpolate between a 360px
							and 1280px viewport, so headings scale with the page instead of stepping at
							breakpoints. Resize the window to watch them move.
						</p>
						<div className="flex flex-col gap-3">
							{FLUID.map((f) => (
								<div
									key={f.name}
									className="flex items-baseline justify-between gap-8 border-b border-border/40 pb-3"
								>
									<span className={`${f.name} font-light tracking-tight text-foreground/90`}>
										Aa
									</span>
									<span className="shrink-0 text-right font-mono text-[10px] text-foreground/40">
										<code className="text-foreground/70">{f.name}</code>
										<br />
										{f.range}
									</span>
								</div>
							))}
						</div>
					</div>
				</Block>

				{/* ── Space: layout, radius, borders, spacing, z-index, focus ── */}
				<Block id="space" label="Space" title="Layout, spacing, radius & stacking">
					{/* Layout scale */}
					<Pane>
					<div className="flex flex-col gap-3">
						{LAYOUT.map((l) => (
							<div key={l.name} className="flex items-baseline justify-between gap-4 border-b border-alpha-300 pb-3 last:border-b-0 last:pb-0">
								<span className="text-sm text-foreground/80">{l.name}</span>
								<span className="font-mono text-xs text-foreground/50">{l.value}</span>
							</div>
						))}
					</div>
					</Pane>

					{/* Radius */}
					<Pane>
						<div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
							{RADIUS.map((r) => (
								<div key={r.name} className="flex flex-col gap-2">
									<div className={`h-16 w-full border border-alpha-300 bg-card ${r.cls}`} />
									<span className="font-mono text-xs text-foreground/90">{r.name}</span>
									<span className="font-mono text-[10px] text-foreground/40">{r.note}</span>
								</div>
							))}
						</div>
					</Pane>

					{/* Alpha ramp — translucent neutrals, border-first hairlines */}
					<div className="flex flex-col gap-3">
						<SectionLabel>Alpha ramp</SectionLabel>
						<p className="max-w-2xl text-sm font-light text-foreground/45">
							Translucent neutrals (Geist&rsquo;s gray-alpha) so a hairline reads identically over any
							surface. <code className="text-brand">--border</code> and{" "}
							<code className="text-brand">--input</code> source from this ramp; reach for{" "}
							<code className="text-brand">--shadow-border</code> when you want a 1px ring that
							takes no layout box. Shown over a checker to reveal the transparency.
						</p>
						<Pane>
							<div className="grid grid-cols-3 gap-x-5 gap-y-6 sm:grid-cols-6">
								{ALPHA.map((a) => (
									<div key={a.name} className="flex flex-col gap-2">
										<div
											className="h-14 w-full overflow-hidden rounded-xl border border-alpha-300"
											style={{
												backgroundImage:
													"repeating-conic-gradient(var(--muted) 0 25%, transparent 0 50%)",
												backgroundSize: "14px 14px",
											}}
										>
											<div
												className="h-full w-full"
												style={{ background: `var(--${a.name})` }}
											/>
										</div>
										<span className="font-mono text-xs text-foreground/90">{a.name}</span>
										{a.role !== "—" && (
											<span className="font-mono text-[10px] text-foreground/40">{a.role}</span>
										)}
									</div>
								))}
							</div>
						</Pane>
					</div>

					{/* Borders — live per-theme; values shown for both themes */}
					<Pane>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{BORDERS.map((b) => (
								<div
									key={b.name}
									className="rounded-xl bg-card/70 p-4"
									style={{ border: `1px solid var(${b.name})` }}
								>
									<span className="font-mono text-xs text-foreground/90">{b.name}</span>
									<p className="mt-1 font-mono text-[10px] text-foreground/40">
										light <span className="text-foreground/60">{b.light}</span> · dark{" "}
										<span className="text-foreground/60">{b.dark}</span>
									</p>
									<p className="mt-0.5 font-mono text-[10px] text-foreground/40">{b.role}</p>
								</div>
							))}
						</div>
					</Pane>

					{/* Spacing scale */}
					<div className="flex flex-col gap-3">
						<SectionLabel>Spacing scale</SectionLabel>
						<p className="text-sm font-light text-foreground/45">
							The <code className="text-brand">--spacing-*</code> ramp (0.25rem base
							step). Common steps shown; full scale runs to{" "}
							<code className="text-brand">96</code> (24rem).
						</p>
						<div className="flex flex-col gap-2">
							{SPACING.map((s) => (
								<div key={s.name} className="flex items-center gap-4">
									<span className="w-6 shrink-0 font-mono text-xs text-foreground/90">
										{s.name}
									</span>
									<div
										className="h-3 rounded-sm bg-brand/60"
										style={{ width: `var(--spacing-${s.name})` }}
									/>
									<span className="font-mono text-[10px] text-foreground/40">{s.rem}</span>
								</div>
							))}
						</div>
					</div>

					{/* Z-index scale */}
					<div className="flex flex-col gap-3">
						<SectionLabel>Z-index scale</SectionLabel>
						<p className="text-sm font-light text-foreground/45">
							Stacking is deliberate — reach for{" "}
							<code className="text-brand">z-[var(--z-…)]</code>, never a raw number.
						</p>
						<div className="flex flex-col gap-3">
							{Z_INDEX.map((z) => (
								<div
									key={z.name}
									className="flex flex-col gap-1 border-b border-border/60 pb-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
								>
									<span className="font-mono text-sm text-foreground/90">{z.name}</span>
									<span className="font-mono text-xs text-foreground/50">{z.value}</span>
									<span className="font-mono text-[10px] text-foreground/40 sm:flex-1 sm:text-right">
										{z.use}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Focus ring */}
					<div className="flex flex-col gap-3">
						<SectionLabel>Focus ring</SectionLabel>
						<p className="text-sm font-light text-foreground/45">
							Tab through these — the two-layer ring (
							<code className="text-brand">--ring-focus</code>) is Geist&rsquo;s pattern: a 2px surface
							gap, then a 4px signal-accent ring. Used on every control.
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<button
								type="button"
								className="rounded-md border border-border px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
							>
								Focusable button
							</button>
							<input
								type="text"
								placeholder="Focusable input"
								className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:shadow-[var(--ring-focus)]"
							/>
						</div>
					</div>
				</Block>

				{/* ── Motion ── */}
				<Block id="motion" label="Motion" title="One easing family, four durations">
					<div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
						<div className="flex flex-col gap-3">
							{MOTION_EASE.map((e) => (
								<div key={e.name} className="flex flex-col gap-0.5">
									<span className="font-mono text-sm text-foreground/90">{e.name}</span>
									<span className="font-mono text-[10px] text-foreground/40">{e.value}</span>
									<span className="font-mono text-[10px] text-brand">{e.use}</span>
								</div>
							))}
						</div>
						<div className="flex flex-col gap-3">
							{MOTION_DUR.map((d) => (
								<div key={d.name} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
									<span className="font-mono text-sm text-foreground/90">{d.name}</span>
									<span className="font-mono text-xs text-foreground/50">{d.value}</span>
									<span className="font-mono text-[10px] text-foreground/40 sm:flex-1 sm:text-right">{d.use}</span>
								</div>
							))}
						</div>
					</div>
					<p className="max-w-2xl text-sm font-light text-foreground/45">
						Animation is <code className="text-brand">gsap</code> via{" "}
						<code className="text-brand">useGSAP</code> +{" "}
						<code className="text-brand">ScrollTrigger</code> (reveals through the{" "}
						<code className="text-brand">useReveal</code> hook). All animation
						collapses to a single fade under{" "}
						<code className="text-brand">prefers-reduced-motion</code>, wired via{" "}
						<code className="text-brand">gsap.matchMedia()</code>.
					</p>
				</Block>

				{/* ── Surface: shadows + gradients ── */}
				<Block id="surface" label="Surface" title="Shadows & gradients">
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
						{SHADOWS.map((s) => (
							<div key={s.name} className="flex flex-col gap-3">
								<div
									className="h-24 rounded-xl border border-border bg-card"
									style={{ boxShadow: `var(${s.name})` }}
								/>
								<span className="font-mono text-xs text-foreground/90">{s.name}</span>
								<span className="font-mono text-[10px] text-foreground/40">{s.use}</span>
							</div>
						))}
					</div>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div className="flex flex-col gap-3">
							<div className="h-32 rounded-xl border border-border" style={{ backgroundImage: "var(--gradient-hero)" }} />
							<span className="font-mono text-xs text-foreground/90">--gradient-hero</span>
						</div>
						<div className="flex flex-col gap-3">
							<div className="h-32 rounded-xl border border-border" style={{ backgroundImage: "var(--gradient-surface)" }} />
							<span className="font-mono text-xs text-foreground/90">--gradient-surface</span>
						</div>
					</div>
				</Block>

				{/* ── Glass: the Signal Glass material ── */}
				<Block id="glass" label="Glass" title="Glass — the Signal Glass material">
					{/* Live demo over a signal-tinted bed so the material reads on this solid page. */}
					<Pane className="p-8">
						<div
							aria-hidden="true"
							className="pointer-events-none absolute inset-0"
							style={{
								background:
									"radial-gradient(60% 80% at 25% 20%, var(--signal-500), transparent 70%), radial-gradient(50% 70% at 80% 80%, oklch(0.64 0.16 210), transparent 70%)",
								opacity: 0.5,
							}}
						/>
						<div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="glass glass-edge rounded-xl p-5">
								<p className="font-mono text-xs text-foreground/90">.glass · .glass-edge</p>
								<p className="mt-2 text-sm font-light text-foreground/70">
									Translucent chrome — bars, inputs, overlays. Refracts the field behind it.
								</p>
							</div>
							<div className="glass-panel glass-edge rounded-xl p-5">
								<p className="font-mono text-xs text-foreground/90">.glass-panel · .glass-edge</p>
								<p className="mt-2 text-sm font-light text-foreground/70">
									Near-solid backing for reading content — legible over the moving field.
								</p>
							</div>
						</div>
					</Pane>
					<p className="max-w-2xl text-sm font-light text-foreground/45">
						Glass is <strong className="font-normal text-foreground/70">solid by default</strong>{" "}
						and translucent only as a progressive enhancement — gated on{" "}
						<code className="text-brand">backdrop-filter</code> support and{" "}
						<code className="text-brand">prefers-reduced-transparency</code>, so it stays
						legible everywhere (Firefox keeps glass; an explicit reduce-transparency
						preference forces the solid fill). Compose{" "}
						<code className="text-brand">.glass</code> /{" "}
						<code className="text-brand">.glass-panel</code> with{" "}
						<code className="text-brand">.glass-edge</code> (rim + sheen + drop);{" "}
						<code className="text-brand">.glass-strong</code> deepens the blur for the chat
						takeover, where Chromium adds real{" "}
						<code className="text-brand">feDisplacementMap</code> refraction over the signal
						field. Tokens:{" "}
						<code className="text-brand">--glass-bg</code>,{" "}
						<code className="text-brand">--glass-bg-panel</code>,{" "}
						<code className="text-brand">--glass-bg-solid</code>,{" "}
						<code className="text-brand">--glass-blur</code>,{" "}
						<code className="text-brand">--glass-rim</code>,{" "}
						<code className="text-brand">--glass-sheen</code>,{" "}
						<code className="text-brand">--glass-shadow</code>.
					</p>
				</Block>

				{/* ── Components ── */}
				<Block id="components" label="Components" title="Primitives in context">
					<div className="flex flex-wrap items-center gap-4">
						<Button>Primary CTA</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="link">Link</Button>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<Badge>Default</Badge>
						<Badge variant="secondary">Secondary</Badge>
						<Badge variant="outline">Outline</Badge>
						<Badge variant="destructive">Destructive</Badge>
					</div>
					<Card className="max-w-sm gap-3 py-6 transition-all duration-300 hover:border-brand/30 hover:shadow-[var(--shadow-glow)]">
						<CardHeader>
							<CardTitle className="text-lg font-light tracking-tight">
								Card surface
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm font-light leading-relaxed text-foreground/55">
								The <code className="text-brand">{"<Card>"}</code> primitive on{" "}
								<code className="text-brand">bg-card</code> with a soft border. Hover
								lifts a blue glow — accent on interaction, not at rest.
							</p>
						</CardContent>
					</Card>

					{/* Separator */}
					<div className="flex flex-col gap-3 border-t border-border/60 pt-6">
						<SectionLabel>Separator</SectionLabel>
						<p className="text-sm font-light text-foreground/45">
							<code className="text-brand">{"<Separator>"}</code> — a 1px{" "}
							<code className="text-brand">bg-border</code> rule, horizontal or vertical.
						</p>
						<Separator />
						<div className="flex h-5 items-center gap-3 font-mono text-xs text-foreground/60">
							<span>Docs</span>
							<Separator orientation="vertical" />
							<span>API</span>
							<Separator orientation="vertical" />
							<span>Changelog</span>
						</div>
					</div>

					{/* Iconography */}
					<div className="flex flex-col gap-3 border-t border-border/60 pt-6">
						<SectionLabel>Iconography</SectionLabel>
						<p className="text-sm font-light text-foreground/45">
							<code className="text-brand">lucide-react</code>, stroke width{" "}
							<code className="text-brand">1.5</code>, sized in{" "}
							<code className="text-brand">em</code>/<code className="text-brand">size-*</code>.
							Muted by default; <code className="text-brand">text-brand</code> when active.
						</p>
						<div className="flex flex-wrap items-center gap-5 text-muted-foreground">
							{ICONS.map((Icon, i) => (
								<Icon key={i} className="size-5" strokeWidth={1.5} aria-hidden="true" />
							))}
						</div>
					</div>
				</Block>

				{/* ── Voice ── */}
				<Block id="voice" label="Voice" title="Plain, grounded, sharp">
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div className="flex flex-col gap-3 rounded-xl border border-border p-6">
							<span className="font-mono text-[10px] uppercase tracking-widest text-brand">Yes</span>
							<p className="text-sm font-light leading-relaxed text-foreground/70">
								&ldquo;I&rsquo;d rather show you the thing than argue about the thing.&rdquo;
							</p>
							<p className="text-sm font-light leading-relaxed text-foreground/70">
								&ldquo;I stopped chasing perfection a while ago — reality moves too fast for finished work.&rdquo;
							</p>
						</div>
						<div className="flex flex-col gap-3 rounded-xl border border-border p-6">
							<span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">No</span>
							<p className="text-sm font-light leading-relaxed text-foreground/40 line-through decoration-foreground/20">
								&ldquo;My system flags inefficient drains on my timeline.&rdquo;
							</p>
							<p className="text-sm font-light leading-relaxed text-foreground/40 line-through decoration-foreground/20">
								&ldquo;Passionate developer delivering high-quality solutions.&rdquo;
							</p>
						</div>
					</div>
				</Block>

				{/* ── Source of truth ── */}
				<footer className="flex flex-col gap-3 border-t border-border pt-12 text-sm font-light text-foreground/45">
					<SectionLabel>Reference</SectionLabel>
					<p className="max-w-2xl leading-relaxed">
						Structure adopted from Vercel&rsquo;s Geist — the composite type ramps, the alpha ramp
						and border-first hairline, swift easing, the two-layer focus ring, and the fluid
						scale. The brand stays ours: ink neutrals, the iMessage-blue signal, dark-first, and
						our light headings. Source of truth:{" "}
						<a
							href="https://vercel.com/design.md"
							target="_blank"
							rel="noopener noreferrer"
							className="text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)] rounded-sm"
						>
							vercel.com/design.md
						</a>
						. Blur, container, and breakpoint scales are inherited from Tailwind v4.
					</p>
				</footer>
			</div>
		</main>
	);
}
