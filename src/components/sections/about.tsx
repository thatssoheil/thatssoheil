"use client";

import { motion } from "framer-motion";
import type { SectionId } from "@/lib/constants";
import { ABOUT } from "@/data/about";
import { User } from "lucide-react";

// ─── Animation Variants ───

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.15 },
	},
};

const fadeUp = {
	hidden: { opacity: 0, y: 32 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
	},
};

// ─── About Section ───

export function AboutSection() {
	return (
		<section
			id={"about" satisfies SectionId}
			className="relative w-full min-h-[100dvh] overflow-hidden snap-start bg-black"
			aria-label="About"
		>
			{/* Content */}
			<div className="flex items-center justify-center min-h-[100dvh] px-6 sm:px-8 md:px-12 lg:px-16">
				<motion.div
					className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 md:gap-16 items-center py-24"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.25 }}
				>
					{/* ── Text Column ── */}
					<div className="flex flex-col gap-6">
						<motion.p
							className="font-mono text-sm tracking-[0.2em] uppercase text-white/40"
							variants={fadeUp}
						>
							{ABOUT.subheading}
						</motion.p>

						<motion.h2
							className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans"
							variants={fadeUp}
						>
							{ABOUT.heading}
						</motion.h2>

						<div className="flex flex-col gap-4">
							{ABOUT.paragraphs.map((p, i) => (
								<motion.p
									key={i}
									className="text-base sm:text-lg leading-relaxed text-white/60 font-light"
									variants={fadeUp}
								>
									{p}
								</motion.p>
							))}
						</div>
					</div>

					{/* ── Avatar Placeholder ── */}
					<motion.div
						className="flex items-center justify-center md:justify-end"
						variants={fadeUp}
					>
						<div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm flex items-center justify-center overflow-hidden">
							{/* Replace this placeholder with an <Image> when you have a photo */}
							<User className="w-20 h-20 text-white/20" strokeWidth={1} />
							<span className="absolute bottom-3 text-xs font-mono text-white/20 tracking-wider">
								{ABOUT.avatarAlt}
							</span>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
