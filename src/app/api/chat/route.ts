import { getCloudflareContext } from "@opennextjs/cloudflare";
import { buildSystemPrompt } from "@/lib/ai-soheil/prompt";
import { checkRateLimit, clientKey } from "@/lib/ai-soheil/rate-limit";
import {
	MAX_MESSAGES,
	MAX_MESSAGE_CHARS,
	MAX_TOTAL_CHARS,
	type ChatMessage,
	type ChatRequestBody,
} from "@/lib/ai-soheil/types";

const json = (data: unknown, status: number) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});

/** Validate + normalize the client payload. Returns null on anything malformed. */
function sanitize(input: unknown): ChatMessage[] | null {
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

export async function POST(req: Request): Promise<Response> {
	const { env } = getCloudflareContext();

	const rl = await checkRateLimit(env.CHAT_RATELIMIT, clientKey(req));
	if (!rl.allowed) return json({ error: "rate_limited" }, 429);

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return json({ error: "bad_request" }, 400);
	}
	const messages = sanitize(body);
	if (!messages) return json({ error: "bad_request" }, 400);

	let upstream: Response;
	try {
		upstream = await fetch(`${env.FREELLMAPI_URL}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.FREELLMAPI_KEY}`,
			},
			body: JSON.stringify({
				model: "auto",
				stream: true,
				messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
			}),
		});
	} catch {
		return json({ error: "signal_dropped" }, 502);
	}

	if (!upstream.ok || !upstream.body) return json({ error: "signal_dropped" }, 502);

	// Relay the upstream OpenAI-style SSE stream straight through to the browser.
	return new Response(upstream.body, {
		headers: {
			"Content-Type": "text/event-stream; charset=utf-8",
			"Cache-Control": "no-cache, no-transform",
		},
	});
}
