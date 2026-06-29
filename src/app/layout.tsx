import type { Metadata, Viewport } from "next";
import { Lexend, Geist_Mono } from "next/font/google";
import { SITE } from "@/lib/constants";
import { PersonJsonLd } from "@/components/json-ld";
import { SkipToContent } from "@/components/skip-to-content";
import { ThemeProvider } from "@/components/theme-provider";
import { SignalField } from "@/components/signal-field/signal-field";
import "./globals.css";

// One typeface, app-wide: Lexend — tuned for low reading fatigue. Variable
// (no `weight`), so the full 100–900 axis is available. Both --font-sans and
// --font-mono resolve to it, so the whole site speaks in a single font.
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
		images: [
			{
				url: SITE.ogImage,
				width: 1200,
				height: 630,
				alt: SITE.title,
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: SITE.title,
		description: SITE.description,
		images: [SITE.ogImage],
		creator: "@soheilfakour",
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
		"developer",
		"creative technologist",
		"WebGPU",
		"Next.js",
	],
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: dark)", color: "#1c1c1c" },
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
