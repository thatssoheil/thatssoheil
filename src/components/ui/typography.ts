export const textRole = {
	default: "text-foreground",
	muted: "text-text-muted",
	faint: "text-text-faint",
} as const;

export const typeRole = {
	commandGroupHeading:
		"[&_[cmdk-group-heading]]:font-sans [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em]",
	commandMeta: "font-sans text-[10px]",
	chatAttribution: "font-sans text-[0.62rem] uppercase tracking-[0.24em]",
	chatUserBubble: "text-[0.95rem] leading-relaxed",
	chatAssistantBody: "text-[0.98rem] leading-relaxed",
	chatStatus: "font-sans text-[0.8rem] tracking-wide",
	chatAction: "font-sans text-[0.7rem] tracking-wide",
	chatStarter: "font-sans text-[0.72rem] tracking-wide",
	cipherStatus: "[font-family:var(--font-cipher)] text-[0.95rem] font-light tracking-tighter",
	manifestoEntryLabel: "font-sans text-[11px] tracking-[0.16em] uppercase",
} as const;
