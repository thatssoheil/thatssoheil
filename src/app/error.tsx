"use client";

import { useEffect } from "react";

import { RouteFallback } from "@/components/route-fallback";
import { SITE } from "@/lib/constants";

export default function Error({
	error,
	reset,
	unstable_retry,
}: {
	error: Error & { digest?: string };
	reset?: () => void;
	unstable_retry?: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<>
			<title>{`Error | ${SITE.name}`}</title>
			<RouteFallback
				code="500"
				title="Signal dropped."
				actionLabel="Try again"
				onAction={unstable_retry ?? reset}
			/>
		</>
	);
}