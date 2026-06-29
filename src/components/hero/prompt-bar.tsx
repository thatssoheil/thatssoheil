"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { surfaceVariants } from "@/components/ui/surface";

interface PromptBarProps {
	value: string;
	onChange: (v: string) => void;
	onSubmit: () => void;
	placeholder: string;
	ariaLabel: string;
	disabled?: boolean;
	/** `glass` = resting bar over the field; `plain` = inside the frosted dialog. */
	frame?: "field" | "plain";
	inputRef?: React.Ref<HTMLInputElement>;
	className?: string;
}

/**
 * The one ask/reply composer — an Input + a send IconButton in a framed row. Used by
 * the resting AskBar (glass, over the field) and the in-dialog reply (plain). Replaces
 * the two verbatim-duplicated hand-rolled inputs (audit #1).
 */
export function PromptBar({
	value,
	onChange,
	onSubmit,
	placeholder,
	ariaLabel,
	disabled = false,
	frame = "field",
	inputRef,
	className,
}: PromptBarProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className={cn(
				"flex items-center gap-2 px-4 py-3 transition-colors focus-within:border-brand/50 focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--ring)_18%,transparent)]",
				frame === "field"
					? surfaceVariants({ variant: "chrome", edge: true, radius: "md" })
					: "rounded-2xl border border-input bg-card/40",
				className,
			)}
		>
			<Input
				ref={inputRef}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				aria-label={ariaLabel}
				disabled={disabled}
			/>
			<IconButton
				type="submit"
				variant="send"
				size="sm"
				aria-label="Send"
				disabled={disabled || !value.trim()}
			>
				<ArrowUp />
			</IconButton>
		</form>
	);
}
