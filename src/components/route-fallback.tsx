import { Button, Link, Surface } from "@/components/ui";

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
				layer="base"
				className="relative isolate mx-auto grid w-full max-w-md gap-8 overflow-hidden rounded-lg p-7 text-left shadow-xs ring ring-kumo-line sm:p-10"
			>
				<div className="grid gap-3">
					<p className="text-label uppercase text-kumo-default opacity-70">{code}</p>
					<h1 className="max-w-[15rem] text-heading font-light leading-tight text-kumo-default">
						{title}
					</h1>
				</div>

				<div className="flex items-center">
					{onAction ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onAction}
							className="h-9 px-0 text-kumo-default opacity-70 hover:bg-transparent hover:text-kumo-default"
						>
							{actionLabel}
						</Button>
					) : (
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="h-9 px-0 text-kumo-default opacity-70 hover:bg-transparent hover:text-kumo-default"
						>
							<Link variant="plain" href={actionHref}>
								{actionLabel}
							</Link>
						</Button>
					)}
				</div>
			</Surface>
		</main>
	);
}
