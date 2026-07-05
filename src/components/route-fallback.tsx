import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";

type RouteFallbackProps = {
	code: string;
	title: string;
	actionLabel?: string;
	actionHref?: string;
	onAction?: () => void;
};

export function RouteFallback({
	code,
	title,
	actionLabel = "Home",
	actionHref = "/",
	onAction,
}: RouteFallbackProps) {
	return (
		<main className="relative flex min-h-stable-screen w-full items-center justify-center overflow-hidden px-5 py-20 sm:px-8">
			<Surface
				variant="panel"
				radius="lg"
				className="relative isolate mx-auto grid w-full max-w-md gap-8 overflow-hidden p-7 text-left sm:p-10"
			>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(68%_60%_at_18%_18%,color-mix(in_oklch,var(--primary)_7%,transparent),transparent_70%)]"
				/>

				<div className="relative z-10 grid gap-3">
					<p className="font-sans text-xs tracking-[0.26em] uppercase text-text-faint">
						{code}
					</p>
					<h1 className="max-w-[15rem] text-fluid-24-32 font-sans font-light leading-tight tracking-tight text-foreground">
						{title}
					</h1>
				</div>

				<div className="relative z-10 flex items-center">
					{onAction ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onAction}
							className="h-9 px-0 text-text-faint hover:bg-transparent hover:text-foreground"
						>
							{actionLabel}
						</Button>
					) : (
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="h-9 px-0 text-text-faint hover:bg-transparent hover:text-foreground"
						>
							<Link href={actionHref}>{actionLabel}</Link>
						</Button>
					)}
				</div>
			</Surface>
		</main>
	);
}
