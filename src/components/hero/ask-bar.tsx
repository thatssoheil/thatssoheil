"use client";

import { STARTERS } from "@/lib/ai-soheil/starters";
import { PromptBar } from "@/components/hero/prompt-bar";

interface AskBarProps {
	value: string;
	onChange: (v: string) => void;
	onSend: (text: string) => void;
}

/**
 * The resting hero affordance: the shared PromptBar ("ask me anything — no resume
 * here") plus curated starter chips. Submitting or tapping a chip hands the text to
 * onSend, which opens the chat dialog.
 */
export function AskBar({ value, onChange, onSend }: AskBarProps) {
	return (
		<div className="mt-9 flex w-full max-w-lg flex-col items-center select-text">
			<PromptBar
				className="w-full"
				frame="field"
				value={value}
				onChange={onChange}
				onSubmit={() => onSend(value)}
				placeholder="ask me anything — no resume here"
				ariaLabel="Ask Soheil anything"
			/>

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
