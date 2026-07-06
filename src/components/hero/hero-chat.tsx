"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useHeroChat } from "@/hooks/use-hero-chat";
import { STARTERS } from "@/lib/ai-soheil/starters";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { surfaceRole } from "@/components/ui/surface";
import { ChatMessageRow } from "@/components/hero/chat-message";
import { CipherLoader } from "@/components/hero/cipher-loader";
import { typeRole } from "@/components/ui/typography";
import type { ChatError } from "@/hooks/use-hero-chat";

const ERROR_COPY: Record<NonNullable<ChatError>, string> = {
	signal_dropped: "signal dropped. try again.",
	rate_limited: "too many. give it a moment.",
	unavailable: "chat is offline for now.",
};

// The resting prompt-bar height (also the input-row height, and the collapsed box height).
const BAR_H = "3.25rem";
// The fixed open height. The box settles here and the transcript scrolls inside it —
// new messages never grow the box past this.
const OPEN_H = "27rem";

/**
 * The hero chat — one integrated box. Closed, it's just the prompt bar; on first send
 * the SAME container grows downward to a fixed height (transcript above the same
 * persistent input). The transcript is a scroll area pinned to the latest message, so
 * the conversation scrolls inside the box rather than stretching it. The closed-bar
 * footprint is reserved so the hero never shifts; the box overlays the fading chips.
 */
export function HeroChat() {
	const { messages, status, error, send, retry, reset } = useHeroChat();
	const [active, setActive] = useState(false);
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement | null>(null);
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const boxWrapRef = useRef<HTMLDivElement | null>(null);
	const busy = status === "decoding" || status === "streaming";

	const smooth = (): ScrollBehavior =>
		window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

	// Center the *expanded* box in the viewport. The wrapper's position is stable
	// (the box overlays it), so we can aim at the final height before it paints.
	const scrollBoxToCenter = () => {
		const el = boxWrapRef.current;
		if (!el) return;
		const openPx = parseFloat(OPEN_H) * 16;
		const boxTop = el.getBoundingClientRect().top + window.scrollY;
		const target = boxTop + openPx / 2 - window.innerHeight / 2;
		window.scrollTo({ top: Math.max(0, target), behavior: smooth() });
	};

	// Close settles the page back to the full hero (the first section, at the top).
	const scrollToHero = () => window.scrollTo({ top: 0, behavior: smooth() });

	const submit = (text: string) => {
		const content = text.trim();
		if (!content) return;
		if (!active) {
			setActive(true);
			scrollBoxToCenter();
		}
		setValue("");
		send(content);
		// Keep the cursor in the composer so the next message can be typed straight away
		// (sending via a chip moves focus to the chip; Enter would otherwise blur on a
		// transient disable). The input stays enabled — only the submit button gates.
		inputRef.current?.focus();
	};

	const close = () => {
		setActive(false);
		setValue("");
		reset();
		scrollToHero();
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
		viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight });
	}, [messages, status]);

	// Mark the document while expanded so the section below can recede (see globals.css).
	useEffect(() => {
		if (!active) return;
		const root = document.documentElement;
		root.setAttribute("data-chat-open", "");
		return () => {
			root.removeAttribute("data-chat-open");
		};
	}, [active]);

	return (
		<div className="mt-9 flex w-full max-w-2xl flex-col items-center select-text">
			{/* Reserve the closed-bar height so the hero never shifts; the box overlays down. */}
			<div ref={boxWrapRef} className="relative w-full" style={{ height: BAR_H }}>
				<div
					role="region"
					aria-label="Chat with Soheil"
					className={cn(
						"absolute inset-x-0 top-0 z-20 flex flex-col overflow-hidden origin-top",
						"transition-[height] duration-500 ease-[var(--ease-swift)] motion-reduce:transition-none",
						surfaceRole.heroChatPanel,
						active && "shadow-[var(--shadow-elevated)]",
					)}
					style={{ height: active ? OPEN_H : BAR_H }}
				>
					{/* transcript — a fixed-height scroll area above the input; collapses to 0
					    when closed. Radix's viewport content wrapper is forced (via its stable
					    data attr) to a full-height flex column so the conversation bottom-anchors
					    just over the input; the scroll effect keeps the latest in view. */}
					<ScrollArea
						viewportRef={viewportRef}
						className={cn(
							"min-h-0 flex-1",
							"[&_[data-radix-scroll-area-viewport]>div]:!flex [&_[data-radix-scroll-area-viewport]>div]:!min-h-full [&_[data-radix-scroll-area-viewport]>div]:!flex-col [&_[data-radix-scroll-area-viewport]>div]:!justify-end",
						)}
					>
						<div className="px-5 py-5 text-left">
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
										<span className={`text-destructive ${typeRole.chatStatus}`}>
											{ERROR_COPY[error]}
										</span>
										<button
											type="button"
											onClick={retry}
											className={`rounded-xl border border-alpha-300 px-3 py-1 text-text-faint transition-colors hover:border-alpha-500 hover:bg-alpha-100 hover:text-foreground ${typeRole.chatAction}`}
										>
											retry
										</button>
									</div>
								)}
							</div>
						</div>
					</ScrollArea>

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
							placeholder={busy ? "…" : active ? "reply…" : "ask me anything. no resume here"}
							aria-label={active ? "Reply to Soheil" : "Ask Soheil anything"}
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
						className={`rounded-xl border border-alpha-300 px-3.5 py-1.5 text-text-faint transition-colors hover:border-alpha-500 hover:bg-alpha-100 hover:text-foreground ${typeRole.chatStarter}`}
					>
						{s}
					</button>
				))}
			</div>
		</div>
	);
}
