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
				dateLabel: "Feb 2026 — Present",
				startDate: "2026-02",
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
				location: "Tehran, Iran",
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
		additional: ["English — Advanced Professional Proficiency", AVAILABILITY],
	},
} as const satisfies ResumeData;
