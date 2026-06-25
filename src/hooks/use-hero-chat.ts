"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/ai-soheil/types";

export type ChatStatus = "idle" | "decoding" | "streaming" | "error";
export type ChatError = "signal_dropped" | "rate_limited" | null;

export interface UseHeroChat {
	messages: ChatMessage[];
	status: ChatStatus;
	error: ChatError;
	send: (text: string) => void;
	reset: () => void;
}

/**
 * Drives the hero chat: POSTs to /api/chat, streams the OpenAI-style SSE, and
 * appends only `delta.content` (reasoning chunks are ignored). The thread lives
 * here — the page is stateless. A ref mirrors the messages so streaming updates
 * never read a stale closure.
 */
export function useHeroChat(): UseHeroChat {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [status, setStatus] = useState<ChatStatus>("idle");
	const [error, setError] = useState<ChatError>(null);

	const messagesRef = useRef<ChatMessage[]>([]);
	const abortRef = useRef<AbortController | null>(null);
	const busyRef = useRef(false);

	const commit = useCallback((next: ChatMessage[]) => {
		messagesRef.current = next;
		setMessages(next);
	}, []);

	const reset = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		busyRef.current = false;
		commit([]);
		setStatus("idle");
		setError(null);
	}, [commit]);

	const send = useCallback(
		(text: string) => {
			const content = text.trim();
			if (!content || busyRef.current) return;
			busyRef.current = true;

			const outgoing: ChatMessage[] = [...messagesRef.current, { role: "user", content }];
			commit(outgoing);
			setError(null);
			setStatus("decoding");

			const controller = new AbortController();
			abortRef.current = controller;

			void (async () => {
				try {
					const res = await fetch("/api/chat", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ messages: outgoing }),
						signal: controller.signal,
					});

					if (res.status === 429) {
						setError("rate_limited");
						setStatus("error");
						return;
					}
					if (!res.ok || !res.body) {
						setError("signal_dropped");
						setStatus("error");
						return;
					}

					const reader = res.body.getReader();
					const decoder = new TextDecoder();
					let buf = "";
					let started = false;

					for (;;) {
						const { done, value } = await reader.read();
						if (done) break;
						buf += decoder.decode(value, { stream: true });
						const lines = buf.split("\n");
						buf = lines.pop() ?? "";
						for (const line of lines) {
							const t = line.trim();
							if (!t.startsWith("data:")) continue;
							const payload = t.slice(5).trim();
							if (!payload || payload === "[DONE]") continue;
							let delta: unknown;
							try {
								delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
							} catch {
								continue;
							}
							if (typeof delta !== "string" || delta.length === 0) continue;
							if (!started) {
								started = true;
								setStatus("streaming");
								commit([...messagesRef.current, { role: "assistant", content: delta }]);
							} else {
								const cur = messagesRef.current;
								const last = cur[cur.length - 1];
								commit([
									...cur.slice(0, -1),
									{ role: "assistant", content: (last?.content ?? "") + delta },
								]);
							}
						}
					}

					// No content delta ever arrived (e.g. a reasoning-only / empty reply).
					if (!started) {
						setError("signal_dropped");
						setStatus("error");
					} else {
						setStatus("idle");
					}
				} catch (e) {
					if ((e as Error)?.name !== "AbortError") {
						setError("signal_dropped");
						setStatus("error");
					}
				} finally {
					abortRef.current = null;
					busyRef.current = false;
				}
			})();
		},
		[commit],
	);

	return { messages, status, error, send, reset };
}
