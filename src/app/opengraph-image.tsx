import { ImageResponse } from "next/og";
import { EMAIL, SITE, TAGLINE, X_HANDLE } from "@/lib/constants";

// The social-share card. Generated at the edge so every unfurl resolves (audit #6 —
// the old static /og.png was referenced everywhere but never existed).
export const alt = SITE.ogImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ICON_PATHS = {
	github:
		"M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
	linkedin:
		"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
	x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298z",
} as const;

const CONTACT_ITEMS = [
	{ kind: "site", label: "thatssoheil.website" },
	{ kind: "mail", label: EMAIL },
	{ kind: "x", label: X_HANDLE },
	{ kind: "github", label: "github.com/thatssoheil" },
	{ kind: "linkedin", label: "in/soheilfakour" },
] as const;

function ContactIcon({ kind }: { kind: (typeof CONTACT_ITEMS)[number]["kind"] }) {
	if (kind === "site") {
		return (
			<svg width="18" height="20" viewBox="0 0 20 22" fill="none">
				<path
					d="M5.2 17.5 L8.8 4.5"
					stroke="rgba(245,247,251,0.72)"
					strokeWidth="3.2"
					strokeLinecap="round"
				/>
				<path
					d="M11.6 17.5 L15.2 4.5"
					stroke="#2f8cff"
					strokeWidth="3.2"
					strokeLinecap="round"
				/>
			</svg>
		);
	}

	if (kind === "mail") {
		return (
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
				<rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
				<path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	return (
		<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
			<path d={ICON_PATHS[kind]} />
		</svg>
	);
}

export default function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					position: "relative",
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
							"radial-gradient(circle at 18% 38%, rgba(34, 122, 255, 0.26), transparent 34%), radial-gradient(circle at 78% 78%, rgba(0, 207, 190, 0.16), transparent 36%), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
						backgroundSize: "auto, auto, 300px 100%, 100% 157px",
					}}
				/>
				<div
					style={{
						position: "absolute",
						inset: 32,
						border: "1px solid rgba(255,255,255,0.08)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 600,
						top: 32,
						bottom: 32,
						width: 1,
						background: "rgba(255,255,255,0.08)",
					}}
				/>
				<div
					style={{
						position: "absolute",
						left: 104,
						top: 66,
						display: "flex",
						alignItems: "center",
						gap: 14,
						color: "rgba(245,247,251,0.72)",
						fontSize: 20,
						letterSpacing: "0.02em",
					}}
				>
					<ContactIcon kind="site" />
					<span>{SITE.name}</span>
				</div>
				<div
					style={{
						position: "absolute",
						left: 104,
						right: 104,
						top: 104,
						bottom: 104,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 14,
							fontSize: 24,
							color: "#7cb4ff",
							letterSpacing: "0.18em",
							textTransform: "uppercase",
							marginBottom: 34,
						}}
					>
						<span>Frontend Engineer</span>
						<span style={{ color: "#2f8cff" }}>×</span>
						<span>Product Curator</span>
					</div>
					<div
						style={{
							fontSize: 134,
							fontWeight: 300,
							letterSpacing: "-0.06em",
							lineHeight: 0.9,
						}}
					>
						{SITE.name}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 16,
							fontSize: 28,
							color: "rgba(245,247,251,0.62)",
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							marginTop: 42,
						}}
					>
						<span style={{ color: "#2f8cff" }}>{"//"}</span>
						<span>{TAGLINE}</span>
					</div>
				</div>
				<div
					style={{
						position: "absolute",
						left: 104,
						bottom: 64,
						right: 104,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						color: "rgba(245,247,251,0.48)",
						fontSize: 16,
						letterSpacing: "0.04em",
					}}
				>
					{CONTACT_ITEMS.map((item) => (
						<div
							key={item.label}
							style={{
								display: "flex",
								alignItems: "center",
								gap: 8,
								whiteSpace: "nowrap",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "#66a9ff",
								}}
							>
								<ContactIcon kind={item.kind} />
							</div>
							<span>{item.label}</span>
						</div>
					))}
				</div>
			</div>
		),
		{ ...size },
	);
}
