"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CipherText } from "@/components/matrix/cipher-text";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { SectionId } from "@/lib/constants";

// ─── Animation Variants ───

const heroContainer = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.18, delayChildren: 0.3 },
	},
};

const heroFadeUp = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
	},
};

const heroFadeUpReduced = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.4 },
	},
};

// ─── Parallax config ───

/** Max px translation for each depth layer */
const LAYER_CONFIG = {
	/** First name — foreground layer, moves most */
	foreground: { x: 12, y: 6 },
	/** Last name — midground layer, moves less */
	midground: { x: 6, y: 3 },
	/** Subtitle — deepest layer, barely moves */
	background: { x: 3, y: 1.5 },
} as const;

// ─── Scroll-down chevron ───

function ScrollChevron() {
	const handleClick = () => {
		const about = document.getElementById("about");
		about?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<motion.button
			onClick={handleClick}
			aria-label="Scroll to About section"
			className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 hover:text-white/70 transition-colors duration-300 cursor-pointer"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 1.4, duration: 0.6 }}
		>
			<span className="text-xs font-mono tracking-widest uppercase">
				Scroll
			</span>
			<svg
				className="w-5 h-5 animate-bounce-slow"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M19 9l-7 7-7-7"
				/>
			</svg>
		</motion.button>
	);
}

// ─── Hero Section ───

export function HeroSection() {
	const prefersReduced = useReducedMotion();
	const variants = prefersReduced ? heroFadeUpReduced : heroFadeUp;

	// Refs for each parallax layer
	const firstNameRef = useRef<HTMLSpanElement>(null);
	const lastNameRef = useRef<HTMLSpanElement>(null);
	const subtitleRef = useRef<HTMLParagraphElement>(null);
	const sectionRef = useRef<HTMLElement>(null);
	const rafRef = useRef<number>(0);

	// Smoothed mouse position (lerped each frame)
	const mouseTarget = useRef({ x: 0, y: 0 });
	const mouseCurrent = useRef({ x: 0, y: 0 });

	const applyTransform = useCallback(
		(
			el: HTMLElement | null,
			nx: number,
			ny: number,
			cfg: { x: number; y: number },
		) => {
			if (!el) return;
			const tx = nx * cfg.x;
			const ty = ny * cfg.y;
			el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
		},
		[],
	);

	useEffect(() => {
		if (prefersReduced) return;

		const section = sectionRef.current;
		if (!section) return;

		const LERP = 0.08; // Smoothing factor — lower = silkier

		const onMouseMove = (e: MouseEvent) => {
			const rect = section.getBoundingClientRect();
			// Normalise mouse to -1…1 from section center
			mouseTarget.current = {
				x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
				y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
			};
		};

		const onMouseLeave = () => {
			// Drift back to center
			mouseTarget.current = { x: 0, y: 0 };
		};

		function tick() {
			const cur = mouseCurrent.current;
			const tgt = mouseTarget.current;

			// Lerp towards target
			cur.x += (tgt.x - cur.x) * LERP;
			cur.y += (tgt.y - cur.y) * LERP;

			applyTransform(
				firstNameRef.current,
				cur.x,
				cur.y,
				LAYER_CONFIG.foreground,
			);
			applyTransform(
				lastNameRef.current,
				cur.x,
				cur.y,
				LAYER_CONFIG.midground,
			);
			applyTransform(
				subtitleRef.current,
				cur.x,
				cur.y,
				LAYER_CONFIG.background,
			);

			rafRef.current = requestAnimationFrame(tick);
		}

		section.addEventListener("mousemove", onMouseMove);
		section.addEventListener("mouseleave", onMouseLeave);
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			section.removeEventListener("mousemove", onMouseMove);
			section.removeEventListener("mouseleave", onMouseLeave);
			cancelAnimationFrame(rafRef.current);
		};
	}, [prefersReduced, applyTransform]);

	return (
		<section
			ref={sectionRef}
			id={"hero" satisfies SectionId}
			className="relative w-full h-[100dvh] overflow-hidden snap-start bg-black"
			aria-label="Hero"
		>
			{/* Content overlay — staggered page-load reveal */}
			<motion.div
				className="relative z-10 flex flex-col items-center justify-center h-full px-6 pointer-events-none select-none"
				variants={heroContainer}
				initial="hidden"
				animate="visible"
			>
				<motion.h1
					className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white text-center font-mono flex flex-wrap justify-center gap-x-[0.3em]"
					variants={variants}
				>
					<span ref={firstNameRef} className="will-change-transform">
						<CipherText text="Soheil" as="span" />
					</span>
					<span ref={lastNameRef} className="will-change-transform">
						<CipherText text="Fakour" as="span" />
					</span>
				</motion.h1>
				<motion.p
					ref={subtitleRef}
					className="mt-4 font-mono text-sm sm:text-base text-white/50 tracking-[0.2em] uppercase text-center will-change-transform"
					variants={variants}
				>
					Coding Vision into Existence
				</motion.p>
			</motion.div>

			{/* Scroll-down chevron */}
			<ScrollChevron />
		</section>
	);
}
