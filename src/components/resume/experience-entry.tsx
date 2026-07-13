import type { ResumeExperience } from "@/data/resume";
import styles from "./resume.module.css";

export function ExperienceEntry({ entry }: { entry: ResumeExperience }) {
	return (
		<article
			className={`${styles.experienceEntry} ${entry.startsPrintPage ? styles.pageTwoStart : ""}`}
			aria-labelledby={`${entry.id}-title`}
		>
			<header className={styles.experienceHeader}>
				<div>
					<h3 id={`${entry.id}-title`}>{entry.role}</h3>
					<p className={styles.employerLine}>
						<span>{entry.company}</span>
						{entry.employmentType ? <span> · {entry.employmentType}</span> : null}
					</p>
				</div>
				<div className={styles.experienceMeta}>
					<time dateTime={entry.startDate}>{entry.dateLabel}</time>
					{entry.location ? <span>{entry.location}</span> : null}
				</div>
			</header>
			{entry.context ? <p className={styles.context}>{entry.context}</p> : null}
			<ul className={styles.highlights}>
				{entry.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
			</ul>
		</article>
	);
}
