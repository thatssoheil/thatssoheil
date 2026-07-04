"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  createCipherEngine,
  randomGlyph,
  seededChar,
  type DisplayChar,
} from "@/components/matrix/cipher-engine";

const TICK_MS = 28;

export type CipherAnimationConfig = {
  revealedHold: number;
  spinningHold: number;
  decelDuration: number;
  spinUpDuration: number;
  loop: boolean;
  ambient: boolean;
  intensity: "normal" | "display";
};

/**
 * Drives the framework-free cipher engine for React: deterministic seeded
 * first render (SSR-safe), a fast pre-trigger spin, a one-time decode trigger,
 * and reduced-motion short-circuit. Returns the per-character display state.
 */
export function useCipherAnimation(
  text: string,
  config: CipherAnimationConfig,
): DisplayChar[] {
  const {
    revealedHold,
    spinningHold,
    decelDuration,
    spinUpDuration,
    loop,
    ambient,
    intensity,
  } = config;

  const scrambleBlur = intensity === "display" ? 1.15 : 2;
  const scrambleOpacity = intensity === "display" ? 0.62 : 0.45;
  const prefersReduced = useReducedMotion();
  const [triggered, setTriggered] = useState(false);

  // Initial render is deterministic (seeded scramble) to avoid hydration
  // mismatch while still looking like the cipher mid-spin before JS hydrates.
  const [display, setDisplay] = useState<DisplayChar[]>(() =>
    text.split("").map((ch, i) => ({
      char: ch === " " ? " " : seededChar(i),
      blur: ch === " " ? 0 : scrambleBlur,
      brightness: 1,
      scale: 1,
      opacity: ch === " " ? 1 : scrambleOpacity,
      tint: 0,
    })),
  );

  // Reduced motion: compute the settled display purely — no setState needed.
  // When prefersReduced is true this is returned directly; all animation effects
  // are already gated on `!prefersReduced` so they stay silent.
  const reducedDisplay = useMemo<DisplayChar[]>(() => {
    if (!prefersReduced) return [];
    const engine = createCipherEngine(text, {
      revealedHold, spinningHold, decelDuration, spinUpDuration,
      loop, ambient, reducedMotion: true, tickMs: TICK_MS,
    });
    return engine.snapshot();
  }, [prefersReduced, text, revealedHold, spinningHold, decelDuration, spinUpDuration, loop, ambient]);

  // ── Pre-trigger: fast spin ──
  useEffect(() => {
    if (prefersReduced || triggered) return;

    const chars = text.split("");
    const id = setInterval(() => {
      setDisplay(
        chars.map((ch) => ({
          char: ch === " " ? " " : randomGlyph(),
          blur: ch === " " ? 0 : scrambleBlur,
          brightness: 1,
          scale: 1,
          opacity: ch === " " ? 1 : scrambleOpacity,
          tint: 0,
        })),
      );
    }, TICK_MS);

    return () => clearInterval(id);
  }, [text, prefersReduced, triggered, scrambleBlur, scrambleOpacity]);

  // ── Trigger the one-time decode shortly after mount ──
  useEffect(() => {
    if (prefersReduced) return;
    const t = setTimeout(() => setTriggered(true), 600);
    return () => clearTimeout(t);
  }, [prefersReduced]);

  // ── Main animation loop (driven by the engine) ──
  useEffect(() => {
    if (!triggered || prefersReduced) return;

    const engine = createCipherEngine(text, {
      revealedHold,
      spinningHold,
      decelDuration,
      spinUpDuration,
      loop,
      ambient,
      reducedMotion: false,
      tickMs: TICK_MS,
    });

    const id = setInterval(() => {
      const snap = engine.tick();
      setDisplay(snap);
      // Decode-once settled: leave the final frame in place and stop.
      if (engine.done) {
        clearInterval(id);
        return;
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [
    triggered,
    prefersReduced,
    text,
    revealedHold,
    spinningHold,
    decelDuration,
    spinUpDuration,
    loop,
    ambient,
    intensity,
  ]);

  return prefersReduced ? reducedDisplay : display;
}
