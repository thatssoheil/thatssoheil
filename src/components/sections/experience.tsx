"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { SectionId } from "@/lib/constants";
import { EXPERIENCE, type ExperienceEntry } from "@/data/experience";
import { Briefcase } from "lucide-react";

// ─── Animation Variants ───

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.18 },
	},
};

const fadeUp = {
	hidden: { opacity: 0, y: 36 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
	},
};

const lineGrow = {
	hidden: { scaleY: 0 },
	visible: {
		scaleY: 1,
		transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const },
	},
};

// ─── Single Timeline Entry ───

interface TimelineEntryProps {
	entry: ExperienceEntry;
	index: number;
	total: number;
}

function TimelineEntry({ entry, index, total }: TimelineEntryProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, amount: 0.3 });
	const isLeft = index % 2 === 0;

	return (
		<div ref={ref} className="relative grid grid-cols-[1fr_auto_1fr] gap-4 md:gap-8">
			{/* ── Left column ── */}
			<div
				className={`flex ${
					isLeft ? "justify-end" : "justify-end md:justify-end"
				}`}
			>
				{isLeft ? (
					<EntryCard entry={entry} isInView={isInView} align="right" delay={index * 0.12} />
				) : (
					/* Date label on the opposite side (desktop) */
					<motion.span
						className="hidden md:block self-center font-mono text-xs tracking-widest text-white/30 uppercase"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : {}}
						transition={{ delay: index * 0.12 + 0.3, duration: 0.5 }}
					>
						{entry.dateRange}
					</motion.span>
				)}
			</div>

			{/* ── Center spine ── */}
			<div className="relative flex flex-col items-center">
				{/* Dot */}
				<motion.div
					className="z-10 flex items-center justify-center w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-sm"
					initial={{ scale: 0, opacity: 0 }}
					animate={isInView ? { scale: 1, opacity: 1 } : {}}
					transition={{
						delay: index * 0.12,
						duration: 0.4,
						ease: [0.25, 0.46, 0.45, 0.94],
					}}
				>
					<Briefcase className="w-4 h-4 text-white/50" strokeWidth={1.5} />
				</motion.div>

				{/* Connecting line segment */}
				{index < total - 1 && (
					<motion.div
						className="w-px flex-1 origin-top bg-gradient-to-b from-white/15 to-white/5"
						variants={lineGrow}
						initial="hidden"
						animate={isInView ? "visible" : "hidden"}
						transition={{ delay: index * 0.12 + 0.15 }}
					/>
				)}
			</div>

			{/* ── Right column ── */}
			<div
				className={`flex ${
					isLeft ? "justify-start" : "justify-start"
				}`}
			>
				{isLeft ? (
					<motion.span
						className="hidden md:block self-center font-mono text-xs tracking-widest text-white/30 uppercase"
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : {}}
						transition={{ delay: index * 0.12 + 0.3, duration: 0.5 }}
					>
						{entry.dateRange}
					</motion.span>
				) : (
					<EntryCard entry={entry} isInView={isInView} align="left" delay={index * 0.12} />
				)}
			</div>
		</div>
	);
}

// ─── Entry Card ───

interface EntryCardProps {
	entry: ExperienceEntry;
	isInView: boolean;
	align: "left" | "right";
	delay: number;
}

function EntryCard({ entry, isInView, align, delay }: EntryCardProps) {
	return (
		<motion.div
			className={`max-w-sm w-full rounded-xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm p-5 ${
				align === "right" ? "text-right md:text-right" : "text-left"
			}`}
			initial={{ opacity: 0, x: align === "right" ? 40 : -40, y: 10 }}
			animate={
				isInView
					? { opacity: 1, x: 0, y: 0 }
					: {}
			}
			transition={{
				delay: delay + 0.1,
				duration: 0.55,
				ease: [0.25, 0.46, 0.45, 0.94],
			}}
		>
			{/* Mobile-only date */}
			<span className="md:hidden block font-mono text-[11px] tracking-widest text-white/30 uppercase mb-2">
				{entry.dateRange}
			</span>

			<h3 className="text-base font-semibold text-white tracking-tight">
				{entry.role}
			</h3>
			<p className="mt-0.5 font-mono text-xs tracking-wide text-white/40">
				{entry.company}
			</p>
			<p className="mt-2 text-sm leading-relaxed text-white/55 font-light">
				{entry.description}
			</p>
		</motion.div>
	);
}

// ─── Experience Section ───

export function ExperienceSection() {
	return (
		<section
			id={"experience" satisfies SectionId}
			className="relative w-full min-h-[100dvh] overflow-hidden snap-start bg-black"
			aria-label="Experience"
		>

			{/* Content */}
			<div className="flex items-center justify-center min-h-[100dvh] px-6 sm:px-8 md:px-12 lg:px-16">
				<motion.div
					className="mx-auto w-full max-w-5xl py-24"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }}
				>
					{/* Heading */}
					<div className="text-center mb-16">
						<motion.p
							className="font-mono text-sm tracking-[0.2em] uppercase text-white/40"
							variants={fadeUp}
						>
							{EXPERIENCE.subheading}
						</motion.p>
						<motion.h2
							className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans"
							variants={fadeUp}
						>
							{EXPERIENCE.heading}
						</motion.h2>
					</div>

					{/* Timeline */}
					<div className="flex flex-col gap-0">
						{EXPERIENCE.entries.map((entry, i) => (
							<TimelineEntry
								key={`${entry.company}-${entry.dateRange}`}
								entry={entry}
								index={i}
								total={EXPERIENCE.entries.length}
							/>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
