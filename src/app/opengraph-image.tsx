import { ImageResponse } from "next/og";
import { SITE, TAGLINE, X_HANDLE } from "@/lib/constants";

export const alt = SITE.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static equivalents of the adopted light-mode Kumo roles for the OG renderer.
const KUMO = {
	canvas: "rgb(251, 251, 251)",
	base: "rgb(255, 255, 255)",
	hairline: "rgb(233, 233, 233)",
	text: "rgb(24, 24, 27)",
	link: "rgb(25, 60, 184)",
	brand: "rgb(5, 109, 255)",
} as const;

const FONT_URLS = [
	"https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.8/files/inter-latin-400-normal.woff",
	"https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.8/files/inter-latin-500-normal.woff",
	"https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.8/files/inter-latin-600-normal.woff",
	"https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.2.8/files/jetbrains-mono-latin-400-normal.woff",
] as const;

const CONTACT_ITEMS = [
	{ label: "thatssoheil.website" },
	{ label: X_HANDLE },
	{ label: "github.com/thatssoheil" },
] as const;

function BrandMark() {
	return (
		<svg width="18" height="20" viewBox="0 0 20 22" fill="none" aria-hidden="true">
			<path d="M5.2 17.5 L8.8 4.5" stroke={KUMO.text} strokeWidth="3.2" strokeLinecap="round" />
			<path d="M11.6 17.5 L15.2 4.5" stroke={KUMO.brand} strokeWidth="3.2" strokeLinecap="round" />
		</svg>
	);
}

export default async function OpengraphImage() {
	const fontData = await Promise.all(
		FONT_URLS.map(async (url) => {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`Could not load OG font: ${response.status}`);
			return response.arrayBuffer();
		}),
	);
	const [inter400, inter500, inter600, mono400] = fontData;

	return new ImageResponse(
		<div
			style={{
				display: "flex",
					width: "100%",
				height: "100%",
					padding: 32,
					backgroundColor: KUMO.canvas,
					color: KUMO.text,
					fontFamily: "Inter",
				}}
		>
			<div
				style={{
					display: "flex",
						width: "100%",
						flexDirection: "column",
						justifyContent: "space-between",
						padding: "42px 56px",
						border: `1px solid ${KUMO.hairline}`,
						borderRadius: 8,
						backgroundColor: KUMO.base,
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 20, fontWeight: 500 }}>
					<BrandMark />
					<span>{SITE.name}</span>
				</div>

				<div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 12,
							marginBottom: 20,
							color: KUMO.link,
							fontSize: 20,
							fontWeight: 500,
							textTransform: "uppercase",
						}}
					>
						<span>Frontend Engineer</span>
						<span style={{ color: KUMO.brand }}>×</span>
						<span>Product Curator</span>
					</div>
					<div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.05, whiteSpace: "nowrap" }}>
						{SITE.name}
					</div>
					<div style={{ marginTop: 24, fontSize: 26, fontWeight: 400, lineHeight: 1.35 }}>
						{TAGLINE}
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: 32, fontFamily: "JetBrains Mono", fontSize: 15 }}>
					{CONTACT_ITEMS.map((item) => (
						<span key={item.label} style={{ color: KUMO.text, opacity: 0.7, whiteSpace: "nowrap" }}>
							{item.label}
						</span>
					))}
				</div>
			</div>
		</div>,
		{
			...size,
			fonts: [
				{ name: "Inter", data: inter400, style: "normal", weight: 400 },
				{ name: "Inter", data: inter500, style: "normal", weight: 500 },
				{ name: "Inter", data: inter600, style: "normal", weight: 600 },
				{ name: "JetBrains Mono", data: mono400, style: "normal", weight: 400 },
			],
		},
	);
}
