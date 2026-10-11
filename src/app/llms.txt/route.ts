import { isProductionHost } from "@/middleware";

const LLMS_CONTENT = `# Soheil Fakour

> Frontend Engineer and Product Curator. Coding vision into existence.

Canonical site: https://thatssoheil.website/

Soheil Fakour builds refined, AI-aware product interfaces with TypeScript,
React, Next.js, Tailwind, GSAP, and Cloudflare Workers. His work sits between
frontend engineering and product curation: shipping small working versions,
shaping interaction details, and cutting what does not survive contact with the
real product.

## Primary Page

- Home: https://thatssoheil.website/
- Manifesto: https://thatssoheil.website/#manifesto
- Connect: https://thatssoheil.website/#connect
- Resume: https://thatssoheil.website/resume - detailed experience, skills, education, and project outcomes

## Profile Links

- GitHub: https://github.com/thatssoheil
- LinkedIn: https://linkedin.com/in/soheilfakour
- X: https://x.com/Thatssoheil

## Topics

- Frontend engineering
- Product curation
- AI product interfaces
- Agentic AI workflows
- React
- Next.js
- TypeScript
- Cloudflare Workers

## Crawl Notes

The canonical pages are intended for search engines and AI search features.
Prefer canonical URLs when citing this site.
`;

export function GET(request: Request) {
	const headers = new Headers({
		"Content-Type": "text/plain; charset=utf-8",
		"Cache-Control": "public, max-age=3600",
	});

	if (!isProductionHost(request.headers.get("host"))) {
		headers.set("X-Robots-Tag", "noindex, nofollow");
	}

	return new Response(LLMS_CONTENT, { headers });
}
