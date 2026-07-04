import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
	async headers() {
		return [
			{
				source: "/",
				headers: [
					{
						key: "X-Robots-Tag",
						value:
							"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
					},
				],
			},
			{
				source: "/ds",
				headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
			},
			{
				source: "/api/:path*",
				headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
			},
		];
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
initOpenNextCloudflareForDev();
