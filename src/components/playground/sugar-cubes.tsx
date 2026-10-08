"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SugarData, SugarProduct } from "@/lib/playground/types";
import {
	MAX_CUBES,
	cubeParts,
	cubeText,
	formatGrams,
	guidelinePct,
	servingInfo,
	sugarUnit,
} from "@/lib/playground/sugar-parse";

// The sugar check: submit a query and see the product's sugars as a stack of
// cubes (about 4 grams each) against the WHO's daily guideline. Search is
// submitted only - Open Food Facts forbids search-as-you-type, so this
// component only drives the navigation; results arrive rendered from the
// server (live search, or the committed snapshot).

const CHIPS = [
	"coca-cola",
	"coca-cola zero",
	"red bull",
	"nutella",
	"oreo",
	"snickers",
	"frosted flakes",
	"heinz tomato ketchup",
];

/** One cube; fill < 1 draws the partial cube at the end of a stack. */
function Cube({ fill }: { fill: number }) {
	return (
		<span className="relative h-3.5 w-3.5 rounded-[3px] border border-alpha-500" aria-hidden="true">
			{fill > 0 ? (
				<span
					className="absolute inset-y-0 left-0 rounded-[2px] bg-alpha-600"
					style={{ width: `${Math.round(Math.min(fill, 1) * 1000) / 10}%` }}
				/>
			) : null}
		</span>
	);
}

/** The cube stack for a sugar weight; decorative (the number is in the text). */
function CubeStack({ grams }: { grams: number }) {
	const { whole, frac, capped } = cubeParts(grams, MAX_CUBES);
	const showPartial = frac > 0.05 && whole < MAX_CUBES;
	return (
		<span className="flex flex-wrap items-center gap-[3px]" aria-hidden="true">
			{whole === 0 && !showPartial ? <Cube fill={0} /> : null}
			{Array.from({ length: whole }, (_, index) => (
				<Cube key={index} fill={1} />
			))}
			{showPartial ? <Cube fill={frac} /> : null}
			{capped ? <span className="ml-1 text-label-12-mono text-text-faint">+</span> : null}
		</span>
	);
}

function SugarCard({ product }: { product: SugarProduct }) {
	const unit = sugarUnit(product.quantity, product.servingSize);
	const serving = servingInfo(product);
	const servingLead =
		serving === null
			? null
			: /^\d/.test(serving.descriptor)
				? `Per serving (${serving.descriptor})`
				: `Per ${serving.descriptor}`;
	const entryUrl = `https://world.openfoodfacts.org/product/${product.code}`;

	return (
		<article className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
			<div className="flex flex-col gap-0.5">
				<a
					href={entryUrl}
					target="_blank"
					rel="noreferrer"
					className="text-copy-16 text-foreground transition-colors hover:text-brand"
				>
					{product.name}
				</a>
				{product.brands ? <p className="text-copy-13 text-text-faint">{product.brands}</p> : null}
			</div>

			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<CubeStack grams={product.sugars100g} />
				<p className="text-copy-14 text-text-muted">
					<span className="text-foreground">{formatGrams(product.sugars100g)} g sugar</span> per {unit} -
					covers {guidelinePct(product.sugars100g)}% of the 25 g daily guideline
				</p>
			</div>

			{serving && servingLead ? (
				<p className="text-copy-13 text-text-muted">
					{servingLead}: {formatGrams(serving.grams)} g - {cubeText(serving.grams)}
				</p>
			) : null}

			<div className="mt-auto flex items-center justify-between gap-3">
				<p className="text-label-12-mono text-text-faint">
					{product.quantity ? `${product.quantity} pack` : "\u00a0"}
				</p>
				<a
					href={entryUrl}
					target="_blank"
					rel="noreferrer"
					className="text-label-12-mono text-text-faint transition-colors hover:text-brand"
				>
					Open Food Facts
				</a>
			</div>
		</article>
	);
}

export function SugarCubes({ data }: { data: SugarData }) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [value, setValue] = useState(data.query);

	function go(raw: string) {
		const query = raw.replace(/\s+/g, " ").trim();
		if (query === "") return;
		startTransition(() => {
			router.push(`/playground/sugar-cubes?q=${encodeURIComponent(query)}`);
		});
	}

	const matchWord = data.results.length === 1 ? "match" : "matches";

	return (
		<div className="flex flex-col gap-6">
			<div className="rounded-xl border border-border bg-card px-4 py-5 sm:px-6">
				<form
					action="/playground/sugar-cubes"
					method="get"
					onSubmit={(event) => {
						event.preventDefault();
						go(value);
					}}
					className="flex gap-2"
				>
					<label htmlFor="sugar-query" className="sr-only">
						Search a packaged food or drink
					</label>
					<input
						id="sugar-query"
						name="q"
						type="search"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						placeholder="Search a food or drink - nutella, cola, cookies..."
						autoComplete="off"
						enterKeyHint="search"
						className="h-11 w-full min-w-0 flex-1 rounded-xl border border-input bg-background px-4 text-copy-14 text-foreground placeholder:text-text-faint focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
					/>
					<button
						type="submit"
						className="h-11 shrink-0 rounded-xl border border-border bg-alpha-200 px-5 text-copy-14 text-foreground transition-colors hover:bg-alpha-300 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
					>
						{pending ? "Checking..." : "Check"}
					</button>
				</form>

				<div className="mt-3 flex flex-wrap items-center gap-2">
					<span className="text-label-12 uppercase tracking-[0.14em] text-text-faint">Try</span>
					{CHIPS.map((chip) => (
						<Link
							key={chip}
							href={`/playground/sugar-cubes?q=${encodeURIComponent(chip)}`}
							className="rounded-full border border-border px-3 py-1 text-copy-13 text-text-muted transition-colors hover:border-alpha-500 hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
						>
							{chip}
						</Link>
					))}
				</div>
			</div>

			{data.results.length > 0 ? (
				<ul className="grid gap-3 sm:grid-cols-2">
					{data.results.map((product) => (
						<li key={product.code} className="flex">
							<SugarCard product={product} />
						</li>
					))}
				</ul>
			) : (
				<p className="max-w-xl text-copy-14 text-text-muted">
					{data.totalCount !== null && data.totalCount > 0
						? `Found ${data.totalCount.toLocaleString("en-US")} matches for "${data.query}", but none carry a sugars figure - try a brand name or a plainer search.`
						: `No matches for "${data.query}" in Open Food Facts - try a brand name or a plainer search.`}
				</p>
			)}

			{data.mode === "search" && data.results.length > 0 ? (
				<p className="text-copy-13 text-text-faint">
					Showing {data.results.length} {matchWord} of{" "}
					{data.totalCount === null ? "the results" : data.totalCount.toLocaleString("en-US")} -
					entries without a sugars figure are skipped.
				</p>
			) : null}
		</div>
	);
}
