import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
	{
		ignores: ["cloudflare-env.d.ts", ".open-next/**", ".next/**"],
	},
	...coreWebVitals,
	...typescript,
];

export default config;
