"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useHeroChat } from "@/hooks/use-hero-chat";
import { STARTERS } from "@/lib/ai-soheil/starters";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { surfaceVariants } from "@/components/ui/surface";
import { ChatMessageRow } from "@/components/hero/chat-message";
import { CipherLoader } from "@/components/hero/cipher-loader";
import type { ChatError } from "@/hooks/use-hero-chat";

const ERROR_COPY: Record<NonNullable<ChatError>, string> = {
	signal_dropped: "signal dropped — try again.",
	rate_limited: "too many — give it a moment.",
};

// The resting prompt-bar height (also the input-row height, and the collapsed box height).
const BAR_H = "3.25rem";

/**
 * The hero chat — one integrated box. Closed, it's just the prompt bar; on first send
 * the SAME container grows downward into the conversation (transcript below the same
 * persistent input), as a CSS max-height transition. The closed-bar footprint is
 * reserved so the hero never shifts; the box overlays the (fading) starter chips below.
 */
export function HeroChat() {
	const { messages, status, error, send, retry, reset } = useHeroChat();
	const [active, setActive] = useState(false);
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement | null>(null);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const busy = status === "decoding" || status === "streaming";

	const submit = (text: string) => {
		const content = text.trim();
		if (!content) return;
		if (!active) setActive(true);
		setValue("");
		send(content);
	};

	const close = () => {
		setActive(false);
		setValue("");
		reset();
	};

	// Esc settles it back; focus the input on open; keep the transcript pinned to latest.
	useEffect(() => {
		if (!active) return;
		inputRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") close();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [active]);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [messages, status]);

	return (
		<div className="mt-9 flex w-full max-w-2xl flex-col items-center select-text">
			{/* Reserve the closed-bar height so the hero never shifts; the box overlays down. */}
			<div className="relative w-full" style={{ height: BAR_H }}>
				<div
					role="region"
					aria-label="Chat with Soheil"
					className={cn(
						"absolute inset-x-0 top-0 z-20 flex flex-col overflow-hidden origin-top",
						"transition-[max-height] duration-500 ease-[var(--ease-swift)] motion-reduce:transition-none",
						surfaceVariants({ variant: "panel", edge: true, radius: "md" }),
						active ? "max-h-[27rem] shadow-[var(--shadow-elevated)]" : "max-h-[3.25rem]",
					)}
				>
					{/* transcript — fills the box ABOVE the input; collapses to 0 when closed.
					    Bottom-anchored (justify-end) so the latest sits just over the input. */}
					<div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
						<div className="flex min-h-full flex-col justify-end px-5 py-5 text-left">
							<div
								aria-live="polite"
								className="mx-auto flex w-full max-w-[34rem] flex-col gap-6"
							>
								{messages.map((m) => (
									<ChatMessageRow key={m.id} message={m} />
								))}
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
											onClick={retry}
											className="rounded-full border border-border px-3 py-1 font-sans text-[0.7rem] tracking-wide text-text-muted transition-colors hover:border-brand/40 hover:text-brand"
										>
											retry
										</button>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* input row — the prompt bar, pinned to the BOTTOM of the box once open
					    (new messages append above it). Closed, it's the whole box. */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							submit(value);
						}}
						className={cn(
							"flex shrink-0 items-center gap-2 px-4",
							active && "border-t border-border/60",
						)}
						style={{ height: BAR_H }}
					>
						<Input
							ref={inputRef}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							placeholder={busy ? "…" : active ? "reply…" : "ask me anything — no resume here"}
							aria-label={active ? "Reply to Soheil" : "Ask Soheil anything"}
							disabled={busy}
						/>
						{active && (
							<IconButton
								type="button"
								variant="ghost"
								size="sm"
								aria-label="Close chat"
								onClick={close}
							>
								<X />
							</IconButton>
						)}
						<IconButton
							type="submit"
							variant="send"
							size="sm"
							aria-label="Send"
							disabled={busy || !value.trim()}
						>
							<ArrowUp />
						</IconButton>
					</form>
				</div>
			</div>

			{/* starter chips — fade out while chatting (kept in DOM, not removed) */}
			<div
				className={cn(
					"mt-4 flex flex-wrap items-center justify-center gap-2 transition-opacity duration-300",
					active ? "pointer-events-none opacity-0" : "opacity-100",
				)}
			>
				{STARTERS.map((s) => (
					<button
						key={s}
						type="button"
						onClick={() => submit(s)}
						className="rounded-full border border-border px-3.5 py-1.5 font-sans text-[0.72rem] tracking-wide text-foreground/65 transition-colors hover:border-brand/40 hover:text-brand"
					>
						{s}
					</button>
				))}
			</div>
		</div>
	);
}
