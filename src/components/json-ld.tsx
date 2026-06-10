import { SITE, SOCIALS } from "@/lib/constants";

/**
 * JSON-LD structured data for Person schema.
 * Rendered as a `<script type="application/ld+json">` in the document head.
 */
export function PersonJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: SITE.name,
		url: SITE.url,
		jobTitle: "Developer & Creative Technologist",
		description: SITE.description,
		sameAs: SOCIALS.map((s) => s.href),
		image: `${SITE.url}/og.png`,
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}
