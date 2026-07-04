import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: SITE.url,
			lastModified: new Date("2026-07-04"),
			changeFrequency: "monthly",
			priority: 1,
		},
	];
}
