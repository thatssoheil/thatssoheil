# SEO and AIO Audit

Date: 2026-07-04

## Verdict

The site is indexable and has the technical basics for search discovery: a
canonical root URL, robots directives, sitemap, metadata, Open Graph/Twitter
image routes, and structured data. This pass strengthened the weak points:
generic description copy, implicit social-image coverage, thin JSON-LD, and no
plain-text AI-reader summary.

Indexing cannot be forced from code. The site can only make itself crawlable,
canonical, useful, and easy to understand. Search Console submission and live URL
inspection remain manual release steps.

## Changes Made

- Expanded the canonical site description around Soheil's actual positioning:
  frontend engineering, product curation, AI-aware product interfaces, React,
  Next.js, TypeScript, and Cloudflare.
- Added explicit Open Graph and Twitter image metadata with dimensions, type,
  and alt text.
- Reworked JSON-LD into a connected `WebSite` + `ProfilePage` + `Person` graph.
- Refreshed the generated Open Graph image to match the site's dark structural
  grid and signal-accent identity.
- Added a `twitter-image.tsx` convention route that reuses the OG card.
- Added `/llms.txt` as a concise AI-reader summary and crawl note.
- Added sitemap `lastModified`.
- Added `X-Robots-Tag` headers for the public root, `/ds`, and `/api/*`.

## Source Baseline

- Google Search Central SEO starter guide: indexability is not guaranteed, but
  following Search Essentials and improving crawlable content makes discovery
  more likely.
- Google robots meta documentation: `index`, `follow`, `max-snippet`,
  `max-image-preview`, and `max-video-preview` are the right controls for search
  snippets and AI Search surfaces.
- Google AI features documentation: AI Overviews and AI Mode use normal Search
  controls. Avoid `nosnippet` on the canonical page if AI inclusion is desired.
- Open Graph protocol: `og:title`, `og:type`, `og:image`, and `og:url` are the
  core share-card properties.
- Next.js metadata file conventions: `opengraph-image` and `twitter-image`
  route files are valid App Router share-image sources.

## Remaining Release Steps

- Deploy the pushed branch.
- In Google Search Console, inspect `https://thatssoheil.website/` and request
  indexing after deploy.
- Submit `https://thatssoheil.website/sitemap.xml`.
- Use a social card debugger after deploy to confirm the production OG image
  resolves publicly.
