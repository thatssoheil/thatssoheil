"use client";

import { useEffect, useState } from "react";

/**
 * Returns a 0-1 value representing how far the user has scrolled.
 */
export function useScrollProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const update = () => {
			const scrollTop = window.scrollY;
			const docHeight =
				document.documentElement.scrollHeight - window.innerHeight;
			setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
		};

		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, []);

	return progress;
}
