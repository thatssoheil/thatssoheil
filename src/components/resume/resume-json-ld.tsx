import { RESUME } from "@/data/resume";
import { SITE } from "@/lib/constants";

export function ResumeJsonLd() {
	const url = `${SITE.url}/resume`;
	const sameAs = RESUME.contact
		.filter((item) => item.href.startsWith("https://"))
		.map((item) => item.href);
	const jsonLd = {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "ProfilePage",
				"@id": `${url}#profile`,
				url,
				name: `${RESUME.name} — ${RESUME.title}`,
				mainEntity: { "@id": `${SITE.url}/#person` },
				isPartOf: { "@id": `${SITE.url}/#website` },
			},
			{
				"@type": "Person",
				"@id": `${SITE.url}/#person`,
				name: RESUME.name,
				url: SITE.url,
				jobTitle: RESUME.title,
				email: RESUME.contact.find((item) => item.href.startsWith("mailto:"))?.href,
				telephone: RESUME.contact.find((item) => item.href.startsWith("tel:"))?.label,
				homeLocation: { "@type": "Place", name: RESUME.location },
				sameAs,
			},
		],
	};

	return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
