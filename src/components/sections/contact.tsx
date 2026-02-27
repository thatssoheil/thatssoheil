"use client";

import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SectionId } from "@/lib/constants";

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

// ─── Social Links ───

const SOCIALS = [
	{
		label: "GitHub",
		href: "https://github.com/soheilfakour",
		icon: Github,
	},
	{
		label: "LinkedIn",
		href: "https://linkedin.com/in/soheilfakour",
		icon: Linkedin,
	},
	{
		label: "X / Twitter",
		href: "https://x.com/soheilfakour",
		icon: Twitter,
	},
] as const;

// ─── Contact Section ───

export function ContactSection() {
	return (
		<section
			id={"contact" satisfies SectionId}
			className="relative w-full min-h-[80dvh] overflow-hidden snap-start bg-black"
			aria-label="Contact"
		>
			<div className="flex items-center justify-center min-h-[80dvh] px-6 sm:px-8 md:px-12 lg:px-16">
				<motion.div
					className="mx-auto w-full max-w-3xl flex flex-col items-center text-center gap-8 py-24"
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.3 }}
				>
					{/* Sub-heading */}
					<motion.p
						className="font-mono text-sm tracking-[0.2em] uppercase text-white/40"
						variants={fadeUp}
					>
						Get in Touch
					</motion.p>

					{/* Main heading */}
					<motion.h2
						className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-sans"
						variants={fadeUp}
					>
						Let&rsquo;s build something together
					</motion.h2>

					{/* Description */}
					<motion.p
						className="text-lg text-white/50 max-w-xl leading-relaxed"
						variants={fadeUp}
					>
						Have a project in mind or just want to say hello? I&rsquo;d love to
						hear from you.
					</motion.p>

					{/* Email CTA */}
					<motion.div variants={fadeUp}>
						<Button asChild size="lg" className="gap-2 text-base px-8 h-12">
							<a href="mailto:hello@thatssoheil.com">
								<Mail className="size-5" />
								Say Hello
							</a>
						</Button>
					</motion.div>

					{/* Social links */}
					<motion.div
						className="flex items-center gap-4 pt-4"
						variants={fadeUp}
					>
						{SOCIALS.map(({ label, href, icon: Icon }) => (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
								className="group flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/50 transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/5"
							>
								<Icon className="size-4" />
								<span>{label}</span>
							</a>
						))}
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
