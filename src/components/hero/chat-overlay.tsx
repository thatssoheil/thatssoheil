"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/ai-soheil/types";
import type { ChatError, ChatStatus } from "@/hooks/use-hero-chat";
import { ChatMessageRow } from "@/components/hero/chat-message";
import { CipherLoader } from "@/components/hero/cipher-loader";

interface ChatOverlayProps {
	messages: ChatMessage[];
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
 * The dimmed, non-modal chat takeover. A fixed layer blurs the site behind it; page
 * scroll stays live and Esc/✕ dismiss (no focus trap — focus simply moves to the
 * input on open). Renders the transcript, the cipher "decoding" beat, any inline
 * error with a retry, and the pinned reply input.
 */
export function ChatOverlay({
	messages,
	status,
	error,
	value,
	onChange,
	onSend,
	onClose,
	onRetry,
}: ChatOverlayProps) {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const busy = status === "decoding" || status === "streaming";

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [messages, status]);

	return (
		<div className="glass glass-strong fixed inset-0 z-[var(--z-modal)] flex flex-col select-text">
			{/* header: shrunk cipher wordmark + close */}
			<div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-8">
				<div className="flex flex-col">
					<span className="[font-family:var(--font-cipher)] text-[0.95rem] font-light tracking-wide text-foreground">
						Soheil Fakour
					</span>
					<span className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-brand/80">
						ask · don&apos;t scroll
					</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close chat"
					className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/60 transition-colors hover:border-brand/40 hover:text-brand"
				>
					✕
				</button>
			</div>

			{/* transcript */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-7 sm:px-8">
				<div className="mx-auto flex max-w-[42rem] flex-col gap-7" aria-live="polite">
					{messages.map((m, i) => (
						<ChatMessageRow key={i} message={m} />
					))}
					{status === "decoding" && (
						<div className="pl-0.5">
							<CipherLoader />
						</div>
					)}
					{status === "error" && error && (
						<div className="flex items-center gap-3">
							<span className="font-mono text-[0.8rem] tracking-wide text-destructive">
								{ERROR_COPY[error]}
							</span>
							<button
								type="button"
								onClick={onRetry}
								className="rounded-full border border-border px-3 py-1 font-mono text-[0.7rem] tracking-wide text-foreground/70 transition-colors hover:border-brand/40 hover:text-brand"
							>
								retry
							</button>
						</div>
					)}
				</div>
			</div>

			{/* pinned reply input */}
			<div className="border-t border-border/60 px-5 py-4 sm:px-8">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSend(value);
					}}
					className="mx-auto flex max-w-[42rem] items-center gap-2 rounded-2xl border border-input bg-card/40 px-4 py-3 transition-colors focus-within:border-brand/50 focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--signal-500)_18%,transparent)]"
				>
					<input
						ref={inputRef}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={busy ? "…" : "reply…"}
						disabled={busy}
						aria-label="Reply to Soheil"
						className="min-w-0 flex-1 bg-transparent text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
					/>
					<button
						type="submit"
						aria-label="Send"
						disabled={busy || !value.trim()}
						className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--signal-500)] text-[var(--ink-50)] transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
					>
						↑
					</button>
				</form>
			</div>
		</div>
	);
}
