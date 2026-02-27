"use client";

import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

const fadeIn = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { duration: 0.6, ease: "easeOut" as const },
	},
};

export function Footer() {
	return (
		<motion.footer
			role="contentinfo"
			className="relative w-full px-6 sm:px-8 md:px-12 lg:px-16 pb-8 pt-0"
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.5 }}
			variants={fadeIn}
		>
			<div className="mx-auto w-full max-w-5xl">
				{/* Subtle separator */}
				<Separator className="mb-8 bg-white/10" />

				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
					<p className="font-mono text-xs tracking-wide">
						&copy; {new Date().getFullYear()} Soheil Fakour
					</p>
					<p className="font-mono text-xs tracking-wide">
						Built with Next.js and a sprinkle of Matrix magic.
					</p>
				</div>
			</div>
		</motion.footer>
	);
}
