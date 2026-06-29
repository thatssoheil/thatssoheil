"use client";

import { STARTERS } from "@/lib/ai-soheil/starters";

interface AskBarProps {
	value: string;
	onChange: (v: string) => void;
	onSend: (text: string) => void;
}

/**
 * The resting hero affordance: one input ("ask me anything — no resume here") plus
 * curated starter chips. Submitting the form or tapping a chip hands the text to
 * onSend, which opens the chat takeover.
 */
export function AskBar({ value, onChange, onSend }: AskBarProps) {
	return (
		<div className="mt-9 flex w-full max-w-lg flex-col items-center select-text">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					onSend(value);
				}}
				className="w-full"
			>
				<div className="glass glass-edge flex items-center gap-2 rounded-2xl px-4 py-3 transition-colors focus-within:border-brand/50 focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--signal-500)_18%,transparent)]">
					<input
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder="ask me anything — no resume here"
						aria-label="Ask Soheil anything"
						className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground"
					/>
					<button
						type="submit"
						aria-label="Send"
						className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--signal-500)] text-[var(--ink-50)] transition-transform hover:scale-105 active:scale-95"
					>
						↑
					</button>
				</div>
			</form>

			<div className="mt-4 flex flex-wrap items-center justify-center gap-2">
				{STARTERS.map((s) => (
					<button
						key={s}
						type="button"
						onClick={() => onSend(s)}
						className="rounded-full border border-border px-3.5 py-1.5 font-sans text-[0.72rem] tracking-wide text-foreground/65 transition-colors hover:border-brand/40 hover:text-brand"
					>
						{s}
					</button>
				))}
			</div>
		</div>
	);
}
