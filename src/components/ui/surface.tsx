import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

export const surfaceLayer = {
	canvas: "bg-kumo-canvas",
	base: "bg-kumo-base",
	elevated: "bg-kumo-elevated",
	recessed: "bg-kumo-recessed",
	control: "bg-kumo-control",
	overlay: "bg-kumo-overlay",
} as const;

export type SurfaceLayer = keyof typeof surfaceLayer;

export const surfaceRole = {
	commandMenuPanel: "bg-kumo-elevated rounded-lg shadow-xs ring ring-kumo-line",
} as const;

function Surface({
	className,
	layer = "base",
	asChild = false,
	...props
}: React.ComponentProps<"div"> & {
	layer?: SurfaceLayer;
	asChild?: boolean;
}) {
	const Comp = asChild ? Slot.Root : "div";

	return (
		<Comp
			data-slot="surface"
			data-layer={layer}
			className={cn(surfaceLayer[layer], className)}
			{...props}
		/>
	);
}

export { Surface };
