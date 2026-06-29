"use client";

import { useEffect, useRef } from "react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ChatError, ChatStatus, UiMessage } from "@/hooks/use-hero-chat";
import { useRefractionSupported } from "@/hooks/use-refraction-supported";
import { ChatMessageRow } from "@/components/hero/chat-message";
import { CipherLoader } from "@/components/hero/cipher-loader";
import { PromptBar } from "@/components/hero/prompt-bar";
import { IconButton } from "@/components/ui/icon-button";
import { surfaceVariants } from "@/components/ui/surface";
import { SignalGlassFilter } from "@/components/signal-field/signal-glass-filter";

interface ChatDialogProps {
	messages: UiMessage[];
	status: ChatStatus;
	error: ChatError;
	value: string;
	onChange: (v: string) => void;
	onSend: (text: string) => void;
	onRetry: () => void;
}

const ERROR_COPY: Record<NonNullable<ChatError>, string> = {
	signal_dropped: "signal dropped — try again.",
	rate_limited: "too many — give it a moment.",
};

/**
 * The chat takeover — now a TRUE modal (Radix Dialog): focus trap, aria-modal,
 * body-scroll lock, Esc + focus-return all come from Radix (audit #3, reversing the
 * old non-modal overlay). The full-viewport Content carries the glass; Chromium adds
 * refraction of the field behind it. Rendered inside a <Dialog.Root> owned by HeroChat.
 */
export function ChatDialog({
	messages,
	status,
	error,
	value,
	onChange,
	onSend,
	onRetry,
}: ChatDialogProps) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const busy = status === "decoding" || status === "streaming";
	const refract = useRefractionSupported();

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [messages, status]);

	return (
		<Dialog.Portal>
			<Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-background/30" />
			<Dialog.Content
				aria-describedby={undefined}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					inputRef.current?.focus();
				}}
				className={cn(
					"fixed inset-0 z-[var(--z-modal)] flex flex-col select-text outline-none",
					surfaceVariants({
						variant: refract ? "refract" : "strong",
						edge: false,
						radius: "none",
					}),
				)}
			>
				<VisuallyHidden.Root>
					<Dialog.Title>Chat with Soheil</Dialog.Title>
				</VisuallyHidden.Root>

				{/* Chromium-only: the SVG filter that refracts the field behind the takeover. */}
				{refract && <SignalGlassFilter />}

				{/* header: shrunk cipher wordmark + close */}
				<div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-8">
					<div className="flex flex-col">
						<span className="[font-family:var(--font-cipher)] text-[0.95rem] font-light tracking-wide text-foreground">
							Soheil Fakour
						</span>
						<span className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-brand/80">
							ask · don&apos;t scroll
						</span>
					</div>
					<Dialog.Close asChild>
						<IconButton variant="ghost" aria-label="Close chat">
							<X />
						</IconButton>
					</Dialog.Close>
				</div>

				{/* transcript */}
				<div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-7 sm:px-8">
					<div className="mx-auto flex max-w-[42rem] flex-col gap-7">
						<div aria-live="polite" className="flex flex-col gap-7">
							{messages.map((m) => (
								<ChatMessageRow key={m.id} message={m} />
							))}
						</div>
						{status === "decoding" && (
							<div className="pl-0.5">
								<CipherLoader />
							</div>
						)}
						{status === "error" && error && (
							<div className="flex items-center gap-3" role="alert">
								<span className="font-sans text-[0.8rem] tracking-wide text-destructive">
									{ERROR_COPY[error]}
								</span>
								<button
									type="button"
									onClick={onRetry}
									className="rounded-full border border-border px-3 py-1 font-sans text-[0.7rem] tracking-wide text-text-muted transition-colors hover:border-brand/40 hover:text-brand"
								>
									retry
								</button>
							</div>
						)}
					</div>
				</div>

				{/* pinned reply composer */}
				<div className="border-t border-border/60 px-5 py-4 sm:px-8">
					<PromptBar
						className="mx-auto max-w-[42rem]"
						frame="plain"
						value={value}
						onChange={onChange}
						onSubmit={() => onSend(value)}
						placeholder={busy ? "…" : "reply…"}
						ariaLabel="Reply to Soheil"
						disabled={busy}
						inputRef={inputRef}
					/>
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	);
}
