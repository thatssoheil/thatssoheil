import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ExportControls } from "@/components/resume/export-controls";
import { ResumeDocument } from "@/components/resume/resume-document";
import { RESUME } from "@/data/resume";
import { SITE } from "@/lib/constants";
import styles from "@/components/resume/resume.module.css";

export const metadata: Metadata = {
	title: `${RESUME.name} — ${RESUME.title}`,
	description: RESUME.sections.summary,
	alternates: { canonical: "/resume" },
	openGraph: {
		type: "profile",
		url: `${SITE.url}/resume`,
		title: `${RESUME.name} — ${RESUME.title}`,
		description: RESUME.sections.summary,
		images: [{ url: SITE.ogImage, alt: SITE.ogImageAlt }],
	},
};

export default function ResumePage() {
	return (
		<>
			<div className={styles.screenOnly}><Header /></div>
			<main id="main-content" className={styles.resumeViewport}>
				<ExportControls />
				<ResumeDocument />
			</main>
			<div className={styles.screenOnly}><Footer /></div>
		</>
	);
}
