import type { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

/**
 * Page shell for every Playground route: fixed header, a quiet heading block
 * (eyebrow, title, intro, meta line), the content column, then the footer.
 * Content width matches the header and footer islands (max-w-4xl).
 */
export function PlaygroundShell({
	eyebrow,
	eyebrowHref = "/playground",
	title,
	intro,
	meta,
	children,
}: {
	eyebrow: string;
	eyebrowHref?: string;
	title: string;
	intro: string;
	meta?: ReactNode;
	children: ReactNode;
}) {
	return (
		<>
			<Header />

			<main
				id="main-content"
				className="relative mx-auto w-full max-w-4xl px-5 pb-20 pt-32 sm:px-8 sm:pt-40 md:px-12 lg:px-16"
			>
				<div className="max-w-2xl">
					<Link
						href={eyebrowHref}
						className="inline-block font-sans text-sm tracking-[0.2em] uppercase text-brand transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
					>
						{eyebrow}
					</Link>

					<h1 className="mt-3 text-fluid-36-48 font-sans font-light tracking-tight text-foreground">
						{title}
					</h1>

					<p className="mt-5 text-copy-16 text-text-muted">{intro}</p>

					{meta ? <div className="mt-4 text-copy-13 text-text-faint">{meta}</div> : null}
				</div>

				<div className="mt-12 flex flex-col gap-14">{children}</div>
			</main>

			<Footer />
		</>
	);
}
