import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ROLE_PROSE, SITE, X_HANDLE } from "@/lib/constants";
import { PersonJsonLd } from "@/components/json-ld";
import { SkipToContent } from "@/components/skip-to-content";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Inter supplies the proportional face; JetBrains Mono supplies code and mono.
// Keep the CSS variable names as the stable plumbing for existing font utilities.
const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
	display: "swap",
});

/* ─── SEO & OG ─── */
export const metadata: Metadata = {
	title: {
		default: `${SITE.name} | ${ROLE_PROSE}`,
		template: `%s | ${SITE.name}`,
	},
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
		title: `${SITE.name} | ${ROLE_PROSE}`,
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
		title: `${SITE.name} | ${ROLE_PROSE}`,
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
		{ media: "(prefers-color-scheme: dark)", color: "oklch(10% 0 0)" },
		{ media: "(prefers-color-scheme: light)", color: "oklch(98.75% 0 0)" },
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
						__html: `(function(){var root=document.documentElement;var overrideKey='thatssoheil-theme-override';var getSystemTheme=function(){return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'};var theme=null;root.classList.add('js');try{var raw=window.localStorage&&window.localStorage.getItem(overrideKey);if(raw){var override=JSON.parse(raw);if(override&&(override.theme==='light'||override.theme==='dark')){theme=override.theme}else{window.localStorage.removeItem(overrideKey)}}}catch(e){}if(!theme){theme=getSystemTheme()}root.setAttribute('data-mode',theme);root.style.colorScheme=theme;if('scrollRestoration'in history)history.scrollRestoration='manual';var width=window.innerWidth;var coarse=window.matchMedia&&window.matchMedia('(pointer: coarse)').matches;var setStableViewport=function(){root.style.setProperty('--stable-viewport-height',window.innerHeight+'px')};setStableViewport();window.addEventListener('resize',function(){var nextWidth=window.innerWidth;if(!coarse||nextWidth!==width){width=nextWidth;setStableViewport()}},{passive:true})})();`,
					}}
				/>
				<PersonJsonLd />
			</head>
			<body className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}>
				<ThemeProvider>
					<SkipToContent />
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}