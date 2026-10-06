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
// - Non-production hosts get `X-Robots-Tag: noindex, nofollow` on every
//   response. The header is authoritative for crawlers that support it
//   (all major engines do) and applies even where a page's own meta robots
//   tag says otherwise.
// - The bare dev host is an alias: send browsers to the canonical preview
//   URL so older links keep working. This branch only fires once it reaches
//   `main` (the bare host serves the production build; branch previews are
//   served on the dev branch build).
//
// The host is read from the raw Host header (port stripped): request.nextUrl
// does not carry the real host reliably in every runtime.

const PROD_HOSTS = new Set(["thatssoheil.website", "www.thatssoheil.website"]);
const BARE_DEV_HOST = "dev.thatssoheil.website";
const CANONICAL_PREVIEW_HOST = "dev.dev.thatssoheil.website";

export function proxy(request: NextRequest) {
	const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();

	if (host === BARE_DEV_HOST) {
		const url = request.nextUrl.clone();
		url.protocol = "https:";
		url.host = CANONICAL_PREVIEW_HOST;
		url.port = "";
		return NextResponse.redirect(url, 307);
	}

	const response = NextResponse.next();
	if (!PROD_HOSTS.has(host)) {
		response.headers.set("X-Robots-Tag", "noindex, nofollow");
	}
	return response;
}
