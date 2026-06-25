// Per-IP rate limiting for the chat proxy, backed by the Workers rate-limit
// binding (CHAT_RATELIMIT). Absent binding (local `next dev`) => allow.

/** Per-IP key from Cloudflare's connecting-IP header; falls back to a constant. */
export function clientKey(req: Request): string {
	return req.headers.get("cf-connecting-ip") ?? "anon";
}

export async function checkRateLimit(
	limiter: RateLimit | undefined,
	key: string,
): Promise<{ allowed: boolean }> {
	if (!limiter) return { allowed: true };
	const { success } = await limiter.limit({ key });
	return { allowed: success };
}
