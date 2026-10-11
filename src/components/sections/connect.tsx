import { EnvelopeSimple } from "@phosphor-icons/react/ssr";
import { Button, Link } from "@/components/ui";
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
			introNote="Currently open to remote and on-site roles in Tehran, and remote roles across the GCC and Europe."
		>
			<div className="flex w-full flex-col items-stretch gap-4 sm:flex-row sm:items-center">
				<Button
					asChild
					variant="primary"
					size="lg"
					className="h-11 w-full min-w-0 justify-center gap-2 sm:w-auto"
				>
					<Link href={`mailto:${EMAIL}`} variant="plain" className="min-w-0">
						<EnvelopeSimple className="size-5 shrink-0" aria-hidden="true" />
						<span className="min-w-0 truncate">{EMAIL}</span>
					</Link>
				</Button>

				<div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
					{SOCIALS.map(({ label, href, icon: Icon }) => (
						<Link
							key={label}
							href={href}
							target="_blank"
							variant="plain"
							aria-label={label}
							title={label}
							className="flex size-11 items-center justify-center gap-0 rounded-lg border border-transparent opacity-70 hover:border-kumo-hairline hover:bg-kumo-fill-hover"
						>
							<Icon className="size-5" weight="regular" aria-hidden="true" />
						</Link>
					))}
				</div>
			</div>
		</SectionPanel>
	);
}
