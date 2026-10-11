import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Link } from "@/components/ui";

/** Shared page shell for every Playground route. */
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
						variant="plain"
						href={eyebrowHref}
						className="inline-block font-sans text-sm uppercase text-kumo-link hover:opacity-75"
					>
						{eyebrow}
					</Link>
					<h1 className="mt-3 text-display font-light text-kumo-default">{title}</h1>
					<p className="mt-5 text-body text-kumo-default opacity-80">{intro}</p>
					{meta ? <div className="mt-4 text-body-sm text-kumo-default opacity-70">{meta}</div> : null}
				</div>
				<div className="mt-12 flex flex-col gap-14">{children}</div>
			</main>
			<Footer />
		</>
	);
}
