import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

type RouteFallbackProps = {
	code: string;
	eyebrow: string;
	title: string;
	body: string;
	actionLabel?: string;
	actionHref?: string;
	onAction?: () => void;
};

export function RouteFallback({
	code,
	eyebrow,
	title,
	body,
	actionLabel = "Return home",
	actionHref = "/",
	onAction,
}: RouteFallbackProps) {
	return (
		<main className="relative flex min-h-stable-screen w-full items-center justify-center overflow-hidden px-5 py-24 sm:px-8 md:px-12 lg:px-16">
			<Surface
				variant="panel"
				radius="lg"
				className="relative isolate mx-auto grid w-full max-w-3xl gap-10 overflow-hidden p-6 text-left sm:p-12 md:p-16"
			>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_18%_18%,color-mix(in_oklch,var(--primary)_9%,transparent),transparent_68%)]"
				/>

				<div className="relative z-10 flex items-center justify-between gap-6">
					<div className="flex min-h-11 items-center gap-2.5 font-sans text-sm tracking-tight text-foreground">
						<LogoMark className="h-[18px]" />
						<span>Soheil Fakour</span>
					</div>
					<p className="font-sans text-sm tracking-[0.2em] uppercase text-text-faint">
						{code}
					</p>
				</div>

				<div className="relative z-10 max-w-2xl">
					<p className="font-sans text-sm tracking-[0.2em] uppercase text-brand">
						{eyebrow}
					</p>

					<h1 className="mt-3 text-fluid-36-60 font-sans font-light tracking-tight text-foreground">
						{title}
					</h1>

					<p className="mt-5 max-w-xl text-lg font-light leading-relaxed text-text-muted">
						{body}
					</p>
				</div>

				<div className="relative z-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
					{onAction ? (
						<Button
							type="button"
							size="lg"
							onClick={onAction}
							className="h-12 justify-center border border-alpha-300 bg-primary text-sm shadow-[0_0_16px_color-mix(in_oklch,var(--primary)_14%,transparent)] hover:bg-primary/90 sm:text-base"
						>
							{actionLabel}
						</Button>
					) : (
						<Button
							asChild
							size="lg"
							className="h-12 justify-center border border-alpha-300 bg-primary text-sm shadow-[0_0_16px_color-mix(in_oklch,var(--primary)_14%,transparent)] hover:bg-primary/90 sm:text-base"
						>
							<Link href={actionHref}>{actionLabel}</Link>
						</Button>
					)}
				</div>
			</Surface>
		</main>
	);
}
