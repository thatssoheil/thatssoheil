import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
	// Update page lastmod dates on material content changes only, never on deploy.
	// Dev-only Playground routes stay in this sitemap: preview responses are
	// noindexed, and production has no Playground routes or entries.
	return [
		{
			url: SITE.url,
			lastModified: new Date("2026-10-04"),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${SITE.url}/resume`,
			lastModified: new Date("2026-10-04"),
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${SITE.url}/playground`,
			lastModified: new Date("2026-10-04"),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${SITE.url}/playground/rwa`,
			lastModified: new Date("2026-10-04"),
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: `${SITE.url}/playground/volatility`,
			lastModified: new Date("2026-10-05"),
			changeFrequency: "daily",
			priority: 0.8,
		},
		{
			url: `${SITE.url}/playground/macro`,
			lastModified: new Date("2026-10-04"),
			changeFrequency: "weekly",
			priority: 0.8,
		},
	];
}
