import { NOW } from "@/data/now";
import { SITE, SOCIALS, ROLE_PROSE, TAGLINE } from "@/lib/constants";

/**
 * JSON-LD structured data for Person schema.
 * Rendered as a `<script type="application/ld+json">` in the document head.
 */
export function PersonJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "WebSite",
				"@id": `${SITE.url}/#website`,
				url: SITE.url,
				name: SITE.name,
				description: SITE.description,
				inLanguage: "en",
				publisher: { "@id": `${SITE.url}/#person` },
			},
			{
				"@type": "ProfilePage",
				"@id": `${SITE.url}/#profile`,
				url: SITE.url,
				name: SITE.title,
				description: SITE.description,
				inLanguage: "en",
				isPartOf: { "@id": `${SITE.url}/#website` },
				about: { "@id": `${SITE.url}/#person` },
				mainEntity: { "@id": `${SITE.url}/#person` },
				primaryImageOfPage: `${SITE.url}${SITE.ogImage}`,
			},
			{
				"@type": "Person",
				"@id": `${SITE.url}/#person`,
				name: SITE.name,
				url: SITE.url,
				jobTitle: ROLE_PROSE,
				description: `${SITE.description} ${TAGLINE}.`,
				sameAs: SOCIALS.map((s) => s.href),
				image: `${SITE.url}${SITE.ogImage}`,
				mainEntityOfPage: { "@id": `${SITE.url}/#profile` },
				knowsAbout: [
					"Frontend engineering",
					"Product curation",
					"AI product interfaces",
					...NOW.stack,
				],
			},
		],
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}
