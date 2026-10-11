"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { FreeShelfBook, FreeShelfData, FreeShelfWindowKey } from "@/lib/playground/types";
import { Link, Button } from "@/components/ui";
// The shelf: Project Gutenberg's most-downloaded chart behind one toggle
// (yesterday / last 7 days / last 30 days). The whole chart arrives with the
// page - switching windows swaps lists, nothing is fetched here. Covers load
// from PG's cover cache; a missing cover becomes a plain typographic tile so
// nothing ever shows a broken image.

const WINDOWS: { key: FreeShelfWindowKey; label: string; note: string }[] = [
	{ key: "last1", label: "Yesterday", note: "yesterday's downloads" },
	{ key: "last7", label: "Last 7 days", note: "downloads over the last 7 days" },
	{ key: "last30", label: "Last 30 days", note: "downloads over the last 30 days" },
];

/** The page displays the top 20 per window; the data carries 30. */
const DISPLAY = 20;

function coverUrl(id: number): string {
	return `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`;
}

function ShelfCover({ book }: { book: FreeShelfBook }) {
	const [failed, setFailed] = useState(false);
	const imgRef = useRef<HTMLImageElement | null>(null);

	// The img is in the SSR markup, so its load can fail before React
	// hydrates - onError would miss that window and leave a broken image.
	// Check once on mount: complete with zero width means the load already
	// failed.
	useEffect(() => {
		const img = imgRef.current;
		if (img && img.complete && img.naturalWidth === 0) setFailed(true);
	}, []);

	if (failed) {
		return (
			<div className="flex aspect-[19/30] w-full items-center justify-center rounded-lg border border-kumo-hairline bg-kumo-recessed p-3">
				<span className="text-center text-body-sm text-kumo-default opacity-80">{book.title}</span>
			</div>
		);
	}
	return (
		// PG's own cover cache, hotlinked at small scale; the Next image
		// optimizer is not used for these.
		// eslint-disable-next-line @next/next/no-img-element
		<img
			ref={imgRef}
			src={coverUrl(book.id)}
			alt=""
			loading="lazy"
			decoding="async"
			onError={() => setFailed(true)}
			className="aspect-[19/30] w-full rounded-lg border border-kumo-hairline bg-kumo-recessed object-cover"
		/>
	);
}

function ShelfCard({ book }: { book: FreeShelfBook }) {
	return (
		<Link
			href={`https://www.gutenberg.org/ebooks/${book.id}`}
			target="_blank"
			rel="noreferrer"
			className="group flex flex-col gap-3 rounded-lg focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumo-focus"
		>
			<ShelfCover book={book} />
			<div className="flex flex-col gap-0.5">
				<p className="text-body-sm text-kumo-default  group-hover:text-kumo-link">
					{book.title}
				</p>
				{book.author ? <p className="text-body-sm text-kumo-default opacity-70">{book.author}</p> : null}
				<p className="mt-1 text-code text-kumo-default opacity-70">
					{book.downloads.toLocaleString("en-US")} downloads
				</p>
			</div>
		</Link>
	);
}

export function FreeShelf({ data }: { data: FreeShelfData }) {
	const [active, setActive] = useState<FreeShelfWindowKey>("last7");
	const activeWindow = WINDOWS.find((window) => window.key === active) ?? WINDOWS[1];
	const books = data.windows[active].slice(0, DISPLAY);

	return (
		<div className="rounded-lg border border-kumo-hairline bg-kumo-base px-4 py-5 sm:px-6">
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
				<div
					role="group"
					aria-label="Chart window"
					className="inline-flex rounded-full border border-kumo-hairline p-0.5"
				>
					{WINDOWS.map((window) => (
						<Button variant="ghost" size="default"
							key={window.key}
							type="button"
							onClick={() => setActive(window.key)}
							aria-pressed={active === window.key}
							className={cn(
								"rounded-full px-3 py-1.5 text-body-sm  focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumo-focus",
								active === window.key
									? "bg-kumo-fill-hover text-kumo-default"
									: "text-kumo-default opacity-70 hover:text-kumo-default hover:opacity-80",
							)}
						>
							{window.label}
						</Button>
					))}
				</div>
				<p className="text-body-sm text-kumo-default opacity-70">
					Ranked by {activeWindow.note} - counted once per address per day, robots excluded.
				</p>
			</div>

			<ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
				{books.map((book) => (
					<li key={book.id}>
						<ShelfCard book={book} />
					</li>
				))}
			</ul>

			<p className="mt-6 text-body-sm text-kumo-default opacity-70">
				Every entry opens its Project Gutenberg page, where the full text is free to read.
			</p>
		</div>
	);
}
