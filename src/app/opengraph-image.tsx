import { ImageResponse } from "next/og";
import { SITE, ROLE_PROSE, TAGLINE } from "@/lib/constants";

// The social-share card. Generated at the edge so every unfurl resolves (audit #6 —
// the old static /og.png was referenced everywhere but never existed).
export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					padding: "96px",
					background: "#121212",
					color: "#f7f7f7",
					fontFamily: "sans-serif",
				}}
			>
				<div
					style={{
						fontSize: 34,
						color: "#5aa2ff",
						letterSpacing: "0.12em",
						textTransform: "uppercase",
						marginBottom: 28,
					}}
				>
					{ROLE_PROSE}
				</div>
				<div style={{ fontSize: 112, fontWeight: 300, lineHeight: 1 }}>
					{SITE.name}
				</div>
				<div style={{ fontSize: 42, color: "#9a9a9a", marginTop: 32 }}>
					{TAGLINE}
				</div>
			</div>
		),
		{ ...size },
	);
}
