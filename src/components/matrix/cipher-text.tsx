"use client";

import { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

// ─── Props ───

export interface CipherTextProps {
  /** The plain text to display. */
  text: string;
  /** Extra CSS class forwarded to the outer element. */
  className?: string;
  /** Ms the name holds after reveal before re-locking. */
  revealedHold?: number;
  /** Ms the tumblers spin before next unlock. */
  spinningHold?: number;
  /** Ms for the full left-to-right deceleration sweep. */
  decelDuration?: number;
  /** Ms for the spin-up (re-lock) sweep. */
  spinUpDuration?: number;
  /** When true, the name perpetually re-scrambles. Default: decode once and hold. */
  loop?: boolean;
  /** After the one-time decode, occasionally re-flicker a single locked char (subtle "alive" pulse). Ignored when `loop`. */
  ambient?: boolean;
  /** Wrapper element type. */
  as?: React.ElementType;
}

// ─── Constants ───

const CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&".split("");
const TICK_MS = 28;

function randomChar(): string {
  return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
}

// ─── Per-character mutable state ───

type CharPhase =
  | "spinning"
  | "decelerating"
  | "flash"
  | "locked"
  | "accelerating";

interface CharState {
  char: string;
  blur: number;
  brightness: number;
  scale: number;
  opacity: number;
  /** 0 = foreground, 1 = full signal accent (used during the flash). */
  tint: number;
  /** Marks a char as mid-flicker during the ambient phase. */
  flicker: boolean;
  phase: CharPhase;
  elapsed: number;
  delay: number;
  tickCount: number;
  spinRate: number;
  flashElapsed: number;
  targetChar: string;
}

// ─── Component ───

export function CipherText({
  text,
  className,
  revealedHold = 3500,
  spinningHold = 2200,
  decelDuration = 2000,
  spinUpDuration = 900,
  loop = false,
  ambient = false,
  as: Component = "h1",
}: CipherTextProps) {
  const prefersReduced = useReducedMotion();
  const [triggered, setTriggered] = useState(false);

  // Display state per character
  type DisplayChar = {
    char: string;
    blur: number;
    brightness: number;
    scale: number;
    opacity: number;
    tint: number;
  };

  // Initial render is deterministic (underscores) to avoid hydration mismatch.
  // The pre-trigger useEffect immediately replaces with random chars on mount.
  const [display, setDisplay] = useState<DisplayChar[]>(() =>
    text.split("").map((ch) => ({
      char: ch === " " ? " " : "_",
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
          char: ch === " " ? " " : randomChar(),
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

  // ── Main animation loop ──
  const statesRef = useRef<CharState[] | null>(null);

  useEffect(() => {
    if (!triggered || prefersReduced) return;

    const chars = text.split("");
    const nonSpacePositions: number[] = [];
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== " ") nonSpacePositions.push(i);
    }
    const nsCount = nonSpacePositions.length;

    // ── Timing constants ──
    const FLASH_MS = 280;
    const DECEL_PER_CHAR = decelDuration * 0.5;
    const ACCEL_PER_CHAR = spinUpDuration * 0.45;

    // ── Ambient flicker (post-decode "alive" pulse) ──
    const FLICKER_SPIN_MS = 320;
    const ambientActive = ambient && !loop;
    const nextAmbientDelay = () =>
      Math.round((3000 + Math.random() * 3500) / TICK_MS);

    // ── Initialise per-character state ──
    function makeCharState(i: number, phase: CharPhase): CharState {
      return {
        char: chars[i] === " " ? " " : randomChar(),
        blur: phase === "locked" ? 0 : 2,
        brightness: 1,
        scale: 1,
        opacity: phase === "locked" ? 1 : 0.45,
        tint: 0,
        flicker: false,
        phase: chars[i] === " " ? "locked" : phase,
        elapsed: 0,
        delay: 0,
        tickCount: 0,
        spinRate: phase === "locked" ? 999 : 1,
        flashElapsed: 0,
        targetChar: chars[i],
      };
    }

    function stagger(nsIdx: number, spread: number): number {
      return nsCount > 1 ? (nsIdx / (nsCount - 1)) * spread : 0;
    }

    // Start all as spinning, transition immediately to deceleration
    type GlobalPhase =
      | "decelerating"
      | "revealed"
      | "accelerating"
      | "spinning"
      | "ambient";
    let gPhase: GlobalPhase = "decelerating";
    let gElapsed = 0;
    let ambientCountdown = nextAmbientDelay();
    let flickerActive = false;

    const cs: CharState[] = chars.map((_, i) => makeCharState(i, "spinning"));
    // Set stagger delays for initial deceleration
    let nsIdx = 0;
    for (let i = 0; i < cs.length; i++) {
      if (chars[i] === " ") continue;
      cs[i].delay = stagger(nsIdx, decelDuration * 0.55);
      nsIdx++;
    }
    statesRef.current = cs;

    function resetForDecel() {
      let idx = 0;
      for (let i = 0; i < cs.length; i++) {
        if (chars[i] === " ") continue;
        const s = cs[i];
        s.phase = "spinning";
        s.elapsed = 0;
        s.delay = stagger(idx, decelDuration * 0.55);
        s.tickCount = 0;
        s.spinRate = 1;
        s.flashElapsed = 0;
        s.blur = 2;
        s.opacity = 0.45;
        s.brightness = 1;
        s.scale = 1;
        idx++;
      }
    }

    function resetForAccel() {
      let idx = 0;
      for (let i = 0; i < cs.length; i++) {
        if (chars[i] === " ") continue;
        const s = cs[i];
        s.phase = "locked";
        s.elapsed = 0;
        s.delay = stagger(idx, spinUpDuration * 0.5);
        s.tickCount = 0;
        s.spinRate = 14;
        s.flashElapsed = 0;
        s.blur = 0;
        s.opacity = 1;
        s.brightness = 1;
        s.scale = 1;
        idx++;
      }
    }

    // ── Interval ──
    const id = setInterval(() => {
      gElapsed += TICK_MS;

      // ── Global phase transitions (hold timers) ──
      if (gPhase === "revealed") {
        if (loop) {
          if (gElapsed >= revealedHold) {
            gPhase = "accelerating";
            gElapsed = 0;
            resetForAccel();
          }
        } else if (ambientActive) {
          // Decode-once + ambient: keep ticking, drip rare single-char flickers.
          gPhase = "ambient";
          gElapsed = 0;
          ambientCountdown = nextAmbientDelay();
        } else {
          // Decode-once: settle crisp and stop the loop entirely.
          clearInterval(id);
          return;
        }
      } else if (gPhase === "ambient") {
        ambientCountdown--;
        if (!flickerActive && ambientCountdown <= 0 && nsCount > 0) {
          const pick = nonSpacePositions[Math.floor(Math.random() * nsCount)];
          const s = cs[pick];
          s.flicker = true;
          s.phase = "spinning";
          s.elapsed = 0;
          s.tickCount = 0;
          s.flashElapsed = 0;
          s.blur = 1.2;
          s.opacity = 0.6;
          flickerActive = true;
        }
      } else if (gPhase === "spinning" && gElapsed >= spinningHold) {
        gPhase = "decelerating";
        gElapsed = 0;
        resetForDecel();
      }

      // ── Per-character tick ──
      let allDone = true;

      for (let i = 0; i < cs.length; i++) {
        const s = cs[i];
        if (chars[i] === " ") continue;

        s.elapsed += TICK_MS;
        s.tickCount++;

        // ─────────────────────────────────────────
        // DECELERATION: spinning → decelerating → flash → locked
        // ─────────────────────────────────────────
        if (gPhase === "decelerating") {
          if (s.phase === "spinning") {
            s.char = randomChar();
            if (s.elapsed >= s.delay) {
              s.phase = "decelerating";
              s.elapsed = 0;
              s.tickCount = 0;
            }
            allDone = false;
          } else if (s.phase === "decelerating") {
            const p = Math.min(s.elapsed / DECEL_PER_CHAR, 1);

            s.spinRate = Math.max(1, Math.floor(1 + p * 13));
            s.blur = 2 * (1 - p * p);
            s.opacity = 0.45 + p * 0.55;

            if (s.tickCount % s.spinRate === 0) {
              if (p > 0.65 && Math.random() < (p - 0.65) * 2.2) {
                s.char = s.targetChar;
              } else {
                s.char = randomChar();
              }
            }

            if (p >= 1) {
              s.phase = "flash";
              s.char = s.targetChar;
              s.blur = 0;
              s.opacity = 1;
              s.brightness = 1.35;
              s.scale = 1.08;
              s.tint = 1;
              s.flashElapsed = 0;
            } else {
              allDone = false;
            }
          } else if (s.phase === "flash") {
            s.flashElapsed += TICK_MS;
            const fp = Math.min(s.flashElapsed / FLASH_MS, 1);
            const ease = 1 - (1 - fp) * (1 - fp);
            s.brightness = 1.35 - 0.35 * ease;
            s.scale = 1.08 - 0.08 * ease;
            s.tint = 1 - ease;

            if (fp >= 1) {
              s.phase = "locked";
              s.brightness = 1;
              s.scale = 1;
              s.tint = 0;
            } else {
              allDone = false;
            }
          }
        }

        // ─────────────────────────────────────────
        // ACCELERATION: locked → accelerating → spinning
        // ─────────────────────────────────────────
        else if (gPhase === "accelerating") {
          if (s.phase === "locked") {
            if (s.elapsed >= s.delay) {
              s.phase = "accelerating";
              s.elapsed = 0;
              s.tickCount = 0;
            }
            allDone = false;
          } else if (s.phase === "accelerating") {
            const p = Math.min(s.elapsed / ACCEL_PER_CHAR, 1);

            s.spinRate = Math.max(1, Math.floor(14 - p * 13));
            s.blur = 2 * p * p;
            s.opacity = 1 - p * 0.55;

            if (s.tickCount % s.spinRate === 0) {
              s.char = randomChar();
            }

            if (p >= 1) {
              s.phase = "spinning";
              s.spinRate = 1;
              s.blur = 2;
              s.opacity = 0.45;
            } else {
              allDone = false;
            }
          } else if (s.phase === "spinning") {
            s.char = randomChar();
          }
        }

        // ─────────────────────────────────────────
        // SPINNING / REVEALED (hold phases)
        // ─────────────────────────────────────────
        else if (gPhase === "spinning") {
          s.char = randomChar();
        }

        // ─────────────────────────────────────────
        // AMBIENT: locked chars rest; one re-flickers at a time
        // ─────────────────────────────────────────
        else if (gPhase === "ambient") {
          if (!s.flicker) continue;
          if (s.phase === "spinning") {
            s.char = randomChar();
            if (s.elapsed >= FLICKER_SPIN_MS) {
              s.phase = "flash";
              s.char = s.targetChar;
              s.blur = 0;
              s.opacity = 1;
              s.brightness = 1.35;
              s.scale = 1.08;
              s.tint = 1;
              s.flashElapsed = 0;
            }
          } else if (s.phase === "flash") {
            s.flashElapsed += TICK_MS;
            const fp = Math.min(s.flashElapsed / FLASH_MS, 1);
            const ease = 1 - (1 - fp) * (1 - fp);
            s.brightness = 1.35 - 0.35 * ease;
            s.scale = 1.08 - 0.08 * ease;
            s.tint = 1 - ease;
            if (fp >= 1) {
              s.phase = "locked";
              s.brightness = 1;
              s.scale = 1;
              s.tint = 0;
              s.flicker = false;
              flickerActive = false;
              ambientCountdown = nextAmbientDelay();
            }
          }
        }
      }

      // Advance global phase when all chars finish their transition
      if (gPhase === "decelerating" && allDone) {
        gPhase = "revealed";
        gElapsed = 0;
      } else if (gPhase === "accelerating" && allDone) {
        gPhase = "spinning";
        gElapsed = 0;
      }

      // ── Build display ──
      setDisplay(
        cs.map((s) => ({
          char: s.char,
          blur: s.blur,
          brightness: s.brightness,
          scale: s.scale,
          opacity: s.opacity,
          tint: s.tint,
        })),
      );
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

  return (
    <Component className={className}>
      {display.map((d, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            minWidth: d.char === " " ? "0.3em" : undefined,
            opacity: d.opacity,
            color:
              d.tint > 0.01
                ? `color-mix(in oklch, var(--signal-400) ${(d.tint * 100).toFixed(0)}%, var(--foreground))`
                : undefined,
            filter:
              d.blur > 0.05 || d.brightness !== 1
                ? `blur(${d.blur.toFixed(1)}px) brightness(${d.brightness.toFixed(2)})`
                : undefined,
            transform:
              d.scale !== 1 ? `scale(${d.scale.toFixed(3)})` : undefined,
            transition: "filter 50ms linear, transform 50ms linear, color 50ms linear",
            willChange: "filter, transform, opacity",
          }}
        >
          {d.char}
        </span>
      ))}
    </Component>
  );
}
