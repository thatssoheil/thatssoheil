import * as React from "react";
import { cn } from "@/lib/utils";

const inputClassName =
	"flex h-9 w-full min-w-0 rounded-lg border border-kumo-line bg-kumo-control px-3 py-2 text-base text-kumo-default outline-none placeholder:text-kumo-default placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-kumo-focus disabled:cursor-not-allowed disabled:opacity-50";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<input
			data-slot="input"
			type={type}
			className={cn(inputClassName, className)}
			{...props}
		/>
	);
}

export { Input, inputClassName };
