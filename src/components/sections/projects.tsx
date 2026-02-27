"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import type { SectionId } from "@/lib/constants";
import { PROJECTS, type Project } from "@/data/projects";
import { Badge } from "@/components/ui/badge";

// ─── Animation Variants ───

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.14 },
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

// ─── Project Card ───

interface ProjectCardProps {
	project: Project;
	index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, amount: 0.25 });

	return (
		<motion.div
			ref={ref}
			className="group relative rounded-xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm p-6 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.04] hover:shadow-[0_8px_32px_rgba(255,255,255,0.04)] hover:-translate-y-1 hover:scale-[1.015]"
			initial={{ opacity: 0, y: 40 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{
				delay: index * 0.12,
				duration: 0.55,
				ease: [0.25, 0.46, 0.45, 0.94],
			}}
		>
			{/* Title + Links */}
			<div className="flex items-start justify-between gap-3">
				<div>
					<h3 className="text-lg font-semibold text-white tracking-tight">
						{project.title}
					</h3>
					{project.context && (
						<p className="mt-0.5 font-mono text-[10px] tracking-wide text-white/30">
							{project.context}
						</p>
					)}
				</div>

				<div className="flex items-center gap-2 shrink-0 pt-0.5">
					{project.github && (
						<a
							href={project.github}
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/30 hover:text-white/70 transition-colors"
							aria-label={`${project.title} — GitHub`}
						>
							<Github className="w-4 h-4" strokeWidth={1.5} />
						</a>
					)}
					{project.live && (
						<a
							href={project.live}
							target="_blank"
							rel="noopener noreferrer"
							className="text-white/30 hover:text-white/70 transition-colors"
							aria-label={`${project.title} — Live demo`}
						>
							<ExternalLink className="w-4 h-4" strokeWidth={1.5} />
						</a>
					)}
				</div>
			</div>

			{/* Description */}
			<p className="mt-3 text-sm leading-relaxed text-white/55 font-light">
				{project.description}
			</p>

			{/* Tech Tags */}
			<div className="mt-4 flex flex-wrap gap-1.5">
				{project.tech.map((t) => (
					<Badge
						key={t}
						variant="secondary"
						className="bg-white/[0.06] text-white/50 border-white/[0.08] text-[11px] font-normal"
					>
						{t}
					</Badge>
				))}
			</div>
		</motion.div>
	);
}

// ─── Projects Section ───

export function ProjectsSection() {
	return (
		<section
			id={"projects" satisfies SectionId}
			className="relative w-full min-h-[100dvh] overflow-hidden snap-start bg-black"
			aria-label="Projects"
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
							{PROJECTS.subheading}
						</motion.p>
						<motion.h2
							className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans"
							variants={fadeUp}
						>
							{PROJECTS.heading}
						</motion.h2>
					</div>

					{/* Project Grid — 1-col mobile, 2-col desktop */}
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 gap-5"
						variants={containerVariants}
					>
						{PROJECTS.entries.map((project, i) => (
							<ProjectCard
								key={project.title}
								project={project}
								index={i}
							/>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
