#!/usr/bin/env node
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const readBlock = (source, marker) => {
	const markerIndex = source.indexOf(marker);
	const openingBrace = source.indexOf("{", markerIndex);
	if (markerIndex === -1 || openingBrace === -1) return "";

	let depth = 0;
	for (let index = openingBrace; index < source.length; index += 1) {
		if (source[index] === "{") depth += 1;
		if (source[index] === "}") depth -= 1;
		if (depth === 0) return source.slice(openingBrace + 1, index);
	}

	return "";
};
const resumeSource = [read("src/data/resume.ts"), read("src/lib/constants.ts")].join("\n");
const experienceBlock = (id) => {
	const start = resumeSource.indexOf(`id: "${id}"`);
	if (start === -1) return "";

	const next = resumeSource.indexOf("\n\t\t\t{\n\t\t\t\tid:", start + 1);
	return resumeSource.slice(start, next === -1 ? resumeSource.length : next);
};

const required = [
	"Senior Frontend Engineer",
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
	if (!resumeSource.includes(value)) failures.push(`missing required resume fact: ${value}`);
}
for (const pattern of forbidden) {
	if (pattern.test(resumeSource)) failures.push(`forbidden resume claim: ${pattern}`);
}

const route = read("src/app/resume/page.tsx");
const document = read("src/components/resume/resume-document.tsx");
const experience = read("src/components/resume/experience-entry.tsx");
const dateRange = read("src/components/resume/date-range.tsx");
const exportControls = read("src/components/resume/export-controls.tsx");

for (const [source, pattern, message] of [
	[route, /<main[^>]+id="main-content"/, "resume route needs a main landmark"],
	[document, /<h1/, "resume document needs one h1"],
	[document, /<address/, "contact details need a body address"],
	[document, /Professional Summary/, "standard summary heading missing"],
	[document, /Technical Skills/, "standard skills heading missing"],
	[document, /Work Experience/, "standard experience heading missing"],
	[document, /Selected Project/, "standard project heading missing"],
	[document, /Education and Recognition/, "standard education heading missing"],
	[document, /Additional Information/, "standard additional-information heading missing"],
	[experience, /<article/, "experience entries need article elements"],
	[dateRange, /<time dateTime={startDate}>/, "date ranges need a semantic start time"],
	[dateRange, /endDate \? <time dateTime={endDate}>/, "completed date ranges need a semantic end time"],
	[exportControls, /Save as PDF[^\n]+disable [^\n]+Headers and footers/, "export guidance must disable browser headers and footers"],
]) {
	if (!pattern.test(source)) failures.push(message);
}

const xperix = experienceBlock("mcinext");
const zaman = experienceBlock("zaman");
const climic = experienceBlock("climic");
const dideban = experienceBlock("dideban");

if (!/Shipped production Xperix features for the Oman market from supplied Figma designs/.test(xperix)) {
	failures.push("Xperix work must be described as implementation from supplied Figma designs");
}
if (!/dateLabel: "Feb 2026 — Present"[\s\S]*startDate: "2026-02"/.test(climic)) {
	failures.push("Climic experience needs the evidence-backed February 2026 start date");
}
if (!/location: "Tehran, Iran"/.test(dideban)) {
	failures.push("Dideban experience needs its evidence-backed Tehran location");
}
if (/\b(?:sole|solo|only) (?:Frontend Engineer|frontend developer|developer|engineer)\b/i.test(zaman)) {
	failures.push("Zaman experience must not imply solo frontend ownership");
}
if (/\b(?:hospital staff|patients?) (?:use|uses|used|using|access|accesses|accessed)\b/i.test(climic)
	|| /\b(?:used|accessed) by (?:patients?|(?:all )?(?:Mom Fertility Hospital|hospital) staff)\b/i.test(climic)) {
	failures.push("Climic experience must not generalize clinician-facing use to hospital staff or patients");
}

const css = read("src/components/resume/resume.module.css");
const printCss = readBlock(css, "@media print");

if (!/@page\s*{[^}]*size:\s*A4 portrait/s.test(css)) {
	failures.push("print CSS needs A4 portrait @page");
}
if (!/@page\s*{[^}]*background:\s*#fff/s.test(css)) {
	failures.push("printed page canvas must be explicitly white");
}
if (!printCss) failures.push("print media rules missing");

for (const [pattern, message] of [
	[/break-before:\s*page/, "page-two boundary missing"],
	[/break-inside:\s*avoid/, "role split protection missing"],
	[/\.screenOnly[^}]*display:\s*none/s, "web-only chrome must disappear in print"],
	[/font-family:\s*Arial/, "print needs conservative system typography"],
	[/:global\(html\),\s*:global\(body\)\s*{[^}]*width:\s*(?:auto|100%)/s, "print roots must fit within @page margins"],
	[/:global\(html\)\s*{[^}]*color-scheme:\s*only light\s*!important/s, "print root must override the scheduled dark color scheme"],
]) {
	if (!pattern.test(printCss)) failures.push(message);
}

if (!/\.toolbar button:focus-visible\s*{[^}]*outline:\s*[^;}]*transparent/s.test(css)) {
	failures.push("export control needs an outline fallback for forced colors");
}

if (failures.length) {
	console.error("x resume-contract");
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log("ok resume-contract: required facts present and excluded claims absent");
