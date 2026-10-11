import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-kumo-recessed text-kumo-default",
				outline: "bg-transparent text-kumo-default ring-1 ring-kumo-hairline",
				brand: "bg-kumo-fill-hover text-kumo-link",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant = "default",
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "span";

	return (
		<Comp
			data-slot="badge"
			data-variant={variant}
			className={cn(badgeVariants({ variant, className }))}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
