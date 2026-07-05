import type { Metadata } from "next";

import { RouteFallback } from "@/components/route-fallback";

export const metadata: Metadata = {
	title: "Not found — Soheil Fakour",
	description: "The requested page does not exist.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function NotFound() {
	return (
		<RouteFallback
			code="404"
			eyebrow="Signal lost"
			title="This route does not exist."
			body="The page you asked for is outside this site now. The homepage is the source of truth."
		/>
	);
}
