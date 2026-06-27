// Shared types + payload caps for the AI Soheil chat.

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
	role: ChatRole;
	content: string;
}

export interface ChatRequestBody {
	messages: ChatMessage[];
}

/** Per-message and whole-conversation caps — enforced server-side before proxying. */
export const MAX_MESSAGE_CHARS = 2000;
export const MAX_MESSAGES = 24;
export const MAX_TOTAL_CHARS = 12_000;

/**
 * Validate + normalise the raw client payload. Returns the cleaned message
 * array on success, or null on any shape/cap violation. The caps live here so
 * type and policy stay co-located — callers return a generic 400 on null.
 */
export function parseChatRequest(input: unknown): ChatMessage[] | null {
	if (typeof input !== "object" || input === null) return null;
	const raw = (input as ChatRequestBody).messages;
	if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;

	let total = 0;
	const out: ChatMessage[] = [];
	for (const m of raw) {
		if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
			return null;
		}
		const content = m.content.trim();
		if (!content || content.length > MAX_MESSAGE_CHARS) return null;
		total += content.length;
		out.push({ role: m.role, content });
	}
	if (total > MAX_TOTAL_CHARS) return null;
	if (out[out.length - 1].role !== "user") return null;
	return out;
}
