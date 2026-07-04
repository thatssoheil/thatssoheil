import type { Metadata, Viewport } from "next";
import { Lexend, Geist_Mono } from "next/font/google";
import { SITE, X_HANDLE } from "@/lib/constants";
import { PersonJsonLd } from "@/components/json-ld";
import { SkipToContent } from "@/components/skip-to-content";
import { ThemeProvider } from "@/components/theme-provider";
import { SignalField } from "@/components/signal-field/signal-field";
import "./globals.css";

// Primary typeface: Lexend — tuned for low reading fatigue. Variable (no `weight`),
// so the full 100–900 axis is available. --font-sans resolves to it (UI + the
// uppercase eyebrow register); --font-mono resolves to the real Geist Mono below.
const lexend = Lexend({
	variable: "--font-lexend",
	subsets: ["latin"],
	display: "swap",
});

// Geist Mono — used in one place only: the hero's looping cipher name. A cipher
// swaps every glyph against a mixed pool (letters, digits, symbols); a fixed
// advance width is what stops the line from reflowing as it scrambles, and the
// monospace grid reads as "encryption". Exposed as --font-cipher.
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
		// og:image is supplied by app/opengraph-image.tsx (file convention).
	},
	twitter: {
		card: "summary_large_image",
		title: SITE.title,
		description: SITE.description,
		creator: X_HANDLE,
		// twitter:image is supplied by app/opengraph-image.tsx (file convention).
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
		"product curator",
		"React",
		"Next.js",
		"TypeScript",
	],
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
						__html: `document.documentElement.classList.add('js');try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}`,
					}}
				/>
				<PersonJsonLd />
			</head>
			<body
				className={`${lexend.variable} ${geistMono.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					<SignalField />
					<SkipToContent />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
