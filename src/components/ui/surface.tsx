import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

// The one entry point for glass. The raw .glass-* classes (globals.css) are internal
// building blocks; product surfaces compose them through this primitive so the material,
// the edge, and the radius law live in a single place (ADR-0002, audit #9).
const surfaceVariants = cva("", {
	variants: {
		// chrome  = translucent bars/inputs/overlays · panel = near-solid reading content
		// strong  = deep-blur takeover (compose with the chat dialog)
		variant: {
			chrome: "glass",
			panel: "glass-panel",
			strong: "glass glass-strong",
			// Chromium-only field refraction (gate on useRefractionSupported); falls
			// back to `strong` everywhere else. Needs <SignalGlassFilter/> mounted.
			refract: "glass glass-refract",
		},
		edge: {
			true: "glass-edge",
			false: "",
		},
		// The sanctioned radius law — no ad-hoc rounded-* on glass surfaces.
		radius: {
			none: "",
			sm: "rounded-xl",
			md: "rounded-2xl",
			lg: "rounded-3xl",
		},
	},
	defaultVariants: {
		variant: "panel",
		edge: true,
		radius: "md",
	},
});

function Surface({
	className,
	variant,
	edge,
	radius,
	asChild = false,
	...props
}: React.ComponentProps<"div"> &
	VariantProps<typeof surfaceVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "div";
	return (
		<Comp
			data-slot="surface"
			className={cn(surfaceVariants({ variant, edge, radius, className }))}
			{...props}
		/>
	);
}

export { Surface, surfaceVariants };
