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
			eyebrow="Signal dropped"
			title="Something broke in transit."
			body="The interface hit an unexpected fault. Try the render again, or return home if the signal keeps dropping."
			actionLabel="Try again"
			onAction={unstable_retry ?? reset}
		/>
	);
}
