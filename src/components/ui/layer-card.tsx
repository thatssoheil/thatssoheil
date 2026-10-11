"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const layerCardContext = React.createContext(false);

const layerCardClasses = {
	base: "bg-kumo-base shadow-xs ring ring-kumo-line",
	elevated: "bg-kumo-elevated shadow-xs ring ring-kumo-line",
	recessed: "bg-kumo-recessed ring-1 ring-kumo-hairline",
} as const;

type LayerCardProps = React.ComponentProps<"div"> & {
	layer?: keyof typeof layerCardClasses;
	asChild?: boolean;
};

function LayerCard({
	className,
	layer = "base",
	asChild = false,
	...props
}: LayerCardProps) {
	const nested = React.useContext(layerCardContext);
	if (nested) {
		throw new Error("LayerCard cannot be nested inside another LayerCard.");
	}

	const Comp = asChild ? Slot.Root : "div";
	return (
		<layerCardContext.Provider value={true}>
			<Comp
				data-slot="layer-card"
				data-layer={layer}
				className={cn("overflow-hidden rounded-lg", layerCardClasses[layer], className)}
				{...props}
			/>
		</layerCardContext.Provider>
	);
}

export { LayerCard };
