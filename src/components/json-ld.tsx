import { SITE, SOCIALS, ROLE_PROSE } from "@/lib/constants";

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
		jobTitle: ROLE_PROSE,
		description: SITE.description,
		sameAs: SOCIALS.map((s) => s.href),
		image: `${SITE.url}${SITE.ogImage}`,
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}
