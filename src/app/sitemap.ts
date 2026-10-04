import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: SITE.url,
			lastModified: new Date("2026-07-13"),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${SITE.url}/resume`,
			lastModified: new Date("2026-07-13"),
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
			url: `${SITE.url}/playground/macro`,
			lastModified: new Date("2026-10-04"),
			changeFrequency: "weekly",
			priority: 0.8,
		},
	];
}
