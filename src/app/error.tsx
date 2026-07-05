"use client";

import { useEffect } from "react";

import { RouteFallback } from "@/components/route-fallback";

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
		<RouteFallback
			code="500"
			title="Signal dropped."
			actionLabel="Try again"
			onAction={unstable_retry ?? reset}
		/>
	);
}
