import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border-0 font-medium shadow-xs outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "bg-kumo-base text-kumo-default ring ring-kumo-line hover:bg-kumo-fill-hover",
				primary: "bg-kumo-brand text-white hover:bg-kumo-brand-hover",
				secondary: "bg-kumo-base text-kumo-default ring ring-kumo-line hover:bg-kumo-fill-hover",
				outline: "bg-transparent text-kumo-default ring ring-kumo-line hover:bg-kumo-fill-hover",
				ghost: "bg-transparent text-kumo-default shadow-none hover:bg-kumo-fill-hover",
				link: "bg-transparent text-kumo-link shadow-none underline underline-offset-4 hover:text-kumo-brand-hover",
				// The site has not adopted Kumo's danger token; keep this action neutral.
				destructive: "bg-kumo-recessed text-kumo-default ring ring-kumo-line hover:bg-kumo-fill-hover",
			},
			size: {
				default: "h-9 px-3 text-base",
				xs: "h-6 gap-1 px-2 text-sm",
				sm: "h-8 gap-1.5 px-3 text-sm",
				lg: "h-10 gap-2 px-4 text-base",
				icon: "size-9 p-0",
				"icon-sm": "size-8 p-0",
				"icon-lg": "size-10 p-0",
			},
		},
		defaultVariants: {
			variant: "secondary",
			size: "default",
		},
	},
);

function Button({
	className,
	variant = "secondary",
	size = "default",
	asChild = false,
	...props
}: Omit<React.ComponentProps<"button">, "size"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
