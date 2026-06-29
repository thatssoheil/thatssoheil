"use client";

import { useEffect, useRef } from "react";
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

interface ChatPanelProps {
	active: boolean;
	messages: UiMessage[];
	status: ChatStatus;
	error: ChatError;
	value: string;
	onChange: (v: string) => void;
	onSend: (text: string) => void;
	onClose: () => void;
	onRetry: () => void;
}

const ERROR_COPY: Record<NonNullable<ChatError>, string> = {
	signal_dropped: "signal dropped — try again.",
	rate_limited: "too many — give it a moment.",
};

/**
 * The conversation surface that LIFTS out of the hero square (not a full-page modal).
 * Inactive it's a collapsed, blurred ghost centered on the square; on first prompt it
 * springs up to a glass card, frosting the name behind it. Transform/opacity only so it
 * stays smooth on phones; `inert` + focus management when closed. Esc + ✕ settle it back.
 */
export function ChatPanel({
	active,
	messages,
	status,
	error,
	value,
	onChange,
	onSend,
	onClose,
	onRetry,
}: ChatPanelProps) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const busy = status === "decoding" || status === "streaming";
	const refract = useRefractionSupported();

	// Focus in on open; return focus to whatever opened it on close.
	useEffect(() => {
		if (active) {
			triggerRef.current = document.activeElement as HTMLElement | null;
			inputRef.current?.focus();
		} else {
			triggerRef.current?.focus?.();
		}
	}, [active]);

	// Esc settles it back.
	useEffect(() => {
		if (!active) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [active, onClose]);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [messages, status]);

	return (
		<div
			role="dialog"
			aria-modal="false"
			aria-label="Chat with Soheil"
			aria-hidden={!active}
			inert={!active ? true : undefined}
			className={cn(
				"absolute inset-0 z-20 m-auto h-[min(78svh,34rem)] w-[min(92vw,40rem)]",
				"flex flex-col overflow-hidden origin-center will-change-transform",
				"transition-[opacity,transform,box-shadow] duration-[var(--dur-page)] ease-[var(--ease-swift)] motion-reduce:transition-none",
				surfaceVariants({
					variant: refract ? "refract" : "strong",
					edge: true,
					radius: "lg",
				}),
				active
					? "scale-100 translate-y-0 opacity-100 pointer-events-auto shadow-[var(--shadow-elevated)]"
					: "scale-[0.82] translate-y-5 opacity-0 pointer-events-none shadow-none",
			)}
		>
			{/* Chromium-only: refract the field + frosted name behind the lifted card. */}
			{refract && active && <SignalGlassFilter />}

			{/* header — the cipher wordmark echoes the hero name it rose from */}
			<div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-7">
				<div className="flex flex-col">
					<span className="[font-family:var(--font-cipher)] text-[0.95rem] font-light tracking-wide text-foreground">
						Soheil Fakour
					</span>
					<span className="font-sans text-[0.58rem] uppercase tracking-[0.24em] text-brand/80">
						ask · don&apos;t scroll
					</span>
				</div>
				<IconButton variant="ghost" aria-label="Close chat" onClick={onClose}>
					<X />
				</IconButton>
			</div>

			{/* transcript */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
				<div className="mx-auto flex max-w-[34rem] flex-col gap-7">
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
			<div className="border-t border-border/60 px-5 py-4 sm:px-7">
				<PromptBar
					className="mx-auto max-w-[34rem]"
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
		</div>
	);
}
