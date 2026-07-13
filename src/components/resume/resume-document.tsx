import { RESUME } from "@/data/resume";
import { Surface } from "@/components/ui/surface";
import { DateRange } from "./date-range";
import { ExperienceEntry } from "./experience-entry";
import styles from "./resume.module.css";

function SectionHeading({ children }: { children: React.ReactNode }) {
	return <h2 className={styles.sectionHeading}>{children}</h2>;
}

export function ResumeDocument() {
	const { sections } = RESUME;
	return (
		<Surface
			variant="panel"
			radius="lg"
			className={styles.paper}
			aria-label={`${RESUME.name} résumé`}
		>
			<header className={styles.identity}>
				<p className={styles.eyebrow}>Résumé</p>
				<h1>{RESUME.name}</h1>
				<p className={styles.title}>{RESUME.title}</p>
				<p className={styles.location}>{RESUME.location}</p>
				<address className={styles.contact}>
					{RESUME.contact.map((item) => (
						<a key={item.href} href={item.href}>{item.label}</a>
					))}
				</address>
			</header>

			<section id="summary" className={styles.section}>
				<SectionHeading>Professional Summary</SectionHeading>
				<p>{sections.summary}</p>
			</section>

			<section id="skills" className={styles.section}>
				<SectionHeading>Technical Skills</SectionHeading>
				<div className={styles.skillGroups}>
					{sections.skills.map((group) => (
						<p key={group.label}>
							<strong>{group.label}:</strong> {group.items.join(", ")}
						</p>
					))}
				</div>
			</section>

			<section id="experience" className={styles.section}>
				<SectionHeading>Work Experience</SectionHeading>
				<div className={styles.experienceList}>
					{sections.experience.map((entry) => <ExperienceEntry key={entry.id} entry={entry} />)}
				</div>
			</section>

			<section id="project" className={styles.section}>
				<SectionHeading>Selected Project</SectionHeading>
				<article className={styles.project}>
					<h3><a href={sections.project.href}>{sections.project.name}</a></h3>
					<p className={styles.context}>{sections.project.stack.join(" · ")}</p>
					<ul className={styles.highlights}>
						{sections.project.highlights.map((item) => <li key={item}>{item}</li>)}
					</ul>
				</article>
			</section>

			<section id="education" className={styles.section}>
				<SectionHeading>Education and Recognition</SectionHeading>
				<div className={styles.education}>
					<div>
						<h3>{sections.education.degree}</h3>
						<p>{sections.education.institution}</p>
					</div>
					<DateRange
						label={sections.education.dateLabel}
						startDate={sections.education.startDate}
						endDate={sections.education.endDate}
					/>
				</div>
				<ul className={styles.compactList}>
					{sections.recognition.map((item) => <li key={item}>{item}</li>)}
				</ul>
			</section>

			<section id="additional" className={styles.section}>
				<SectionHeading>Additional Information</SectionHeading>
				<ul className={styles.compactList}>
					{sections.additional.map((item) => <li key={item}>{item}</li>)}
				</ul>
			</section>
		</Surface>
	);
}
