"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/ai-soheil/types";

export type ChatStatus = "idle" | "decoding" | "streaming" | "error";
export type ChatError = "signal_dropped" | "rate_limited" | null;

/** Abort if no bytes arrive (connect or mid-stream) within this window. */
const STALL_MS = 20_000;

/** A thread message plus a stable UI id, so React keys never reconcile a user
 *  bubble into an assistant slot. The id is stripped before the wire request. */
export interface UiMessage extends ChatMessage {
	id: string;
}

export interface UseHeroChat {
	messages: UiMessage[];
	status: ChatStatus;
	error: ChatError;
	send: (text: string) => void;
	retry: () => void;
	reset: () => void;
}

/**
 * Drives the hero chat: POSTs to /api/chat, streams the OpenAI-style SSE, and
 * appends only `delta.content` (reasoning chunks are ignored). The thread lives
 * here — the page is stateless. A ref mirrors the messages so streaming updates
 * never read a stale closure. `retry()` re-runs the existing thread (which already
 * ends with the failed user turn) WITHOUT appending a duplicate (audit #4).
 */
export function useHeroChat(): UseHeroChat {
	const [messages, setMessages] = useState<UiMessage[]>([]);
	const [status, setStatus] = useState<ChatStatus>("idle");
	const [error, setError] = useState<ChatError>(null);

	const messagesRef = useRef<UiMessage[]>([]);
	const abortRef = useRef<AbortController | null>(null);
	const busyRef = useRef(false);
	const idRef = useRef(0);

	const nextId = () => `m${idRef.current++}`;

	const commit = useCallback((next: UiMessage[]) => {
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

	// Stream a reply for a thread that already ends with the user turn to answer.
	const run = useCallback(
		(thread: UiMessage[]) => {
			busyRef.current = true;
			setError(null);
			setStatus("decoding");

			const controller = new AbortController();
			abortRef.current = controller;

			// Inactivity watchdog: if no bytes arrive for STALL_MS (connect or mid-stream),
			// surface signal_dropped and abort instead of spinning forever (audit #5).
			let watchdog: ReturnType<typeof setTimeout> | undefined;
			const bump = () => {
				if (watchdog) clearTimeout(watchdog);
				watchdog = setTimeout(() => {
					setError("signal_dropped");
					setStatus("error");
					controller.abort();
				}, STALL_MS);
			};

			void (async () => {
				bump();
				try {
					const res = await fetch("/api/chat", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						// Strip UI ids — the wire shape is { role, content }.
						body: JSON.stringify({
							messages: thread.map(({ role, content }) => ({ role, content })),
						}),
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
						bump();
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
								commit([
									...messagesRef.current,
									{ id: nextId(), role: "assistant", content: delta },
								]);
							} else {
								const cur = messagesRef.current;
								const last = cur[cur.length - 1];
								commit([
									...cur.slice(0, -1),
									{ ...last, content: (last?.content ?? "") + delta },
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
					if (watchdog) clearTimeout(watchdog);
					abortRef.current = null;
					busyRef.current = false;
				}
			})();
		},
		[commit],
	);

	const send = useCallback(
		(text: string) => {
			const content = text.trim();
			if (!content || busyRef.current) return;
			const outgoing: UiMessage[] = [
				...messagesRef.current,
				{ id: nextId(), role: "user", content },
			];
			commit(outgoing);
			run(outgoing);
		},
		[commit, run],
	);

	// Re-answer the existing thread (the failed user turn is already committed).
	const retry = useCallback(() => {
		if (busyRef.current) return;
		const cur = messagesRef.current;
		const last = cur[cur.length - 1];
		if (!last || last.role !== "user") return;
		run(cur);
	}, [run]);

	return { messages, status, error, send, retry, reset };
}
