#!/usr/bin/env node
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const resumeSource = [read("src/data/resume.ts"), read("src/lib/constants.ts")].join("\n");

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
	if (!resumeSource.includes(value)) failures.push(`missing required resume fact: ${value}`);
}
for (const pattern of forbidden) {
	if (pattern.test(resumeSource)) failures.push(`forbidden resume claim: ${pattern}`);
}

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

if (failures.length) {
	console.error("x resume-contract");
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log("ok resume-contract: required facts present and excluded claims absent");
