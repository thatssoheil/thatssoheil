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
