import * as React from "react";

import { cn } from "@/lib/utils";

// Bare text input — sits inside a <Surface> composer that supplies the frame.
function Input({ className, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			data-slot="input"
			className={cn(
				"min-w-0 flex-1 bg-transparent text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-[var(--disabled-opacity)]",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
