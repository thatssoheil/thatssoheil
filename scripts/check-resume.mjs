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

const css = read("src/components/resume/resume.module.css");
const printCss = readBlock(css, "@media print");

if (!/@page\s*{[^}]*size:\s*A4 portrait/s.test(css)) {
	failures.push("print CSS needs A4 portrait @page");
}
if (!printCss) failures.push("print media rules missing");

for (const [pattern, message] of [
	[/break-before:\s*page/, "page-two boundary missing"],
	[/break-inside:\s*avoid/, "role split protection missing"],
	[/\.screenOnly[^}]*display:\s*none/s, "web-only chrome must disappear in print"],
	[/font-family:\s*Arial/, "print needs conservative system typography"],
	[/:global\(html\),\s*:global\(body\)\s*{[^}]*width:\s*(?:auto|100%)/s, "print roots must fit within @page margins"],
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
