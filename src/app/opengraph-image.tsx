import { ImageResponse } from "next/og";
import { SITE, TAGLINE, X_HANDLE } from "@/lib/constants";
import { CF_BRAND_COLORS, OG_PALETTE } from "@/lib/palette";

export const alt = SITE.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

const FONT_URLS = [
	"https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.8/files/inter-latin-400-normal.woff",
	"https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.8/files/inter-latin-500-normal.woff",
	"https://cdn.jsdelivr.net/npm/@fontsource/inter@5.2.8/files/inter-latin-600-normal.woff",
] as const;

const CONTACT_ITEMS = [
	{ label: "thatssoheil.website" },
	{ label: X_HANDLE },
	{ label: "github.com/thatssoheil" },
] as const;

function BrandMark() {
	return (
		<svg width="18" height="20" viewBox="0 0 20 22" fill="none" aria-hidden="true">
			<path d="M5.2 17.5 L8.8 4.5" stroke={OG_PALETTE.text} strokeWidth="3.2" strokeLinecap="round" />
			<path d="M11.6 17.5 L15.2 4.5" stroke={CF_BRAND_COLORS.tangerine} strokeWidth="3.2" strokeLinecap="round" />
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
	const [inter400, inter500, inter600] = fontData;

	return new ImageResponse(
		<div
			style={{
				display: "flex",
					width: "100%",
				height: "100%",
					padding: 32,
					backgroundColor: OG_PALETTE.canvas,
					color: OG_PALETTE.text,
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
						border: `1px solid ${OG_PALETTE.hairline}`,
						borderRadius: 8,
						backgroundColor: OG_PALETTE.base,
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
							color: OG_PALETTE.text,
							fontSize: 20,
							fontWeight: 500,
							textTransform: "uppercase",
						}}
					>
						<span>Frontend Engineer</span>
						<span style={{ color: CF_BRAND_COLORS.tangerine }}>×</span>
						<span>Product Curator</span>
					</div>
					<div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1.05, whiteSpace: "nowrap" }}>
						{SITE.name}
					</div>
					<div style={{ marginTop: 24, fontSize: 26, fontWeight: 400, lineHeight: 1.35 }}>
						{TAGLINE}
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 16 }}>
					{CONTACT_ITEMS.map((item) => (
						<span key={item.label} style={{ color: OG_PALETTE.text, opacity: 0.7, whiteSpace: "nowrap" }}>
							{item.label}
						</span>
					))}
				</div>
			</div>
		</div>,
		{
			...size,
			headers: {
				"Cache-Control":
					"public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
			},
			fonts: [
				{ name: "Inter", data: inter400, style: "normal", weight: 400 },
				{ name: "Inter", data: inter500, style: "normal", weight: 500 },
				{ name: "Inter", data: inter600, style: "normal", weight: 600 },
			],
		},
	);
}
