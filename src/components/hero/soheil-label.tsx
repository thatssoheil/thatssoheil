import { typeRole } from "@/components/ui/typography";

/**
 * The monospace "soheil" attribution label with a glowing signal dot — shown
 * above each assistant turn and beside the decoding loader. One source of truth
 * so the label's voice and accent stay in sync across the chat.
 */
export function SoheilLabel() {
	return (
		<span className={`flex items-center gap-2 text-brand ${typeRole.chatAttribution}`}>
			<span
				aria-hidden
				className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
				style={{ filter: "drop-shadow(0 0 5px var(--primary))" }}
			/>
			soheil
		</span>
	);
}
