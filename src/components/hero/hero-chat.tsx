"use client";

import { useCallback, useState } from "react";
import { Dialog } from "radix-ui";
import { useHeroChat } from "@/hooks/use-hero-chat";
import { AskBar } from "@/components/hero/ask-bar";
import { ChatDialog } from "@/components/hero/chat-dialog";

/**
 * Orchestrates the hero chat: owns the useHeroChat thread and the dialog open state.
 * Resting shows the AskBar beneath the tagline; the first send (typed or a starter
 * chip) opens the true-modal ChatDialog. The resting input value seeds the first
 * message; thereafter the dialog's own composer drives the thread. Closing the dialog
 * (Esc / ✕ / focus-return — all from Radix) resets the thread.
 */
export function HeroChat() {
	const { messages, status, error, send, retry, reset } = useHeroChat();
	const [active, setActive] = useState(false);
	const [value, setValue] = useState("");

	const handleSend = useCallback(
		(text: string) => {
			const content = text.trim();
			if (!content) return;
			setActive(true);
			setValue("");
			send(content);
		},
		[send],
	);

	const handleOpenChange = useCallback(
		(open: boolean) => {
			if (!open) {
				setActive(false);
				setValue("");
				reset();
			}
		},
		[reset],
	);

	return (
		<>
			<AskBar value={value} onChange={setValue} onSend={handleSend} />
			<Dialog.Root open={active} onOpenChange={handleOpenChange}>
				<ChatDialog
					messages={messages}
					status={status}
					error={error}
					value={value}
					onChange={setValue}
					onSend={handleSend}
					onRetry={retry}
				/>
			</Dialog.Root>
		</>
	);
}
