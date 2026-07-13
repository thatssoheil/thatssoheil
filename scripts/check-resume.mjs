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

if (failures.length) {
	console.error("x resume-contract");
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log("ok resume-contract: required facts present and excluded claims absent");
