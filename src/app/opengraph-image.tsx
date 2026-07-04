import { ImageResponse } from "next/og";
import { SITE, ROLE, TAGLINE } from "@/lib/constants";

// The social-share card. Generated at the edge so every unfurl resolves (audit #6 —
// the old static /og.png was referenced everywhere but never existed).
export const alt = SITE.ogImageAlt;
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
					position: "relative",
					alignItems: "center",
					justifyContent: "center",
					background: "#050608",
					color: "#f5f7fb",
					fontFamily: "sans-serif",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						position: "absolute",
						inset: 0,
						background:
							"radial-gradient(circle at 22% 26%, rgba(43, 132, 255, 0.28), transparent 34%), radial-gradient(circle at 78% 70%, rgba(0, 210, 190, 0.18), transparent 36%), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
						backgroundSize: "auto, auto, 306px 100%, 100% 158px",
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 88,
						right: 88,
						top: 76,
						bottom: 76,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						border: "1px solid rgba(255,255,255,0.16)",
						borderRadius: 30,
						padding: "64px 72px",
						background: "rgba(10, 12, 16, 0.68)",
						boxShadow: "0 30px 120px rgba(0,0,0,0.5)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 16,
							fontSize: 28,
							color: "#7cb4ff",
							letterSpacing: "0.15em",
							textTransform: "uppercase",
							marginBottom: 26,
						}}
					>
						<span>{ROLE}</span>
					</div>
					<div
						style={{
							fontSize: 112,
							fontWeight: 300,
							letterSpacing: "-0.045em",
							lineHeight: 0.98,
						}}
					>
						{SITE.name}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 18,
							fontSize: 34,
							color: "rgba(245,247,251,0.66)",
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							marginTop: 36,
						}}
					>
						<span style={{ color: "#2f8cff" }}>{"//"}</span>
						<span>{TAGLINE}</span>
					</div>
				</div>
			</div>
		),
		{ ...size },
	);
}
