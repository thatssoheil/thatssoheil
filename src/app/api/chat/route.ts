import { getCloudflareContext } from "@opennextjs/cloudflare";
import { buildSystemPrompt } from "@/lib/ai-soheil/prompt";
import { checkRateLimit, clientKey } from "@/lib/ai-soheil/rate-limit";
import { parseChatRequest } from "@/lib/ai-soheil/types";

const json = (data: unknown, status: number) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});

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
	const messages = parseChatRequest(body);
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
