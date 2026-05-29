import { cn } from "@/lib/utils";

/**
 * Brand mark — the monoline double-slash from the favicon.
 * First slash inherits `currentColor` (so it tracks foreground/hover); the
 * second is the signal accent. Decorative by default; pass a `title` to label it.
 */
export function LogoMark({
	className,
	title,
}: {
	className?: string;
	title?: string;
}) {
	return (
		<svg
			viewBox="0 0 20 22"
			fill="none"
			className={cn("h-5 w-auto", className)}
			role={title ? "img" : undefined}
			aria-hidden={title ? undefined : true}
			aria-label={title}
			focusable="false"
		>
			{title ? <title>{title}</title> : null}
			<path
				d="M5.2 17.5 L8.8 4.5"
				stroke="currentColor"
				strokeWidth="3.2"
				strokeLinecap="round"
			/>
			<path
				d="M11.6 17.5 L15.2 4.5"
				stroke="var(--signal-500)"
				strokeWidth="3.2"
				strokeLinecap="round"
			/>
		</svg>
	);
}
