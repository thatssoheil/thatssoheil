import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const EXPECTED_CSP_POLICY =
	"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";

export function assertCspPolicy(root = process.cwd()) {
	const middleware = readFileSync(resolve(root, "src/middleware.ts"), "utf8");
	const policies = [
		...middleware.matchAll(/"Content-Security-Policy"\s*:\s*"([^"]+)"/g),
	];

	if (policies.length !== 1 || policies[0][1] !== EXPECTED_CSP_POLICY) {
		throw new Error(
			"CSP policy drift: src/middleware.ts must set exactly the documented pragma baseline (script-src 'self' 'unsafe-inline', without hashes or nonces).",
		);
	}

	console.log("✓ CSP policy matches the documented pragmatic baseline");
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
	assertCspPolicy();
}
