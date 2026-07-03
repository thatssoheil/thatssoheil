import { getCloudflareContext } from "@opennextjs/cloudflare";
import { buildSystemPrompt } from "@/lib/ai-soheil/prompt";
import { checkRateLimit, clientKey } from "@/lib/ai-soheil/rate-limit";
import { parseChatRequest } from "@/lib/ai-soheil/types";

const json = (data: unknown, status: number) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});

// Block browser cross-origin abuse of the paid endpoint (audit #5). Trust the
// Fetch-Metadata header when present; fall back to comparing Origin host to our
// own. Absent both (e.g. a header-less client), allow and lean on the rate limit —
// we never want to false-reject a legitimate same-origin request.
function isCrossOrigin(req: Request): boolean {
	const site = req.headers.get("sec-fetch-site");
	if (site) return !(site === "same-origin" || site === "same-site");
	const origin = req.headers.get("origin");
	if (origin) {
		try {
			return new URL(origin).host !== new URL(req.url).host;
		} catch {
			return true;
		}
	}
	return false;
}

// Backstop so a 200-then-stall upstream can't pin the worker indefinitely.
const UPSTREAM_TIMEOUT_MS = 45_000;

export async function POST(req: Request): Promise<Response> {
	const { env } = getCloudflareContext();

	// Feature flag — ship without chat until the feature is ready.
	if (env.ENABLE_CHAT !== "true") {
		return new Response("Not Found", { status: 404 });
	}

	if (isCrossOrigin(req)) return json({ error: "forbidden" }, 403);

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
		upstream = await fetch(`${env.AI_SOHEIL_API_URL}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${env.AI_SOHEIL_API_KEY}`,
			},
			body: JSON.stringify({
				model: "auto",
				stream: true,
				messages: [{ role: "system", content: buildSystemPrompt() }, ...messages],
			}),
			signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
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
