import type { ChatMessage } from "@/lib/ai-soheil/types";
import { SoheilLabel } from "@/components/hero/soheil-label";
import { textRole } from "@/components/ui/typography";

/**
 * One transcript row. User turns are a soft, signal-tinted *outline* bubble on the
 * right; Soheil's turns are plain prose on the left under a monospace label with a
 * glowing signal dot — matching the site's restrained, sentence-case voice.
 */
export function ChatMessageRow({ message }: { message: ChatMessage }) {
	if (message.role === "user") {
		return (
			<div className="flex justify-end">
				<div className="max-w-[80%] rounded-2xl rounded-br-lg border border-[color-mix(in_oklch,var(--primary)_45%,transparent)] bg-[color-mix(in_oklch,var(--primary)_14%,transparent)] px-4 py-2.5 text-[0.95rem] leading-relaxed text-foreground">
					{message.content}
				</div>
			</div>
		);
	}
	return (
		<div className="flex flex-col gap-1.5">
			<SoheilLabel />
			<p className={`max-w-[80%] text-[0.98rem] leading-relaxed ${textRole.default}`}>
				{message.content || " "}
			</p>
		</div>
	);
}
