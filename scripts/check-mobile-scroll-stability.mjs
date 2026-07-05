import { readFileSync } from "node:fs";
import { relative } from "node:path";

const ROOT = process.cwd();

const CHECKS = [
	{
		file: "src/components/sections/hero.tsx",
		forbidden: [
			/\b(?:h|min-h)-\[100(?:dvh|svh|vh)\]/g,
			/\b(?:h|min-h)-(?:dvh|svh|screen)\b/g,
		],
		required: [/\bh-stable-screen\b/],
		message: "top-level hero height must not use dynamic viewport units",
	},
	{
		file: "src/components/sections/section-panel.tsx",
		forbidden: [
			/\b(?:h|min-h)-\[100(?:dvh|svh|vh)\]/g,
			/\b(?:h|min-h)-(?:dvh|svh|screen)\b/g,
			/\bmt-\[[^\]]*(?:dvh|svh|vh)\]/g,
		],
		required: [/\bmin-h-stable-screen\b/, /\bmt-stable-screen-gap\b/],
		message: "stable section panel shell must not use dynamic viewport units",
	},
	{
		file: "src/components/sections/manifesto.tsx",
		forbidden: [
			/\b(?:h|min-h)-\[100(?:dvh|svh|vh)\]/g,
			/\b(?:h|min-h)-(?:dvh|svh|screen)\b/g,
			/\bmin-h-stable-screen\b/g,
			/\bmt-stable-screen-gap\b/g,
		],
		required: [/<SectionPanel\b/],
		message: "manifesto section must use the stable section panel module",
	},
	{
		file: "src/components/sections/connect.tsx",
		forbidden: [
			/\b(?:h|min-h)-\[100(?:dvh|svh|vh)\]/g,
			/\b(?:h|min-h)-(?:dvh|svh|screen)\b/g,
			/\bmin-h-stable-screen\b/g,
			/\bmt-stable-screen-gap\b/g,
		],
		required: [/<SectionPanel\b/],
		message: "connect section must use the stable section panel module",
	},
];

const failures = [];

for (const check of CHECKS) {
	const source = readFileSync(check.file, "utf8");
	for (const pattern of check.forbidden) {
		for (const match of source.matchAll(pattern)) {
			failures.push({
				file: relative(ROOT, check.file),
				value: match[0],
				message: check.message,
			});
		}
	}
	for (const pattern of check.required) {
		if (!pattern.test(source)) {
			failures.push({
				file: relative(ROOT, check.file),
				value: pattern.source,
				message: "section shell must use the stable viewport utility",
			});
		}
	}
}

if (failures.length > 0) {
	console.error("x mobile-scroll-stability: unstable section shells found");
	for (const failure of failures) {
		console.error(`- ${failure.file}: ${failure.value} - ${failure.message}`);
	}
	process.exit(1);
}

console.log("ok mobile-scroll-stability: section shells use stable viewport units");
