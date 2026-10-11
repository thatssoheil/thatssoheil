export const textRole = {
	default: "text-kumo-default",
	muted: "text-kumo-default opacity-80",
	faint: "text-kumo-default opacity-70",
} as const;

export const typeRole = {
	commandGroupHeading:
		"[&_[cmdk-group-heading]]:text-label [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-kumo-default",
	commandMeta: "text-body-sm text-kumo-default opacity-70",
	manifestoEntryLabel: "text-label font-medium",
} as const;
