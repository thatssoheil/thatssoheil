import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE } from "@/lib/constants";
import { PersonJsonLd } from "@/components/json-ld";
import { SkipToContent } from "@/components/skip-to-content";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
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
	themeColor: "#0a0a0a",
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
		<html lang="en" className="dark" suppressHydrationWarning>
			<head>
				<PersonJsonLd />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<SkipToContent />
				{children}
			</body>
		</html>
	);
}
