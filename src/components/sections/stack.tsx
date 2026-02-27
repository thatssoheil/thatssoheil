"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SectionId } from "@/lib/constants";
import { STACK, type TechItem } from "@/data/stack";
import { TechIcon } from "./tech-icons";

// --- Animation Variants ---------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const pillContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const pillVariant = {
  hidden: { opacity: 0, scale: 0.88, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// --- Tech Pill ------------------------------------------------------------

function TechPill({ item }: { item: TechItem }) {
  const [hovered, setHovered] = useState(false);
  const brandHex = item.hex;

  return (
    <motion.div
      variants={pillVariant}
      className="flex items-center gap-2.5 rounded-full px-4 py-2 cursor-default select-none"
      style={{
        border: `1px solid ${hovered ? `#${brandHex}55` : "rgba(255,255,255,0.08)"}`,
        backgroundColor: hovered
          ? `#${brandHex}18`
          : "rgba(255,255,255,0.025)",
        transition: "border-color 250ms ease, background-color 250ms ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TechIcon
        slug={item.slug}
        hex={hovered ? brandHex : "888888"}
        size={16}
      />
      <span
        className="text-[11px] sm:text-xs font-mono tracking-wide whitespace-nowrap"
        style={{
          color: hovered ? "#fff" : "rgba(255,255,255,0.5)",
          transition: "color 250ms ease",
        }}
      >
        {item.name}
      </span>
    </motion.div>
  );
}

// --- Category Block -------------------------------------------------------

function CategoryBlock({
  label,
  items,
}: {
  label: string;
  items: TechItem[];
}) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-4">
      <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/25">
        {label}
      </p>
      <motion.div
        className="flex flex-wrap gap-2"
        variants={pillContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {items.map((item) => (
          <TechPill key={item.slug} item={item} />
        ))}
      </motion.div>
    </motion.div>
  );
}

// --- Stack Section --------------------------------------------------------

export function StackSection() {
  // Split STACK into two columns for desktop layout
  const leftCol = STACK.slice(0, 2);  // Languages + Frameworks & Libraries
  const rightCol = STACK.slice(2);    // Tools + Platforms

  return (
    <section
      id={"stack" satisfies SectionId}
      className="relative w-full min-h-[100dvh] overflow-hidden snap-start bg-black"
      aria-label="Tech Stack"
    >
      <div className="flex items-center justify-center min-h-[100dvh] px-6 sm:px-8 md:px-12 lg:px-16">
        <motion.div
          className="mx-auto w-full max-w-5xl py-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* -- Heading -- */}
          <motion.p
            className="font-mono text-sm tracking-[0.2em] uppercase text-white/40 mb-2"
            variants={fadeUp}
          >
            Technologies
          </motion.p>
          <motion.h2
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white font-sans mb-16"
            variants={fadeUp}
          >
            Stack
          </motion.h2>

          {/* -- Two-column grid at lg, single column on mobile -- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-x-20 lg:gap-y-16">
            {/* Left column */}
            <div className="flex flex-col gap-10">
              {leftCol.map((cat) => (
                <CategoryBlock
                  key={cat.label}
                  label={cat.label}
                  items={cat.items}
                />
              ))}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-10">
              {rightCol.map((cat) => (
                <CategoryBlock
                  key={cat.label}
                  label={cat.label}
                  items={cat.items}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
