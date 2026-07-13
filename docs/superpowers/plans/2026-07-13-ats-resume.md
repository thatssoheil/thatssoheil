# ATS-First Online Resume Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first-class `/resume` route that presents Soheil as a Senior Frontend Engineer online and exports the same semantic content into a deterministic two-page, ATS-readable A4 PDF.

**Architecture:** Keep all factual content in a typed `src/data/resume.ts` module. Render it through server components using one linear semantic DOM, isolate `window.print()` in one client control, and switch the same document into a conservative two-page layout with a route-scoped CSS module. Add a source-level resume contract check to the repository's existing script-based verification suite.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 4, CSS Modules, existing Signal Glass tokens, Node.js verification scripts, Chromium print-to-PDF, `pdfinfo`, and `pdftotext`.

## Global Constraints

- Branch is `feat/ats-resume`, based directly on `origin/main` by explicit user request.
- Use one content source and one semantic DOM for web and print.
- The reference export must be exactly two A4 pages, text-based, searchable, selectable, and below 1 MB.
- Keep a single-column reading order at every breakpoint and in print.
- Use standard headings: `Professional Summary`, `Technical Skills`, `Work Experience`, `Selected Project`, `Education and Recognition`, and `Additional Information`.
- Do not use tables, text boxes, portraits, logos, skill meters, decorative timelines, print headers, or print footers.
- Do not add a PDF-generation dependency; `Export PDF` calls `window.print()`.
- Do not claim product-design ownership for Figma-supplied work.
- Do not add arbitrary percentages, Xperix marketing statistics, commit counts, changed-line counts, inherited customer-acquisition claims, the old `50+ startups` claim, or an official IELTS credential.
- Keep contact details as visible body text, not icon-only controls or document headers/footers.
- Reuse semantic site tokens online; print in conservative black-on-white system typography.
- Respect reduced motion, reduced transparency, contrast preferences, keyboard navigation, and visible focus.
- Every factual claim must match `docs/superpowers/specs/2026-07-13-ats-resume-design.md`.

---

## File Map

### New files

- `src/data/resume.ts` — typed canonical résumé facts and evidence-backed copy.
- `src/components/resume/resume-document.tsx` — semantic document composition and non-experience sections.
- `src/components/resume/experience-entry.tsx` — one semantic work-experience article.
- `src/components/resume/export-controls.tsx` — the only client boundary; invokes native print.
- `src/components/resume/resume-json-ld.tsx` — route-specific `ProfilePage` and `Person` structured data.
- `src/components/resume/resume.module.css` — responsive web presentation and deterministic A4 print rules.
- `src/app/resume/page.tsx` — route metadata, site shell, controls, résumé document, and structured data.
- `scripts/check-resume.mjs` — content, semantic-markup, and print-contract assertions.
- `docs/audits/2026-07-13-resume-verification.md` — final web/PDF/ATS verification evidence.

### Modified files

- `package.json` — expose `check:resume` and include it in `test`.
- `src/lib/constants.ts` — centralize phone, location, availability, and add the résumé navigation target.
- `src/data/now.ts` — remove stale Oman relocation copy and consume the canonical availability statement.
- `src/components/header.tsx` — make hash navigation route-aware and expose `/resume`.
- `src/components/command-menu.tsx` — make mobile/command navigation route-aware and expose `/resume`.
- `src/app/sitemap.ts` — add the canonical résumé URL.

---

### Task 1: Establish the canonical content model and factual guard

**Files:**
- Create: `scripts/check-resume.mjs`
- Create: `src/data/resume.ts`
- Modify: `package.json`
- Modify: `src/lib/constants.ts`
- Modify: `src/data/now.ts`

**Interfaces:**
- Produces: `RESUME: ResumeData`, plus `PHONE`, `LOCATION`, and `AVAILABILITY` site constants.
- Consumes: existing `SITE`, `EMAIL`, and `SOCIALS` constants.

- [ ] **Step 1: Add the failing content-contract check**

Create `scripts/check-resume.mjs`:

```js
#!/usr/bin/env node
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const resume = read("src/data/resume.ts");

const required = [
	"Senior Frontend Engineer",
	"Professional Summary",
	"Technical Skills",
	"Work Experience",
	"Climic",
	"MCINEXT",
	"Xperix",
	"Amirkabir University of Technology",
	"+98 910 313 9376",
	"soheil.fakour@gmail.com",
];

const forbidden = [
	/25%/i,
	/50\+ startups/i,
	/official IELTS/i,
	/solo developer at Zaman/i,
	/designed Xperix/i,
];

const failures = [];
for (const value of required) {
	if (!resume.includes(value)) failures.push(`missing required resume fact: ${value}`);
}
for (const pattern of forbidden) {
	if (pattern.test(resume)) failures.push(`forbidden resume claim: ${pattern}`);
}

if (failures.length) {
	console.error("x resume-contract");
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log("ok resume-contract: required facts present and excluded claims absent");
```

Add the script to `package.json` and append it to `test`:

```json
{
	"scripts": {
		"check:resume": "node scripts/check-resume.mjs",
		"test": "pnpm lint && pnpm typecheck && pnpm check:tokens && pnpm check:mobile-scroll && pnpm check:resume"
	}
}
```

- [ ] **Step 2: Run the contract to verify it fails**

Run: `pnpm check:resume`

Expected: FAIL because `src/data/resume.ts` does not exist.

- [ ] **Step 3: Centralize contact and availability facts**

Add to `src/lib/constants.ts` below `EMAIL`:

```ts
export const PHONE = "+98 910 313 9376";
export const LOCATION = "Tehran, Iran";
export const AVAILABILITY =
	"Open to remote roles in Iran and international opportunities across Europe and GCC.";
```

Update the import and current facts in `src/data/now.ts`:

```ts
import { AVAILABILITY } from "@/lib/constants";

export const NOW = {
	status: AVAILABILITY,
	current:
		"Owning frontend delivery on a small team building clinical AI that turns physician-patient conversations into structured medical documentation.",
	stack: [
		"TypeScript",
		"React 19",
		"Next.js 16",
		"Tailwind",
		"GSAP",
		"Cloudflare Workers",
	],
	past: [
		{
			label: "Before this",
			body: "Travel and hotel channel-management infrastructure, then a deliberate move to the frontend.",
		},
		{
			label: "Shipped",
			body: "B2C and B2B products across healthcare, conversational AI, customer support, publishing, and commerce.",
		},
	] satisfies readonly WorkNote[],
} as const;
```

- [ ] **Step 4: Create the typed résumé source with final baseline copy**

Create `src/data/resume.ts`:

```ts
import {
	AVAILABILITY,
	EMAIL,
	LOCATION,
	PHONE,
	SITE,
	SOCIALS,
} from "@/lib/constants";

export interface ResumeLink {
	label: string;
	href: string;
}

export interface ResumeSkillGroup {
	label: string;
	items: readonly string[];
}

export interface ResumeExperience {
	id: string;
	company: string;
	role: string;
	employmentType?: string;
	dateLabel: string;
	startDate: string;
	endDate?: string;
	location?: string;
	context?: string;
	highlights: readonly string[];
	startsPrintPage?: boolean;
}

export interface ResumeProject {
	name: string;
	href: string;
	stack: readonly string[];
	highlights: readonly string[];
}

export interface ResumeData {
	name: string;
	title: string;
	location: string;
	availability: string;
	contact: readonly ResumeLink[];
	sections: {
		summary: string;
		skills: readonly ResumeSkillGroup[];
		experience: readonly ResumeExperience[];
		project: ResumeProject;
		education: {
			degree: string;
			institution: string;
			dateLabel: string;
			startDate: string;
			endDate: string;
		};
		recognition: readonly string[];
		additional: readonly string[];
	};
}

const github = SOCIALS.find((item) => item.label === "GitHub");
const linkedIn = SOCIALS.find((item) => item.label === "LinkedIn");

export const RESUME = {
	name: SITE.name,
	title: "Senior Frontend Engineer",
	location: LOCATION,
	availability: AVAILABILITY,
	contact: [
		{ label: PHONE, href: `tel:${PHONE.replaceAll(" ", "")}` },
		{ label: EMAIL, href: `mailto:${EMAIL}` },
		{ label: "thatssoheil.website", href: SITE.url },
		{ label: "github.com/thatssoheil", href: github?.href ?? "https://github.com/thatssoheil" },
		{ label: "linkedin.com/in/soheilfakour", href: linkedIn?.href ?? "https://linkedin.com/in/soheilfakour" },
	],
	sections: {
		summary:
			"Senior Frontend Engineer with 6+ years in software engineering, including 5+ years focused on frontend development. Builds maintainable frontend architecture and product workflows for AI, healthcare, B2B, and real-time applications. Experienced owning frontend delivery in early-stage teams, modernizing inconsistent codebases, developing shared systems, and translating Figma designs into responsive production interfaces.",
		skills: [
			{
				label: "Frontend",
				items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
			},
			{
				label: "Architecture",
				items: ["Nx monorepos", "Design systems", "Component libraries", "REST APIs", "WebSockets", "Role-based access control", "Internationalization"],
			},
			{
				label: "Product Engineering",
				items: ["TanStack Query", "React Hook Form", "Zod", "Redux", "Zustand", "Recharts", "GSAP", "Accessibility", "Performance optimization"],
			},
			{
				label: "Tooling",
				items: ["Git", "pnpm", "Vite", "Cypress", "Jest", "Docker", "Cloudflare", "Nginx", "WordPress"],
			},
		],
		experience: [
			{
				id: "climic",
				company: "Climic",
				role: "Frontend Engineer",
				dateLabel: "2026 — Present",
				startDate: "2026",
				location: "Tehran, Iran",
				context: "Clinical AI startup launched by Mom Fertility Hospital",
				highlights: [
					"Own frontend delivery as the sole Frontend Engineer on an eight-person team building an ambient clinical AI product that turns physician-patient conversations into structured records and SOAP notes.",
					"Audited and modernized an early AI-generated React codebase, replacing inconsistent components and uncoordinated API calls with reusable UI, TanStack Query services, centralized query keys, and documented frontend conventions.",
					"Redesigned a 50-row patient workflow from more than 100 potential per-row requests to 2–3 list-level requests using server pagination, list-shaped payloads, and lazy-loaded histories.",
					"Hardened live encounters with HTTP/WebSocket reconciliation, cross-tab recording synchronization, token refresh, ordered autosave, submit flushing, and signoff guards.",
					"Built shared table, form, date/time, localization, access-control, and encounter foundations across four locales while continuously curating small workflow and scope decisions with the team.",
				],
			},
			{
				id: "mcinext",
				company: "MCINEXT",
				role: "Frontend Engineer",
				dateLabel: "Dec 2023 — Nov 2025",
				startDate: "2023-12",
				endDate: "2025-11",
				location: "Tehran, Iran",
				highlights: [
					"Built Daani from scratch in Next.js 13 from supplied Figma designs, serving as its only Frontend Engineer for the first three months and adapting an internal Instagram-like media explorer for the gamified children's search product.",
					"Delivered authentication, Q&A, user and expert administration, role management, filtering, pagination, and embedded analytics for Anzu's chatbot and call-center analysis products.",
					"Designed frontend role-based access control around backend permissions, gating routes, navigation, tabs, components, and actions while consolidating duplicated authentication and administration flows into shared Nx libraries used by two dashboards.",
					"Developed shared conversational capabilities inside a six-application Nx platform, including segmented streaming text-to-speech, continuous speech recognition, media uploads, WebSocket-driven operator handoff, and feedback workflows.",
					"Shipped production Xperix features for the Oman market from supplied Figma designs—documentation, responsive navigation, conversation filtering, reporting, topic analytics, publishing/embed setup, secure agent reset, and a GSAP-driven landing hero; also completed a short Chakra UI-to-Material UI migration for Nova.",
				],
			},
			{
				id: "dideban",
				company: "Dideban",
				role: "Frontend Engineer",
				employmentType: "Contract",
				dateLabel: "Aug 2023 — Dec 2023",
				startDate: "2023-08",
				endDate: "2023-12",
				startsPrintPage: true,
				highlights: [
					"Contributed pricing, subscription, and selected internal-panel features during a short engagement with an early-stage startup.",
				],
			},
			{
				id: "zaman",
				company: "Zaman",
				role: "Frontend Engineer",
				dateLabel: "Jul 2022 — Oct 2023",
				startDate: "2022-07",
				endDate: "2023-10",
				location: "Tehran, Iran",
				highlights: [
					"Maintained and evolved existing Engenesis and Being Profile learning and assessment workflows as part of a client-services team, collaborating closely with a senior frontend engineer.",
					"Built an enrollment-completion flow that generated a personalized printable ticket for each attendee of an in-person course.",
				],
			},
			{
				id: "epic-labs",
				company: "Epic Labs / 6Success",
				role: "Frontend Engineer",
				employmentType: "Contract",
				dateLabel: "Jun 2022 — Jun 2023",
				startDate: "2022-06",
				endDate: "2023-06",
				location: "Remote · Canada",
				highlights: [
					"Delivered and maintained approximately ten self-hosted WordPress client sites, translating supplied responsive designs into pixel-accurate templates with custom CSS and JavaScript.",
					"Handled Cloudflare configuration, server deployment, maintenance, and Nginx setup for the production sites.",
				],
			},
			{
				id: "rechat",
				company: "Rechat",
				role: "Frontend Engineer",
				dateLabel: "Sep 2021 — Jun 2022",
				startDate: "2021-09",
				endDate: "2022-06",
				location: "Remote · Dallas, Texas",
				highlights: [
					"Implemented responsive email, social, print, and deal-document templates from supplied designs using HTML, CSS, MJML, and the platform's templating system.",
					"Tested cross-device output and published versioned templates through a repository-to-CMS delivery pipeline.",
				],
			},
			{
				id: "independent",
				company: "Independent Projects",
				role: "Frontend and WordPress Developer",
				dateLabel: "Apr 2020 — Aug 2021",
				startDate: "2020-04",
				endDate: "2021-08",
				location: "Tehran, Iran",
				highlights: [
					"Made a deliberate transition into frontend engineering through HTML, CSS, JavaScript, WordPress, and several paid production projects.",
				],
			},
			{
				id: "lamasoo",
				company: "Lamasoo",
				role: "Junior Backend Developer",
				dateLabel: "Jan 2019 — Mar 2020",
				startDate: "2019-01",
				endDate: "2020-03",
				location: "Tehran, Iran",
				highlights: [
					"Worked with Node.js promises, queues, and asynchronous integration behavior in a channel-management system connecting hotels with travel agencies.",
				],
			},
		],
		project: {
			name: "thatssoheil.website",
			href: SITE.url,
			stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "Cloudflare"],
			highlights: [
				"Designed and built a personal site around the versioned Signal Glass system, using semantic tokens, documented interface decisions, and accessibility constraints.",
				"Built a grounded streaming AI chat with server validation, rate limiting, abort and retry behavior, and a repository-local knowledge source.",
			],
		},
		education: {
			degree: "B.Eng. in Computer Engineering",
			institution: "Amirkabir University of Technology",
			dateLabel: "Oct 2016 — Oct 2021",
			startDate: "2016-10",
			endDate: "2021-10",
		},
		recognition: ["Developer of the Month, Rechat — twice"],
		additional: ["English — Advanced Professional Proficiency", AVAILABILITY],
	},
} as const satisfies ResumeData;

export const RESUME_SECTION_LABELS = [
	"Professional Summary",
	"Technical Skills",
	"Work Experience",
	"Selected Project",
	"Education and Recognition",
	"Additional Information",
] as const;
```

- [ ] **Step 5: Run the content and repository checks**

Run: `pnpm check:resume && pnpm typecheck && pnpm lint`

Expected: all commands PASS.

- [ ] **Step 6: Commit the canonical content model**

```bash
git add package.json scripts/check-resume.mjs src/lib/constants.ts src/data/now.ts src/data/resume.ts
git commit -m "feat(resume): add canonical career data"
```

---

### Task 2: Render the semantic résumé route

**Files:**
- Create: `src/components/resume/experience-entry.tsx`
- Create: `src/components/resume/resume-document.tsx`
- Create: `src/components/resume/export-controls.tsx`
- Create: `src/app/resume/page.tsx`
- Modify: `scripts/check-resume.mjs`

**Interfaces:**
- Consumes: `RESUME`, `RESUME_SECTION_LABELS`, and `ResumeExperience` from Task 1.
- Produces: server-rendered `/resume` content and `ExportControls` client action.

- [ ] **Step 1: Extend the source check with semantic-route assertions**

Append before the failure-report block in `scripts/check-resume.mjs`:

```js
const route = read("src/app/resume/page.tsx");
const document = read("src/components/resume/resume-document.tsx");
const experience = read("src/components/resume/experience-entry.tsx");

for (const [source, pattern, message] of [
	[route, /<main[^>]+id="main-content"/, "resume route needs a main landmark"],
	[document, /<h1/, "resume document needs one h1"],
	[document, /<address/, "contact details need a body address"],
	[document, /Professional Summary/, "standard summary heading missing"],
	[document, /Technical Skills/, "standard skills heading missing"],
	[document, /Work Experience/, "standard experience heading missing"],
	[experience, /<article/, "experience entries need article elements"],
	[experience, /<time/, "experience entries need time elements"],
]) {
	if (!pattern.test(source)) failures.push(message);
}
```

- [ ] **Step 2: Run the semantic check to verify it fails**

Run: `pnpm check:resume`

Expected: FAIL because the résumé route and components do not exist.

- [ ] **Step 3: Create the experience article**

Create `src/components/resume/experience-entry.tsx`:

```tsx
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
```

- [ ] **Step 4: Create the semantic résumé document**

Create `src/components/resume/resume-document.tsx`:

```tsx
import { RESUME } from "@/data/resume";
import { ExperienceEntry } from "./experience-entry";
import styles from "./resume.module.css";

function SectionHeading({ children }: { children: React.ReactNode }) {
	return <h2 className={styles.sectionHeading}>{children}</h2>;
}

export function ResumeDocument() {
	const { sections } = RESUME;
	return (
		<div className={`${styles.paper} glass-panel glass-edge`} aria-label={`${RESUME.name} résumé`}>
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
					<time dateTime={sections.education.startDate}>
						{sections.education.dateLabel}
					</time>
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
		</div>
	);
}
```

- [ ] **Step 5: Add the native export client boundary**

Create `src/components/resume/export-controls.tsx`:

```tsx
"use client";

import { Download } from "lucide-react";
import styles from "./resume.module.css";

export function ExportControls() {
	return (
		<div className={styles.toolbar} aria-label="Résumé actions">
			<div>
				<p>Application copy</p>
				<span>Choose “Save as PDF” in the native print dialog.</span>
			</div>
			<button type="button" onClick={() => window.print()}>
				<Download aria-hidden="true" size={16} />
				Export PDF
			</button>
		</div>
	);
}
```

- [ ] **Step 6: Create the route with metadata and server-rendered content**

Create `src/app/resume/page.tsx`:

```tsx
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
```

Create an empty `src/components/resume/resume.module.css` so imports resolve during this task:

```css
.screenOnly {}
.resumeViewport {}
.toolbar {}
.paper {}
.identity {}
.eyebrow {}
.title {}
.location {}
.contact {}
.section {}
.sectionHeading {}
.skillGroups {}
.experienceList {}
.experienceEntry {}
.pageTwoStart {}
.experienceHeader {}
.employerLine {}
.experienceMeta {}
.context {}
.highlights {}
.project {}
.education {}
.compactList {}
```

- [ ] **Step 7: Run semantic and repository checks**

Run: `pnpm check:resume && pnpm typecheck && pnpm lint`

Expected: all commands PASS and `/resume` remains server-rendered except for the export button.

- [ ] **Step 8: Commit the semantic route**

```bash
git add scripts/check-resume.mjs src/app/resume src/components/resume
git commit -m "feat(resume): render semantic career profile"
```

---

### Task 3: Apply Signal Glass web presentation and deterministic print rules

**Files:**
- Modify: `src/components/resume/resume.module.css`
- Modify: `scripts/check-resume.mjs`

**Interfaces:**
- Consumes: class names emitted by Task 2.
- Produces: responsive online surface and exactly defined A4 print boundary.

- [ ] **Step 1: Extend the source check with print-contract assertions**

Append before the failure-report block in `scripts/check-resume.mjs`:

```js
const css = read("src/components/resume/resume.module.css");
for (const [pattern, message] of [
	[/@page\s*{[^}]*size:\s*A4 portrait/s, "print CSS needs A4 portrait @page"],
	[/@media print/, "print media rules missing"],
	[/break-before:\s*page/, "page-two boundary missing"],
	[/break-inside:\s*avoid/, "role split protection missing"],
	[/\.screenOnly[^}]*display:\s*none/s, "web-only chrome must disappear in print"],
	[/font-family:\s*Arial/, "print needs conservative system typography"],
]) {
	if (!pattern.test(css)) failures.push(message);
}
```

- [ ] **Step 2: Run the print contract to verify it fails**

Run: `pnpm check:resume`

Expected: FAIL with missing A4, print, page-break, and system-font assertions.

- [ ] **Step 3: Replace the empty stylesheet with the complete web and print design**

Replace `src/components/resume/resume.module.css` with:

```css
.screenOnly { display: contents; }

.resumeViewport {
	position: relative;
	z-index: 1;
	min-height: 100vh;
	padding: 7rem 1.25rem 2rem;
}

.toolbar {
	position: sticky;
	top: 5.75rem;
	z-index: var(--z-sticky);
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	width: min(100%, 57.5rem);
	margin: 0 auto 1rem;
	padding: 0.75rem 0.875rem;
	border: 1px solid var(--glass-rim);
	border-radius: var(--radius-lg);
	background: var(--glass-bg-solid);
	box-shadow: var(--shadow-border);
}

.toolbar p { font-size: 0.8125rem; font-weight: 500; }
.toolbar span { color: var(--text-faint); font-size: 0.75rem; }
.toolbar button {
	display: inline-flex;
	min-height: 2.75rem;
	align-items: center;
	gap: 0.5rem;
	padding: 0 0.875rem;
	border-radius: var(--radius-md);
	background: var(--primary);
	color: var(--primary-foreground);
	font-size: 0.8125rem;
	font-weight: 500;
	transition: transform var(--dur-micro) var(--ease-snap), opacity var(--dur-micro) var(--ease-snap);
}
.toolbar button:hover { opacity: 0.9; }
.toolbar button:active { transform: scale(0.98); }
.toolbar button:focus-visible { outline: none; box-shadow: var(--ring-focus); }

.paper {
	width: min(100%, 57.5rem);
	margin: 0 auto;
	padding: clamp(1.5rem, 4vw, 3.5rem);
	border-radius: var(--radius-xl);
	color: var(--foreground);
	font-size: 0.9375rem;
	line-height: 1.6;
}

.identity { padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
.eyebrow { color: var(--brand); font-family: var(--font-mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; }
.identity h1 { margin-top: 0.35rem; font-size: clamp(2.25rem, 7vw, 4rem); font-weight: 300; line-height: 1; letter-spacing: -0.06em; }
.title { margin-top: 0.75rem; font-size: 1.125rem; font-weight: 500; }
.location { margin-top: 0.125rem; color: var(--text-muted); }
.contact { display: flex; flex-wrap: wrap; gap: 0.35rem 1rem; margin-top: 1rem; font-style: normal; }
.contact a, .project a { color: var(--brand); text-decoration: underline; text-decoration-color: color-mix(in oklch, var(--brand) 38%, transparent); text-underline-offset: 0.2em; }
.contact a:hover, .project a:hover { text-decoration-color: currentColor; }

.section { padding-top: 1.5rem; }
.sectionHeading { margin-bottom: 0.75rem; color: var(--brand); font-family: var(--font-mono); font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; }
.skillGroups { display: grid; gap: 0.35rem; }
.skillGroups strong { font-weight: 600; }
.experienceList { display: grid; gap: 1.5rem; }
.experienceEntry, .project { break-inside: avoid; }
.experienceHeader, .education { display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; }
.experienceHeader h3, .project h3, .education h3 { font-size: 1rem; font-weight: 600; }
.employerLine { color: var(--text-muted); }
.experienceMeta { display: grid; flex: none; justify-items: end; color: var(--text-faint); font-size: 0.8125rem; line-height: 1.4; text-align: right; }
.context { margin-top: 0.3rem; color: var(--text-faint); font-size: 0.8125rem; }
.highlights, .compactList { display: grid; gap: 0.35rem; margin-top: 0.55rem; padding-left: 1.1rem; list-style: disc; }
.highlights li::marker, .compactList li::marker { color: var(--brand); }
.pageTwoStart { scroll-margin-top: 7rem; }

@media (max-width: 40rem) {
	.resumeViewport { padding-inline: 0; }
	.toolbar { position: static; width: calc(100% - 2rem); }
	.toolbar span { display: none; }
	.paper { border-inline: 0; border-radius: 0; box-shadow: none; }
	.experienceHeader, .education { display: grid; gap: 0.25rem; }
	.experienceMeta { justify-items: start; text-align: left; }
}

@media (prefers-reduced-transparency: reduce) {
	.toolbar { background: var(--glass-bg-solid); }
}

@page {
	size: A4 portrait;
	margin: 9mm 11mm;
}

@media print {
	.screenOnly, .toolbar { display: none !important; }
	:global(.signal-field), :global(.structure-grid) { display: none !important; }
	:global(html), :global(body) {
		width: 210mm;
		min-height: auto;
		background: #fff !important;
		color: #111 !important;
		print-color-adjust: exact;
		-webkit-print-color-adjust: exact;
	}
	.resumeViewport { min-height: 0; padding: 0; }
	.paper {
		width: auto;
		max-width: none;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: #fff !important;
		box-shadow: none;
		color: #111 !important;
		font-family: Arial, Helvetica, sans-serif;
		font-size: 8.7pt;
		line-height: 1.32;
	}
	.identity { padding-bottom: 3.5mm; border-color: #c9c9c9; }
	.eyebrow { display: none; }
	.identity h1 { margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 20pt; font-weight: 700; letter-spacing: -0.035em; }
	.title { margin-top: 1mm; font-size: 11pt; }
	.location { margin-top: 0; color: #333; }
	.contact { gap: 0.5mm 3mm; margin-top: 2mm; font-size: 8pt; }
	.contact a, .project a { color: #111; text-decoration: none; }
	.section { padding-top: 3.4mm; }
	.sectionHeading { margin-bottom: 1.5mm; color: #111; font-family: Arial, Helvetica, sans-serif; font-size: 8pt; font-weight: 700; letter-spacing: 0.08em; }
	.skillGroups { gap: 0.6mm; }
	.experienceList { gap: 3mm; }
	.experienceEntry, .project, .education { break-inside: avoid; page-break-inside: avoid; }
	.experienceHeader h3, .project h3, .education h3 { font-size: 9pt; }
	.employerLine, .context, .experienceMeta { color: #333; }
	.experienceMeta, .context { font-size: 7.6pt; }
	.highlights, .compactList { gap: 0.7mm; margin-top: 1mm; padding-left: 4mm; }
	.highlights li::marker, .compactList li::marker { color: #111; }
	.pageTwoStart { break-before: page; page-break-before: always; }
	* { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Run static print and repository checks**

Run: `pnpm check:resume && pnpm check:tokens && pnpm typecheck && pnpm lint`

Expected: all commands PASS.

- [ ] **Step 5: Commit the responsive and print presentation**

```bash
git add scripts/check-resume.mjs src/components/resume/resume.module.css
git commit -m "style(resume): add web and A4 presentation"
```

---

### Task 4: Integrate route navigation, discovery, and structured data

**Files:**
- Create: `src/components/resume/resume-json-ld.tsx`
- Modify: `src/app/resume/page.tsx`
- Modify: `src/components/header.tsx`
- Modify: `src/components/command-menu.tsx`
- Modify: `src/lib/constants.ts`
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `RESUME`, `SITE`, and existing navigation behavior.
- Produces: crawlable `/resume`, route-safe header links, and résumé-specific structured data.

- [ ] **Step 1: Add the résumé destination to navigation data**

Change `NAV_LINKS` in `src/lib/constants.ts` to:

```ts
export const NAV_LINKS = [
	...SECTIONS.filter((section) => section.id !== "hero").map((section) => ({
		label: section.label,
		href: `#${section.id}`,
	})),
	{ label: "Resume", href: "/resume" },
] as const;
```

- [ ] **Step 2: Make the shared header safe on non-home routes**

Import `usePathname` from `next/navigation` in `src/components/header.tsx`, then use these handlers and link calculations:

```tsx
const pathname = usePathname();
const isHome = pathname === "/";

const handleClick = useCallback(
	(e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
		if (!href.startsWith("#") || !isHome) return;
		e.preventDefault();
		jumpToSection(href);
	},
	[isHome],
);

const resolveHref = (href: string) =>
	href.startsWith("#") && !isHome ? `/${href}` : href;
```

Set the brand link to `href={isHome ? "#hero" : "/"}` and only call `handleClick` with `#hero` on the home route. Inside `NAV_LINKS.map`, set:

```tsx
const isHash = href.startsWith("#");
const isActive = isHash
	? isHome && activeSection === href.slice(1)
	: pathname === href;
const resolvedHref = resolveHref(href);
```

Render `href={resolvedHref}`, call `handleClick(e, href)`, and use `aria-current={isActive ? "page" : undefined}`.

- [ ] **Step 3: Make command-menu navigation work from every route**

In `src/components/command-menu.tsx`, import `FileText`, `usePathname`, and `useRouter`. Inside `CommandMenu`, add:

```tsx
const pathname = usePathname();
const router = useRouter();

const goToSection = useCallback(
	(id: string) => {
		setOpen(false);
		if (pathname === "/") {
			jumpToSection(`#${id}`);
			return;
		}
		router.push(`/#${id}`);
	},
	[pathname, router],
);

const openResume = useCallback(() => {
	setOpen(false);
	router.push("/resume");
}, [router]);
```

Replace the section item's selection callback with `onSelect={() => goToSection(s.id)}`. Add this item as the first row in the `Links` group:

```tsx
<Command.Item
	value="resume cv work experience career"
	onSelect={openResume}
	className={ITEM_CLASS}
>
	<FileText className={ICON_CLASS} strokeWidth={1.5} />
	<span>Resume</span>
</Command.Item>
```

- [ ] **Step 4: Create route-specific structured data**

Create `src/components/resume/resume-json-ld.tsx`:

```tsx
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
```

Import and render `<ResumeJsonLd />` inside `src/app/resume/page.tsx`, after the footer wrapper.

- [ ] **Step 5: Add the résumé URL to the sitemap**

Return both entries from `src/app/sitemap.ts`:

```ts
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
];
```

- [ ] **Step 6: Run route integration checks**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

Expected: all commands PASS; build output includes `/resume` and `/sitemap.xml`.

- [ ] **Step 7: Commit discovery and navigation integration**

```bash
git add src/components/resume/resume-json-ld.tsx src/app/resume/page.tsx src/components/header.tsx src/components/command-menu.tsx src/lib/constants.ts src/app/sitemap.ts
git commit -m "feat(resume): integrate navigation and discovery"
```

---

### Task 5: Verify responsive behavior, PDF parsing, and final evidence

**Files:**
- Create: `docs/audits/2026-07-13-resume-verification.md`
- Modify: `src/components/resume/resume.module.css` only if the measured PDF violates the approved two-page contract.

**Interfaces:**
- Consumes: completed `/resume` route.
- Produces: reproducible evidence for web rendering, two-page PDF output, text extraction, file size, and repository verification.

- [ ] **Step 1: Run the complete repository gate**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all commands exit 0.

- [ ] **Step 2: Start the production server**

Run: `pnpm start`

Expected: Next.js serves the built site at `http://localhost:3000`.

- [ ] **Step 3: Capture desktop and mobile web evidence**

Run:

```bash
google-chrome --headless --no-sandbox --disable-gpu --window-size=1440,1800 --screenshot=/tmp/soheil-resume-desktop.png http://localhost:3000/resume
google-chrome --headless --no-sandbox --disable-gpu --window-size=390,844 --screenshot=/tmp/soheil-resume-mobile.png http://localhost:3000/resume
```

Expected: both screenshots exist; neither contains horizontal clipping, overlapping fixed chrome, unreadable metadata, or a multi-column content reorder.

- [ ] **Step 4: Export the reference PDF**

Run:

```bash
google-chrome --headless --no-sandbox --disable-gpu --no-pdf-header-footer --print-to-pdf=/tmp/soheil-fakour-resume.pdf http://localhost:3000/resume
```

Expected: `/tmp/soheil-fakour-resume.pdf` exists with no browser header/footer.

- [ ] **Step 5: Prove page count, file size, and extracted reading order**

Run:

```bash
pdfinfo /tmp/soheil-fakour-resume.pdf
stat -c '%s bytes' /tmp/soheil-fakour-resume.pdf
pdftotext -layout /tmp/soheil-fakour-resume.pdf /tmp/soheil-fakour-resume.txt
sed -n '1,260p' /tmp/soheil-fakour-resume.txt
```

Expected:

- `Pages: 2`
- page size is A4
- file size is below `1048576` bytes
- text begins with `Soheil Fakour`, `Senior Frontend Engineer`, and visible contact information
- sections appear in the approved order
- `Dideban` begins page two
- no site navigation, footer, decorative glyph noise, duplicated content, or scrambled column order appears

- [ ] **Step 6: Search the extracted PDF for required and forbidden claims**

Run:

```bash
rg -n 'Soheil Fakour|Senior Frontend Engineer|Climic|MCINEXT|Xperix|Amirkabir University of Technology|React|TypeScript|Role-based access control' /tmp/soheil-fakour-resume.txt
rg -n '25%|50\+ startups|official IELTS|solo developer|Product Designer' /tmp/soheil-fakour-resume.txt
```

Expected: every required term is found; the forbidden search exits with no matches.

- [ ] **Step 7: Inspect visual PDF output**

Convert or open both PDF pages for inspection and verify:

- no bullet or heading is clipped;
- no role heading is orphaned;
- no experience article splits unnecessarily;
- typography remains readable at 100% zoom;
- page-one and page-two density feels balanced;
- links are visibly understandable from their text;
- print output is black on white with no glass, background field, navigation, footer, or export control.

If and only if the PDF is not exactly two pages, adjust only these existing print values in `resume.module.css`, in order: section padding, experience gap, bullet gap, line height, then font size. Re-run Steps 4–7 after each single-variable adjustment and retain the largest readable values that produce two pages.

- [ ] **Step 8: Record verification evidence**

Create `docs/audits/2026-07-13-resume-verification.md` after the commands above have run. Record the exact exit status for each repository command, the two screenshot viewport sizes, the exact `Pages` and `Page size` lines from `pdfinfo`, the integer byte count from `stat`, the required-term matches, the empty forbidden-term result, and the four `/tmp` artifact paths. Use headings `Repository checks`, `Responsive checks`, `PDF checks`, and `Artifacts`; do not estimate or pre-fill any measured value.

- [ ] **Step 9: Commit final verification evidence and any measured print-only tuning**

```bash
git add docs/audits/2026-07-13-resume-verification.md src/components/resume/resume.module.css
git commit -m "test(resume): verify ATS PDF output"
```

---

## Final Review Checklist

- [ ] `git diff origin/main...HEAD` contains only résumé work and approved site-wide fact reconciliation.
- [ ] The design spec and this implementation plan remain committed under `docs/superpowers/`.
- [ ] Every experience title, employer, date, and claim matches the approved evidence record.
- [ ] Xperix says the designs were supplied through Figma.
- [ ] Zaman does not imply solo ownership.
- [ ] Clinician usage at Climic is not generalized to every hospital employee or patient.
- [ ] Web and PDF render the same content from `RESUME`.
- [ ] `/resume` remains one semantic column and predominantly server-rendered.
- [ ] The PDF is exactly two A4 pages, below 1 MB, and extracts in order.
- [ ] No remote push or pull request occurs without separate user approval.
