/**
 * The monospace "soheil" attribution label with a glowing signal dot — shown
 * above each assistant turn and beside the decoding loader. One source of truth
 * so the label's voice and accent stay in sync across the chat.
 */
export function SoheilLabel() {
	return (
		<span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-brand">
			<span
				aria-hidden
				className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--signal-500)]"
				style={{ filter: "drop-shadow(0 0 5px var(--signal-500))" }}
			/>
			soheil
		</span>
	);
}
