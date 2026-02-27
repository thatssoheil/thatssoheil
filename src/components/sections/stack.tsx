"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { SectionId } from "@/lib/constants";
import { STACK } from "@/data/stack";
import { TechIcon } from "./tech-icons";

// ─── Animation Variants ───

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
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

const itemVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ─── Stack Section ───

export function StackSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Track mouse position relative to the grid for proximity effect
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

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
          viewport={{ once: true, amount: 0.15 }}
        >
          {/* ── Heading ── */}
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

          {/* ── Grid with proximity effect ── */}
          <div ref={gridRef} className="space-y-12">
            {STACK.map((category) => (
              <motion.div key={category.label} variants={fadeUp}>
                {/* Category label */}
                <h3 className="font-mono text-xs tracking-[0.2em] uppercase text-white/30 mb-5">
                  {category.label}
                </h3>

                {/* Items grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {category.items.map((item) => (
                    <TechStackItem
                      key={item.name}
                      name={item.name}
                      icon={item.icon}
                      mousePos={mousePos}
                      gridRef={gridRef}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Single Tech Item ───

interface TechStackItemProps {
  name: string;
  icon: string;
  mousePos: { x: number; y: number } | null;
  gridRef: React.RefObject<HTMLDivElement | null>;
}

function TechStackItem({ name, icon, mousePos, gridRef }: TechStackItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [proximity, setProximity] = useState(0);

  useEffect(() => {
    if (!mousePos || !itemRef.current || !gridRef.current) {
      setProximity(0);
      return;
    }

    const el = itemRef.current;
    const gridRect = gridRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // Center of element relative to grid
    const elCenterX = elRect.left - gridRect.left + elRect.width / 2;
    const elCenterY = elRect.top - gridRect.top + elRect.height / 2;

    const dx = mousePos.x - elCenterX;
    const dy = mousePos.y - elCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Proximity radius in px — items within this distance get the effect
    const radius = 150;
    const p = Math.max(0, 1 - distance / radius);
    setProximity(p);
  }, [mousePos, gridRef]);

  const scale = 1 + proximity * 0.08;
  const brightness = 0.4 + proximity * 0.6; // base 0.4 → full 1.0

  return (
    <motion.div
      ref={itemRef}
      variants={itemVariants}
      className="tech-stack-item group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 ease-out hover:border-white/20 hover:bg-white/[0.06]"
      style={{
        transform: `scale(${scale})`,
        willChange: proximity > 0 ? "transform" : "auto",
      }}
    >
      {/* Icon */}
      <div
        className="transition-[filter] duration-200"
        style={{
          filter: `brightness(${brightness})`,
        }}
      >
        <TechIcon id={icon} className="w-7 h-7 text-white" />
      </div>

      {/* Label — subtle on idle, fully visible on hover / proximity */}
      <span
        className="text-[10px] sm:text-xs font-mono tracking-wide text-center transition-opacity duration-200 whitespace-nowrap"
        style={{
          opacity: Math.max(0.3, proximity > 0 ? 0.3 + proximity * 0.7 : 0),
        }}
      >
        {name}
      </span>

      {/* Hover tooltip for small screens */}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-white/10 backdrop-blur-md px-2 py-1 text-[10px] font-mono text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
        {name}
      </span>
    </motion.div>
  );
}
