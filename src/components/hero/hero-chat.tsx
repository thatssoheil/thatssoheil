"use client";

import { useCallback, useState } from "react";
import { useHeroChat } from "@/hooks/use-hero-chat";
import { AskBar } from "@/components/hero/ask-bar";
import { ChatOverlay } from "@/components/hero/chat-overlay";

/**
 * Orchestrates the hero chat: owns the useHeroChat thread and a resting|active view
 * bit. Resting shows the AskBar beneath the tagline; the first send (typed or a
 * starter chip) opens the dimmed ChatOverlay. The resting input value seeds the
 * first message, then the overlay's own input drives the thread.
 */
export function HeroChat() {
	const { messages, status, error, send, reset } = useHeroChat();
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

	const handleClose = useCallback(() => {
		setActive(false);
		setValue("");
		reset();
	}, [reset]);

	// Retry re-sends the most recent user turn (the assistant turn never landed).
	const handleRetry = useCallback(() => {
		const lastUser = [...messages].reverse().find((m) => m.role === "user");
		if (lastUser) send(lastUser.content);
	}, [messages, send]);

	if (active) {
		return (
			<ChatOverlay
				messages={messages}
				status={status}
				error={error}
				value={value}
				onChange={setValue}
				onSend={handleSend}
				onClose={handleClose}
				onRetry={handleRetry}
			/>
		);
	}

	return <AskBar value={value} onChange={setValue} onSend={handleSend} />;
}
