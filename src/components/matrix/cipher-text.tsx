"use client";

import { useCipherAnimation } from "@/hooks/use-cipher-animation";

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

// ─── Component (render-only; animation lives in useCipherAnimation) ───

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
  const display = useCipherAnimation(text, {
    revealedHold,
    spinningHold,
    decelDuration,
    spinUpDuration,
    loop,
    ambient,
  });

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
