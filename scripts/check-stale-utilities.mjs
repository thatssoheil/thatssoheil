#!/usr/bin/env node
/**
 * Fail when product source reintroduces names retired by the Kumo migration.
 * Historical ADRs/specs and the checker itself are intentionally outside scope.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const SCAN_ROOTS = ["src", "scripts"];
const EXTRA_FILES = ["package.json", "pnpm-lock.yaml"];
const SELF = resolve(ROOT, "scripts/check-stale-utilities.mjs");
const EXCLUDED = new Set([
	resolve(ROOT, "src/middleware.ts"),
	SELF,
]);
const EXCLUDED_PREFIXES = [resolve(ROOT, "src/app/llms.txt") + "/"];
const TEXT_FILE = /\.(?:[cm]?js|[cm]?ts|jsx|tsx|css|json|ya?ml|html|txt)$/i;

const RETIRED = [
	["glass material utilities", /(?<!-)\bglass(?:-(?:panel|edge|strong|refract))?\b|--glass-[\w-]+/g],
	["backdrop-filter rendering", /(?:backdrop-filter|-webkit-backdrop-filter|\bbackdrop-(?:blur|filter|saturate)(?:-[\w.[\]/:_-]+)?)/g],
	["signal field and structure grid", /\b(?:SignalField|signal-field|StructureGrid|structure-grid|signal-drift-[\w-]+)\b|--(?:field|grid)-[\w-]+/g],
	["refraction implementation", /\b(?:SignalGlassFilter|useRefractionSupported)\b|signal-glass-refract|use-refraction-supported/g],
	["signal and ink color ramps", /--(?:signal|ink)-[\w-]+|\b(?:bg|text|border|ring)-(?:signal|ink)-[\w-]+\b|\b(?:signal|ink)-\d{2,3}\b/g],
	["old shadcn semantic variables", /--(?:background|foreground|card(?:-[\w-]+)?|popover(?:-[\w-]+)?|primary(?:-[\w-]+)?|secondary(?:-[\w-]+)?|muted(?:-[\w-]+)?|accent(?:-[\w-]+)?|destructive(?:-[\w-]+)?|border|input|ring|brand|color-brand|text-(?:brand|muted|faint))\b/g],
	["old shadcn semantic utilities", /\b(?:bg|text|border|ring)-(?:background|foreground|card(?:-foreground)?|popover(?:-foreground)?|primary(?:-foreground)?|secondary(?:-foreground)?|muted(?:-foreground)?|accent(?:-foreground)?|destructive(?:-foreground)?|border|input|ring|brand)(?:\/\d{1,3})?\b/g],
	["alpha ramp variables and utilities", /--alpha-\d+\b|\b(?:bg|text|border|ring|fill)-alpha-\d+\b|\balpha-\d+\b/g],
	["old elevation and gradient names", /--(?:shadow-(?:border|soft|elevated|glow)|gradient-(?:hero|surface))\b|\b(?:shadow-(?:border|soft|elevated|glow)|gradient-(?:hero|surface))\b/g],
	["old typography utilities", /\btext-(?:heading|copy|label|button|fluid)-[\w.[\]/:_-]+/g],
	["old motion and focus variables", /--(?:ease-[\w-]+|dur-[\w-]+|ring-focus)\b/g],
	["retired fonts and cipher wordmark", /\b(?:Lexend|Geist(?:\s+Mono)?|cipher)\b|--font-(?:lexend|geist(?:-mono)?|cipher)\b/g],
	["retired ambient wordmark animation", /\bmotto-ai-(?:word|flow)\b/g],
	["dark utility or compatibility class", /\bdark:|\.dark\b|classList\.(?:add|remove|toggle)\(\s*["']dark["']|className\s*=\s*["'][^"']*\bdark\b/g],
	["scheduled theme references", /\btime-scheduled\b/g],
	["retired icon package or logo path", /lucide-react|brand-icons\.tsx/g],
];

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		const info = statSync(path);
		if (info.isDirectory()) {
			if (name === "node_modules" || name.startsWith(".")) continue;
			walk(path, out);
		} else if (TEXT_FILE.test(name)) {
			out.push(path);
		}
	}
	return out;
}

const files = [
	...SCAN_ROOTS.flatMap((dir) => walk(join(ROOT, dir))),
	...EXTRA_FILES.map((file) => join(ROOT, file)),
].filter((file) => {
	const path = resolve(file);
	return !EXCLUDED.has(path) && !EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix));
});

const findings = [];
for (const file of files) {
	const text = readFileSync(file, "utf8");
	for (const [family, pattern] of RETIRED) {
		pattern.lastIndex = 0;
		for (const match of text.matchAll(pattern)) {
			const line = text.slice(0, match.index).split("\n").length;
			findings.push(`${relative(ROOT, file)}:${line}: ${family}: ${match[0]}`);
		}
	}
	const rel = relative(ROOT, file).replaceAll("\\", "/");
	if (/src\/components\/signal-field\//.test(rel)) findings.push(`${rel}: retired component directory`);
}

if (findings.length) {
	console.error(`✗ stale-utilities: ${findings.length} retired reference(s) found:`);
	console.error(findings.join("\n"));
	process.exit(1);
}

console.log(`✓ stale-utilities: no references to ${RETIRED.length} retired-name families across ${files.length} product/source files`);
