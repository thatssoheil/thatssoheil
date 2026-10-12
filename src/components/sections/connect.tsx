import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIALS, EMAIL, type SectionId } from "@/lib/constants";
import { SectionPanel } from "@/components/sections/section-panel";

export function ConnectSection() {
	return (
		<SectionPanel
			id={"connect" satisfies SectionId}
			kind="connect"
			ariaLabel="Connect"
			eyebrow="Connect"
			heading="Say hello."
			intro="Email first. Catch me on X. Everything else, eventually."
		>
			<div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center">
				<Button
					asChild
					size="lg"
					className="h-12 w-full min-w-0 justify-center gap-2 border border-alpha-300 bg-primary text-sm shadow-[0_0_16px_color-mix(in_oklch,var(--primary)_14%,transparent)] hover:bg-primary/90 sm:w-auto sm:text-base"
				>
					<a href={`mailto:${EMAIL}`} className="min-w-0">
						<Mail className="size-5 shrink-0" />
						<span className="min-w-0 truncate">{EMAIL}</span>
					</a>
				</Button>

				<div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
					{SOCIALS.map(({ label, href, icon: Icon }) => (
						<a
							key={label}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={label}
							title={label}
							className="group flex size-11 items-center justify-center rounded-xl border border-transparent text-text-faint transition-colors hover:border-alpha-300 hover:bg-alpha-100 hover:text-foreground"
						>
							<Icon className="size-5" />
						</a>
					))}
				</div>
			</div>
		</SectionPanel>
	);
}
