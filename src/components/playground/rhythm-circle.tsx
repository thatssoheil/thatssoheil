"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { bjorklund, patternToString, RHYTHM_PRESETS, type RhythmPreset } from "@/lib/playground/rhythm";

// The instrument: a Euclidean rhythm machine. The pattern is Bjorklund's
// algorithm (pure and deterministic); the sound is a Web Audio tick built
// from an oscillator and a short envelope - no audio files, no dependencies.
// The scheduler follows the standard lookahead pattern: a coarse interval
// timer schedules ticks a little ahead on the audio clock, and the circle's
// playhead reads those scheduled times back to stay in sync with the sound.

const MIN_STEPS = 2;
const MAX_STEPS = 16;
const MIN_BPM = 40;
const MAX_BPM = 200;
const DEFAULT_STEPS = 8;
const DEFAULT_PULSES = 3;
const DEFAULT_BPM = 100;

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.12;
const START_DELAY_S = 0.06;
const TICK_BASE_HZ = 880;
const TICK_ACCENT_HZ = 1320;
const TICK_BASE_GAIN = 0.22;
const TICK_ACCENT_GAIN = 0.4;

// Circle geometry (SVG user units).
const SIZE = 260;
const CENTER = SIZE / 2;
const RING_R = 96;
const PULSE_DOT_R = 7.5;
const OFF_DOT_R = 4;

interface Voice {
	osc: OscillatorNode;
	gain: GainNode;
}

/** Point on the step ring: step 0 at the top, clockwise. */
function stepPoint(index: number, total: number): { x: number; y: number } {
	const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
	return { x: CENTER + RING_R * Math.cos(angle), y: CENTER + RING_R * Math.sin(angle) };
}

export function RhythmCircle() {
	const reducedMotion = useReducedMotion();

	const [steps, setSteps] = useState(DEFAULT_STEPS);
	const [pulses, setPulses] = useState(DEFAULT_PULSES);
	const [bpm, setBpm] = useState(DEFAULT_BPM);
	const [presetSlug, setPresetSlug] = useState<string | null>(null);
	const [playing, setPlaying] = useState(false);
	const [activeStep, setActiveStep] = useState<number | null>(null);
	const [note, setNote] = useState<string | null>(null);

	const preset = useMemo(
		() => RHYTHM_PRESETS.find((entry) => entry.slug === presetSlug) ?? null,
		[presetSlug],
	);
	const pattern = useMemo(
		() => (preset ? preset.pattern.split("").map((ch) => ch === "1") : bjorklund(pulses, steps)),
		[preset, pulses, steps],
	);
	const patternString = useMemo(() => patternToString(pattern), [pattern]);
	const accentIndex = pattern.indexOf(true);

	// Scheduler state lives in refs: the timer runs outside React and reads
	// the current pattern and tempo through these.
	const audioRef = useRef<AudioContext | null>(null);
	const schedulerRef = useRef<number | null>(null);
	const voicesRef = useRef<Voice[]>([]);
	const stepIndexRef = useRef(0);
	const nextTimeRef = useRef(0);
	const stepDurRef = useRef(60 / DEFAULT_BPM / 4);
	const patternRef = useRef(pattern);
	const accentRef = useRef(accentIndex);
	const scheduledTimesRef = useRef<number[]>([]);
	const playheadRef = useRef<SVGGElement | null>(null);

	useEffect(() => {
		patternRef.current = pattern;
		accentRef.current = accentIndex;
	}, [pattern, accentIndex]);

	useEffect(() => {
		stepDurRef.current = 60 / bpm / 4;
	}, [bpm]);

	function ensureContext(): AudioContext | null {
		if (audioRef.current) return audioRef.current;
		if (typeof window === "undefined" || !("AudioContext" in window)) return null;
		audioRef.current = new AudioContext();
		return audioRef.current;
	}

	function scheduleTick(time: number, accent: boolean) {
		const ctx = audioRef.current;
		if (!ctx) return;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "triangle";
		osc.frequency.value = accent ? TICK_ACCENT_HZ : TICK_BASE_HZ;
		gain.gain.setValueAtTime(0.0001, time);
		gain.gain.exponentialRampToValueAtTime(accent ? TICK_ACCENT_GAIN : TICK_BASE_GAIN, time + 0.002);
		gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.09);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(time);
		osc.stop(time + 0.12);
		const voice: Voice = { osc, gain };
		voicesRef.current.push(voice);
		osc.onended = () => {
			voicesRef.current = voicesRef.current.filter((entry) => entry !== voice);
			osc.disconnect();
			gain.disconnect();
		};
	}

	function startScheduler(ctx: AudioContext) {
		if (schedulerRef.current !== null) window.clearInterval(schedulerRef.current);
		scheduledTimesRef.current = [];
		stepIndexRef.current = 0;
		nextTimeRef.current = ctx.currentTime + START_DELAY_S;
		schedulerRef.current = window.setInterval(() => {
			const c = audioRef.current;
			if (!c) return;
			while (nextTimeRef.current < c.currentTime + SCHEDULE_AHEAD_S) {
				const pat = patternRef.current;
				const idx = stepIndexRef.current % pat.length;
				let when = nextTimeRef.current;
				if (when < c.currentTime) {
					// A throttled timer (background tab) fell behind: resync to
					// the clock and skip the missed steps rather than stack ticks.
					when = c.currentTime + 0.02;
				}
				if (pat[idx]) scheduleTick(when, idx === accentRef.current);
				scheduledTimesRef.current[idx] = when;
				nextTimeRef.current = when + stepDurRef.current;
				stepIndexRef.current = (idx + 1) % pat.length;
			}
		}, LOOKAHEAD_MS);
	}

	function stopScheduler() {
		if (schedulerRef.current !== null) {
			window.clearInterval(schedulerRef.current);
			schedulerRef.current = null;
		}
	}

	function stopAllVoices() {
		const ctx = audioRef.current;
		const now = ctx ? ctx.currentTime : 0;
		for (const voice of voicesRef.current) {
			try {
				voice.gain.gain.cancelScheduledValues(now);
				voice.gain.gain.setValueAtTime(0.0001, now);
				voice.osc.stop(now + 0.01);
			} catch {
				// The oscillator already ended; nothing to stop.
			}
		}
		voicesRef.current = [];
	}

	async function handleToggle() {
		if (playing) {
			stopScheduler();
			stopAllVoices();
			setPlaying(false);
			setActiveStep(null);
			return;
		}
		const ctx = ensureContext();
		if (!ctx) {
			setNote("This browser does not support Web Audio, so the loop cannot sound here. The circle still shows the pattern.");
			return;
		}
		setNote(null);
		try {
			if (ctx.state === "suspended") await ctx.resume();
		} catch {
			setNote("The browser kept audio suspended, so the loop cannot sound here.");
			return;
		}
		startScheduler(ctx);
		setPlaying(true);
	}

	// The playhead: a rAF loop reads the scheduled step times back off the
	// audio clock. With reduced motion there is no sweeping hand - the
	// current step is simply highlighted.
	useEffect(() => {
		if (!playing) return;
		let raf = 0;
		const tick = () => {
			const ctx = audioRef.current;
			if (ctx) {
				const now = ctx.currentTime;
				const times = scheduledTimesRef.current;
				const length = patternRef.current.length;
				let current = -1;
				let best = Number.NEGATIVE_INFINITY;
				for (let i = 0; i < length; i += 1) {
					const t = times[i];
					if (typeof t === "number" && t <= now && t > best) {
						best = t;
						current = i;
					}
				}
				if (current >= 0) {
					setActiveStep((prev) => (prev === current ? prev : current));
					if (!reducedMotion && playheadRef.current) {
						const fraction = Math.min(Math.max((now - best) / stepDurRef.current, 0), 0.999);
						const angle = ((current + fraction) / length) * 360;
						playheadRef.current.setAttribute(
							"transform",
							`rotate(${angle.toFixed(2)} ${CENTER} ${CENTER})`,
						);
					}
				}
			}
			raf = window.requestAnimationFrame(tick);
		};
		raf = window.requestAnimationFrame(tick);
		return () => window.cancelAnimationFrame(raf);
	}, [playing, reducedMotion]);

	// Tear down the audio graph when the page goes away.
	useEffect(() => {
		return () => {
			if (schedulerRef.current !== null) window.clearInterval(schedulerRef.current);
			schedulerRef.current = null;
			for (const voice of voicesRef.current) {
				try {
					voice.osc.stop();
				} catch {
					// Already stopped.
				}
			}
			voicesRef.current = [];
			const ctx = audioRef.current;
			audioRef.current = null;
			if (ctx) void ctx.close().catch(() => undefined);
		};
	}, []);

	function handleSteps(next: number) {
		setSteps(next);
		setPulses((current) => Math.min(current, next));
		setPresetSlug(null);
	}

	function handlePulses(next: number) {
		setPulses(next);
		setPresetSlug(null);
	}

	function handlePreset(entry: RhythmPreset) {
		setPresetSlug(entry.slug);
		setSteps(entry.steps);
		setPulses(entry.pulses);
	}

	const stateLine = `${patternString} · ${playing ? "playing" : "stopped"}`;
	const centreName = preset ? preset.name : "free play";

	return (
		<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">The instrument</span>
				<span role="status" aria-live="polite" className="text-label-12-mono text-text-faint">
					{stateLine}
				</span>
			</div>

			<div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
				<div className="mx-auto w-full max-w-[20rem]">
					<svg
						viewBox={`0 0 ${SIZE} ${SIZE}`}
						className="h-auto w-full"
						role="img"
						aria-label={`Euclidean rhythm circle: ${pulses} pulses across ${steps} steps, pattern ${patternString}${preset ? `, the ${preset.name} from ${preset.origin}` : ""}. ${playing ? "Playing." : "Stopped."}`}
					>
						<circle
							cx={CENTER}
							cy={CENTER}
							r={RING_R}
							className="text-alpha-200"
							stroke="currentColor"
							strokeWidth={1}
							fill="none"
						/>
						{pattern.map((on, index) => {
							const point = stepPoint(index, pattern.length);
							const isActive = activeStep === index;
							return (
								<g key={index}>
									<circle
										cx={point.x}
										cy={point.y}
										r={on ? PULSE_DOT_R : OFF_DOT_R}
										className={on ? "text-brand" : "text-alpha-400"}
										fill="currentColor"
										fillOpacity={on ? 0.9 : 0.5}
									/>
									{isActive ? (
										<circle
											cx={point.x}
											cy={point.y}
											r={PULSE_DOT_R + 5}
											className="text-foreground"
											stroke="currentColor"
											strokeWidth={1.5}
											fill="none"
											opacity={0.8}
										/>
									) : null}
								</g>
							);
						})}
						{playing && !reducedMotion ? (
							<g ref={playheadRef} transform={`rotate(0 ${CENTER} ${CENTER})`}>
								<line
									x1={CENTER}
									y1={CENTER - 36}
									x2={CENTER}
									y2={CENTER - RING_R + 14}
									className="text-brand"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									opacity={0.85}
								/>
							</g>
						) : null}
						<text
							x={CENTER}
							y={CENTER - 2}
							textAnchor="middle"
							className="font-mono text-text-muted"
							fill="currentColor"
							fontSize={15}
						>
							{`E(${pulses},${steps})`}
						</text>
						<text
							x={CENTER}
							y={CENTER + 18}
							textAnchor="middle"
							className="font-mono text-text-faint"
							fill="currentColor"
							fontSize={11}
						>
							{centreName}
						</text>
					</svg>
				</div>

				<div className="flex flex-col gap-5">
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<span className="flex items-baseline justify-between gap-3">
								<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">Steps</span>
								<span className="text-label-12-mono text-text-faint">{steps}</span>
							</span>
							<input
								type="range"
								min={MIN_STEPS}
								max={MAX_STEPS}
								step={1}
								value={steps}
								onChange={(event) => handleSteps(Number(event.target.value))}
								className="w-full accent-brand"
								aria-label="Steps"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<span className="flex items-baseline justify-between gap-3">
								<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">Pulses</span>
								<span className="text-label-12-mono text-text-faint">{pulses}</span>
							</span>
							<input
								type="range"
								min={1}
								max={steps}
								step={1}
								value={pulses}
								onChange={(event) => handlePulses(Number(event.target.value))}
								className="w-full accent-brand"
								aria-label="Pulses"
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<span className="flex items-baseline justify-between gap-3">
								<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">Tempo</span>
								<span className="text-label-12-mono text-text-faint">{bpm} BPM</span>
							</span>
							<input
								type="range"
								min={MIN_BPM}
								max={MAX_BPM}
								step={1}
								value={bpm}
								onChange={(event) => setBpm(Number(event.target.value))}
								className="w-full accent-brand"
								aria-label="Tempo in beats per minute"
							/>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">From the catalogue</span>
						<div className="flex flex-wrap gap-2">
							{RHYTHM_PRESETS.map((entry) => {
								const active = presetSlug === entry.slug;
								return (
									<button
										key={entry.slug}
										type="button"
										onClick={() => handlePreset(entry)}
										aria-pressed={active}
										className={cn(
											"flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]",
											active
												? "border-brand/60 bg-brand/10"
												: "border-border bg-background hover:border-alpha-500 hover:bg-muted",
										)}
									>
										<span className="text-label-13 text-foreground">{entry.name}</span>
										<span className="text-label-12-mono text-text-faint">
											{entry.origin} · E({entry.pulses},{entry.steps})
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
				<p className="max-w-md text-copy-14 text-text-muted">
					Press play to hear the loop; the sliders and chips apply while it runs. The first pulse of
					each cycle is accented.
				</p>
				<Button onClick={handleToggle}>{playing ? "Stop" : "Play"}</Button>
			</div>
			{note ? <p className="mt-2 text-copy-13 text-text-faint">{note}</p> : null}
			<p className="mt-4 text-copy-13 text-text-faint">
				Rhythms after Toussaint, 2005 -{" "}
				<a
					href="https://www-cgrl.cs.mcgill.ca/~godfried/publications/banff.pdf"
					target="_blank"
					rel="noreferrer"
					className="text-brand transition-opacity hover:opacity-75"
				>
					The Euclidean Algorithm Generates Traditional Musical Rhythms
				</a>{" "}
				(Renaissance Banff, pp. 47-56). The pattern is computed in your browser; nothing is fetched.
			</p>
		</div>
	);
}
