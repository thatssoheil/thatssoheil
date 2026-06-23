"use client";

import { useEffect, useState } from "react";
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
  } = config;

  const prefersReduced = useReducedMotion();
  const [triggered, setTriggered] = useState(false);

  // Initial render is deterministic (seeded scramble) to avoid hydration
  // mismatch while still looking like the cipher mid-spin before JS hydrates.
  const [display, setDisplay] = useState<DisplayChar[]>(() =>
    text.split("").map((ch, i) => ({
      char: ch === " " ? " " : seededChar(i),
      blur: ch === " " ? 0 : 2,
      brightness: 1,
      scale: 1,
      opacity: ch === " " ? 1 : 0.45,
      tint: 0,
    })),
  );

  // ── Pre-trigger: fast spin ──
  useEffect(() => {
    if (prefersReduced || triggered) return;

    const chars = text.split("");
    const id = setInterval(() => {
      setDisplay(
        chars.map((ch) => ({
          char: ch === " " ? " " : randomGlyph(),
          blur: ch === " " ? 0 : 2,
          brightness: 1,
          scale: 1,
          opacity: ch === " " ? 1 : 0.45,
          tint: 0,
        })),
      );
    }, TICK_MS);

    return () => clearInterval(id);
  }, [text, prefersReduced, triggered]);

  // Reduced motion: sync to final state during render (avoids set-state-in-effect)
  if (prefersReduced && !triggered) {
    setTriggered(true);
    setDisplay(
      text.split("").map((ch) => ({
        char: ch,
        blur: 0,
        brightness: 1,
        scale: 1,
        opacity: 1,
        tint: 0,
      })),
    );
  }

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
      tickMs: TICK_MS,
    });

    const id = setInterval(() => {
      const snap = engine.tick();
      // Decode-once settled: leave the final frame in place and stop.
      if (engine.done) {
        clearInterval(id);
        return;
      }
      setDisplay(snap);
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
  ]);

  return display;
}
