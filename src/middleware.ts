import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Search-engine hygiene for preview surfaces.
//
// Production lives on thatssoheil.website and must stay indexable. Every
// other host that can serve this app - branch previews
// (<branch>.dev.thatssoheil.website), workers.dev previews, the bare
// dev.thatssoheil.website host, local dev servers - is unreleased or
// duplicate content and must never be indexed.
//
// - Matched non-production app responses get `X-Robots-Tag: noindex, nofollow`.
//   The header is authoritative for crawlers that support it (all major engines
//   do) and applies even where a page's own meta robots tag says otherwise. The
//   `/llms.txt` route sets it explicitly as well; Next's internal static/image
//   requests are outside the middleware matcher.
// - The bare dev host is an alias: send browsers to the canonical preview
//   URL so older links keep working. This branch only fires once it reaches
//   `main` (the bare host serves the production build; branch previews are
//   served on the dev branch build).
//
// The host is read from the raw Host header (port stripped): request.nextUrl
// does not carry the real host reliably in every runtime.
//
// Named middleware.ts on purpose: Next 16 renamed the convention to proxy.ts,
// but proxy runs on the Node.js runtime and @opennextjs/cloudflare 1.20.1 only
// supports Edge middleware - the build fails on a proxy.ts file. Keep this on
// the middleware convention until OpenNext supports Node proxies.

const PROD_HOSTS = new Set(["thatssoheil.website", "www.thatssoheil.website"]);
const BARE_DEV_HOST = "dev.thatssoheil.website";
const CANONICAL_PREVIEW_HOST = "dev.dev.thatssoheil.website";

// Pragmatic baseline: inline scripts remain allowed for Next.js streaming and
// the theme bootstrap. Do not add a hash or nonce here; browsers would ignore
// 'unsafe-inline' and block other framework-generated inline scripts.
const SECURITY_HEADERS = {
	"Content-Security-Policy":
		"default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
	"Strict-Transport-Security": "max-age=31536000",
	"X-Frame-Options": "DENY",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"X-Content-Type-Options": "nosniff",
} as const;

export function isProductionHost(host: string | null) {
	const normalizedHost = (host ?? "").split(":")[0].toLowerCase();
	return PROD_HOSTS.has(normalizedHost);
}

export function middleware(request: NextRequest) {
	const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

	if (host === BARE_DEV_HOST) {
		const url = request.nextUrl.clone();
		url.protocol = "https:";
		url.host = CANONICAL_PREVIEW_HOST;
		url.port = "";
		return NextResponse.redirect(url, 307);
	}

	const response = NextResponse.next();
	if (!isProductionHost(host)) {
		response.headers.set("X-Robots-Tag", "noindex, nofollow");
	}
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(name, value);
	}
	return response;
}

// Cover document, route-handler, and generated metadata-image responses. Keep
// Next's immutable static assets and the favicon outside the middleware path.
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
