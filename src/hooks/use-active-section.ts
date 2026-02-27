"use client";

import { useEffect, useState, useCallback } from "react";
import { SECTIONS, type SectionId } from "@/lib/constants";

/**
 * Tracks which section is currently in view using IntersectionObserver.
 * Returns the active section id and a manual setter (for click-based nav).
 */
export function useActiveSection() {
	const [activeSection, setActiveSection] = useState<SectionId>("hero");

	useEffect(() => {
		const observers: IntersectionObserver[] = [];

		const handleIntersect = (entries: IntersectionObserverEntry[]) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					setActiveSection(entry.target.id as SectionId);
				}
			}
		};

		// Observe each section element
		for (const { id } of SECTIONS) {
			const el = document.getElementById(id);
			if (!el) continue;

			const observer = new IntersectionObserver(handleIntersect, {
				// Trigger when the section occupies the top portion of the viewport
				rootMargin: "-20% 0px -75% 0px",
				threshold: 0,
			});

			observer.observe(el);
			observers.push(observer);
		}

		return () => {
			for (const obs of observers) obs.disconnect();
		};
	}, []);

	const scrollTo = useCallback((id: SectionId) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth" });
			setActiveSection(id);
		}
	}, []);

	return { activeSection, setActiveSection, scrollTo };
}
