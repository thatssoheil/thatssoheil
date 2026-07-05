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
			title="Route not found."
		/>
	);
}
