"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, X } from "lucide-react";
import { Dialog, VisuallyHidden } from "radix-ui";

import { ChatMessageRow } from "@/components/hero/chat-message";
import { CipherLoader } from "@/components/hero/cipher-loader";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { surfaceRole } from "@/components/ui/surface";
import { typeRole } from "@/components/ui/typography";
import { useHeroChat, type ChatError } from "@/hooks/use-hero-chat";
import { cn } from "@/lib/utils";

const ERROR_COPY: Record<NonNullable<ChatError>, string> = {
	signal_dropped: "signal dropped. try again.",
	rate_limited: "too many. give it a moment.",
	unavailable: "chat is offline for now.",
};

interface AskConsoleProps {
	initialPrompt: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onInitialPromptConsumed: () => void;
}

export function AskConsole({
	initialPrompt,
	open,
	onOpenChange,
	onInitialPromptConsumed,
}: AskConsoleProps) {
	const { messages, status, error, send, retry, reset } = useHeroChat();
	const [value, setValue] = useState("");
	const inputRef = useRef<HTMLInputElement | null>(null);
	const viewportRef = useRef<HTMLDivElement | null>(null);
	const consumedPromptRef = useRef<string | null>(null);
	const busy = status === "decoding" || status === "streaming";

	useEffect(() => {
		if (open) inputRef.current?.focus();
	}, [open]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			consumedPromptRef.current = null;
			setValue("");
			reset();
		}
		onOpenChange(nextOpen);
	};

	useEffect(() => {
		if (!open || !initialPrompt) return;
		if (consumedPromptRef.current === initialPrompt) return;
		consumedPromptRef.current = initialPrompt;
		onInitialPromptConsumed();
		send(initialPrompt);
	}, [initialPrompt, onInitialPromptConsumed, open, send]);

	useEffect(() => {
		viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight });
	}, [messages, status]);

	const submit = (text: string) => {
		const content = text.trim();
		if (!content || busy) return;
		setValue("");
		send(content);
		inputRef.current?.focus();
	};

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/70 backdrop-blur-sm" />
				<Dialog.Content
					aria-describedby={undefined}
					className={cn(
						surfaceRole.commandMenuPanel,
						"fixed left-1/2 top-[11vh] z-[var(--z-modal)] grid h-[min(78svh,36rem)] w-[92vw] max-w-2xl -translate-x-1/2 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden text-popover-foreground outline-none sm:top-[12vh]",
					)}
				>
					<VisuallyHidden.Root>
						<Dialog.Title>Ask Soheil</Dialog.Title>
					</VisuallyHidden.Root>
					<header className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
						<div>
							<p className={`text-foreground uppercase ${typeRole.commandMeta}`}>
								Ask Soheil
							</p>
							<p className="text-xs text-text-faint">
								work, availability, projects, contact
							</p>
						</div>
						<Dialog.Close asChild>
							<IconButton
								type="button"
								variant="ghost"
								size="sm"
								aria-label="Close chat"
							>
								<X />
							</IconButton>
						</Dialog.Close>
					</header>

					<ScrollArea
						viewportRef={viewportRef}
						className="[&_[data-radix-scroll-area-viewport]>div]:!min-h-full"
					>
						<div
							aria-live="polite"
							className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-end gap-6 px-5 py-5"
						>
							{messages.length === 0 && status === "idle" && (
								<p className="text-sm text-text-faint">
									Ask about the work, the taste, or how to reach me.
								</p>
							)}
							{messages.map((message) => (
								<ChatMessageRow key={message.id} message={message} />
							))}
							{status === "decoding" && <CipherLoader />}
							{status === "error" && error && (
								<div className="flex items-center gap-3" role="alert">
									<span className={`text-destructive ${typeRole.chatStatus}`}>
										{ERROR_COPY[error]}
									</span>
									{error !== "unavailable" && (
										<button
											type="button"
											onClick={retry}
											className={`rounded-xl border border-alpha-300 px-3 py-1 text-text-faint transition-colors hover:border-alpha-500 hover:bg-alpha-100 hover:text-foreground ${typeRole.chatAction}`}
										>
											retry
										</button>
									)}
								</div>
							)}
						</div>
					</ScrollArea>

					<form
						onSubmit={(event) => {
							event.preventDefault();
							submit(value);
						}}
						className="flex min-h-14 items-center gap-2 border-t border-border px-4 sm:px-5"
					>
						<Input
							ref={inputRef}
							value={value}
							onChange={(event) => setValue(event.target.value)}
							placeholder={busy ? "..." : "ask about soheil..."}
							aria-label="Ask Soheil"
						/>
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
