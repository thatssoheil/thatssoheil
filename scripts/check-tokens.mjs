#!/usr/bin/env node
/**
 * Token-coverage check (audit #4): every `var(--token)` referenced in the app must be
 * DEFINED in globals.css — so a renamed/deleted token (or a /ds reference that drifts
 * from the source) fails CI instead of shipping a dangling reference. Cheap guard, no
 * test harness. Run via `pnpm check:tokens` (wired into `pnpm test`).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const GLOBALS = join(ROOT, "src/app/globals.css");

// Tokens set outside globals.css (next/font runtime vars, Tailwind internals): allowed.
const ALLOW = [/^--font-(lexend|cipher)$/, /^--tw-/];

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		const s = statSync(p);
		if (s.isDirectory()) {
			if (name === "node_modules" || name.startsWith(".")) continue;
			walk(p, out);
		} else if (/\.(tsx?|css)$/.test(name)) {
			out.push(p);
		}
	}
	return out;
}

const css = readFileSync(GLOBALS, "utf8");
const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));

const referenced = new Map(); // token -> first file:line
for (const file of walk(join(ROOT, "src"))) {
	const text = readFileSync(file, "utf8");
	const lines = text.split("\n");
	lines.forEach((line, i) => {
		// Only complete refs: `var(--token)` / `var(--token, …)`. A dynamic
		// `var(--prefix-${n})` is followed by `$`, not `)`/`,`, so it's skipped.
		for (const m of line.matchAll(/var\((--[\w-]+)\s*[),]/g)) {
			const t = m[1];
			if (!referenced.has(t)) referenced.set(t, `${file.replace(ROOT + "/", "")}:${i + 1}`);
		}
	});
}

const missing = [];
for (const [token, where] of referenced) {
	if (defined.has(token)) continue;
	if (ALLOW.some((re) => re.test(token))) continue;
	missing.push(`  ${token}  (first seen ${where})`);
}

if (missing.length) {
	console.error(`✗ token-coverage: ${missing.length} referenced token(s) not defined in globals.css:`);
	console.error(missing.join("\n"));
	process.exit(1);
}
console.log(`✓ token-coverage: all ${referenced.size} referenced tokens resolve in globals.css`);
