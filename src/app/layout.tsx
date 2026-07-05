import type { Metadata, Viewport } from "next";
import { Geist_Mono, Lexend } from "next/font/google";
import { SITE, X_HANDLE } from "@/lib/constants";
import { PersonJsonLd } from "@/components/json-ld";
import { SkipToContent } from "@/components/skip-to-content";
import { ThemeProvider } from "@/components/theme-provider";
import { SignalField } from "@/components/signal-field/signal-field";
import { StructureGrid } from "@/components/signal-field/structure-grid";
import "./globals.css";

// Primary typeface: Lexend — tuned for low reading fatigue. Variable (no `weight`),
// so the full 100–900 axis is available. --font-sans resolves to it across the
// site's UI and prose.
const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
	display: "swap",
});

// Geist Mono is intentionally narrow-scoped to cipher moments. The fixed advance
// width keeps scrambled glyphs from reflowing and gives the hero wordmark its
// code-like pulse without pulling the whole interface into a monospace voice.
const geistMono = Geist_Mono({
	variable: "--font-cipher",
	subsets: ["latin"],
	display: "swap",
});

/* ─── SEO & OG ─── */
export const metadata: Metadata = {
	title: SITE.title,
	description: SITE.description,
	metadataBase: new URL(SITE.url),
	applicationName: SITE.name,
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: SITE.url,
		title: SITE.title,
		description: SITE.description,
		siteName: SITE.name,
		images: [
			{
				url: SITE.ogImage,
				width: 1200,
				height: 630,
				alt: SITE.ogImageAlt,
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: SITE.title,
		description: SITE.description,
		creator: X_HANDLE,
		images: [
			{
				url: SITE.ogImage,
				alt: SITE.ogImageAlt,
				width: 1200,
				height: 630,
			},
		],
	},
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/apple-touch-icon.png",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	authors: [{ name: SITE.name, url: SITE.url }],
	creator: SITE.name,
	publisher: SITE.name,
	keywords: [
		"Soheil Fakour",
		"portfolio",
		"frontend engineer",
		"product engineer",
		"product curator",
		"AI product interfaces",
		"agentic AI",
		"React",
		"Next.js",
		"TypeScript",
		"Cloudflare Workers",
	],
	category: "portfolio",
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: "#08090b" },
		{ media: "(prefers-color-scheme: light)", color: "#f7f7f7" },
	],
	width: "device-width",
	initialScale: 1,
};

/* ─── Root Layout ─── */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Marks the document as JS-capable before the body paints, arming the
				    entrance FOUC gate in globals.css. Inline + synchronous so it runs
				    during head parse, ahead of first paint. No-JS visitors never get
				    the `.js` class, so the gate stays inert and content is visible. */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){var root=document.documentElement;root.classList.add('js');try{var overrideKey='thatssoheil-theme-override';var getScheduledTheme=function(){var hour=(new Date()).getHours();return hour>=7&&hour<18?'light':'dark'};var getTheme=function(){try{var raw=window.localStorage&&window.localStorage.getItem(overrideKey);if(raw){var override=JSON.parse(raw);if((override.theme==='light'||override.theme==='dark')&&typeof override.expiresAt==='number'&&override.expiresAt>Date.now()){return override.theme}window.localStorage.removeItem(overrideKey)}}catch(error){try{window.localStorage.removeItem(overrideKey)}catch(error){}}return getScheduledTheme()};var theme=getTheme();root.classList.toggle('dark',theme==='dark');root.style.colorScheme=theme;if('scrollRestoration'in history)history.scrollRestoration='manual';var width=window.innerWidth;var coarse=window.matchMedia&&window.matchMedia('(pointer: coarse)').matches;var setStableViewport=function(){root.style.setProperty('--stable-viewport-height',window.innerHeight+'px')};setStableViewport();window.addEventListener('resize',function(){var nextWidth=window.innerWidth;if(!coarse||nextWidth!==width){width=nextWidth;setStableViewport()}},{passive:true})}catch(e){}})();`,
					}}
				/>
				<PersonJsonLd />
			</head>
			<body
				className={`${lexend.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider>
					<SignalField />
					<StructureGrid />
					<SkipToContent />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
