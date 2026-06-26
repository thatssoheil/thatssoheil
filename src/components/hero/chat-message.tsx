import type { ChatMessage } from "@/lib/ai-soheil/types";

/**
 * One transcript row. User turns are a soft, signal-tinted *outline* bubble on the
 * right; Soheil's turns are plain prose on the left under a monospace label with a
 * glowing signal dot — matching the site's restrained, sentence-case voice.
 */
export function ChatMessageRow({ message }: { message: ChatMessage }) {
	if (message.role === "user") {
		return (
			<div className="flex justify-end">
				<div className="max-w-[80%] rounded-2xl rounded-br-md border border-[color-mix(in_oklch,var(--signal-500)_45%,transparent)] bg-[color-mix(in_oklch,var(--signal-500)_14%,transparent)] px-4 py-2.5 text-[0.95rem] leading-relaxed text-foreground">
					{message.content}
				</div>
			</div>
		);
	}
	return (
		<div className="flex flex-col gap-1.5">
			<span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-brand">
				<span
					aria-hidden
					className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--signal-500)]"
					style={{ filter: "drop-shadow(0 0 5px var(--signal-500))" }}
				/>
				soheil
			</span>
			<p className="max-w-[80%] text-[0.98rem] leading-relaxed text-foreground/90">
				{message.content || " "}
			</p>
		</div>
	);
}
