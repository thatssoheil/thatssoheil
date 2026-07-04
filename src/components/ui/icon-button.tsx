import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Square/round icon-only button. Replaces the hand-rolled ↑ / ✕ Unicode glyphs with
// real lucide icons passed as children (audit #22). `send` is the signal-fill CTA;
// `ghost` is the bordered chrome control (close, etc.).
const iconButtonVariants = cva(
	"inline-grid place-items-center shrink-0 transition-transform outline-none focus-visible:shadow-[var(--ring-focus)] disabled:opacity-[var(--disabled-opacity)] disabled:pointer-events-none [&_svg]:pointer-events-none",
	{
		variants: {
			variant: {
				send: "rounded-xl bg-primary text-primary-foreground hover:scale-105 active:scale-95",
				ghost:
					"rounded-xl border border-alpha-300 text-text-faint hover:border-alpha-500 hover:bg-alpha-100 hover:text-foreground",
			},
			size: {
				sm: "size-8 [&_svg]:size-4",
				md: "size-9 [&_svg]:size-[1.05rem]",
			},
		},
		defaultVariants: {
			variant: "ghost",
			size: "md",
		},
	},
);

function IconButton({
	className,
	variant,
	size,
	...props
}: React.ComponentProps<"button"> & VariantProps<typeof iconButtonVariants>) {
	return (
		<button
			data-slot="icon-button"
			className={cn(iconButtonVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export { IconButton, iconButtonVariants };
