"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, VisuallyHidden } from "radix-ui";
import {
	Hash,
	EnvelopeSimple,
	Copy,
	MagnifyingGlass,
	List,
	ArrowElbowDownLeft,
	ArrowSquareOut,
	FileText,
	Flask,
} from "@phosphor-icons/react/ssr";
import { SECTIONS, SOCIALS, EMAIL } from "@/lib/constants";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { jumpToSection } from "@/lib/section-navigation";
import { cn } from "@/lib/utils";
import { surfaceRole, textRole, typeRole, Button } from "@/components/ui";

const ITEM_CLASS = [
	"group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm data-[selected=true]:bg-kumo-fill-hover data-[selected=true]:text-kumo-default sm:py-2",
	textRole.muted,
].join(" ");

const ICON_CLASS =
	"size-4 shrink-0 text-kumo-default opacity-70 group-data-[selected=true]:text-kumo-link";

export function CommandMenu() {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	const coarsePointer = useCoarsePointer();

	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setOpen((current) => !current);
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, []);

	const openLink = useCallback((href: string) => {
		setOpen(false);
		window.open(href, "_blank", "noopener,noreferrer");
	}, []);

	const goToSection = useCallback(
		(id: string) => {
			setOpen(false);
			if (pathname === "/") {
				jumpToSection(`#${id}`);
				return;
			}
			router.push(`/#${id}`);
		},
		[pathname, router],
	);

	const openResume = useCallback(() => {
		setOpen(false);
		router.push("/resume");
	}, [router]);

	const openPlayground = useCallback(() => {
		setOpen(false);
		router.push("/playground");
	}, [router]);

	const sendEmail = useCallback(() => {
		setOpen(false);
		window.location.href = `mailto:${EMAIL}`;
	}, []);

	const copyEmail = useCallback(() => {
		void navigator.clipboard?.writeText(EMAIL).catch(() => {
			// The status remains useful when browser or OS policy denies clipboard access.
		});
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, []);

	return (
		<>
			<Button
				variant="ghost"
				size="default"
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open command menu"
				className="hidden h-9 items-center gap-1.5 rounded-lg border border-kumo-hairline px-2.5 text-sm text-kumo-default opacity-75 hover:border-kumo-line hover:bg-kumo-fill-hover hover:opacity-100 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumo-focus sm:inline-flex"
			>
				<span className="font-sans" aria-hidden="true">⌘</span>
				<span aria-hidden="true">K</span>
			</Button>

			<Button
				variant="ghost"
				size="default"
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open command menu"
				className="-mr-2 inline-flex size-11 items-center justify-center rounded-lg text-kumo-default opacity-75 hover:bg-kumo-fill-hover hover:opacity-100 focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumo-focus sm:hidden"
			>
				<List className="size-5" aria-hidden="true" />
			</Button>

			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="cf-dialog-overlay fixed inset-0 z-[var(--z-overlay)] bg-kumo-overlay" />
					<Dialog.Content
						aria-describedby={undefined}
						className={cn(
							surfaceRole.commandMenuPanel,
							"cf-dialog-content fixed left-1/2 top-[16%] z-[var(--z-modal)] w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden text-kumo-default outline-none",
						)}
					>
						<VisuallyHidden.Root>
							<Dialog.Title>Command menu</Dialog.Title>
						</VisuallyHidden.Root>

						<Command
							label="Command menu"
							className={cn(
								"[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5",
								typeRole.commandGroupHeading,
							)}
						>
							<div className="flex items-center gap-2 border-b border-kumo-hairline px-4">
								<MagnifyingGlass className="size-4 shrink-0 text-kumo-default opacity-70" aria-hidden="true" />
								<Command.Input
									autoFocus={!coarsePointer}
									placeholder="Jump to a section, open a link…"
									className="w-full rounded-md bg-transparent py-3.5 text-sm font-sans text-kumo-default outline-none placeholder:text-kumo-default placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-kumo-focus"
								/>
							</div>

							<Command.List className="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
								<Command.Empty className="py-8 text-center text-sm text-kumo-default opacity-70">
									No results.
								</Command.Empty>

								<Command.Group heading="Sections">
									{SECTIONS.map((section) => (
										<Command.Item
											key={section.id}
											value={`section ${section.label}`}
											onSelect={() => goToSection(section.id)}
											className={ITEM_CLASS}
										>
											<Hash className={ICON_CLASS} weight="regular" aria-hidden="true" />
											<span>{section.label}</span>
											<ArrowElbowDownLeft className="ml-auto size-3.5 shrink-0 opacity-0 group-data-[selected=true]:opacity-40" weight="regular" aria-hidden="true" />
										</Command.Item>
									))}
								</Command.Group>

								<Command.Group heading="Links">
									<Command.Item
										value="playground experiments tracker macro notes data"
										onSelect={openPlayground}
										className={ITEM_CLASS}
									>
										<Flask className={ICON_CLASS} weight="regular" aria-hidden="true" />
										<span>Playground</span>
									</Command.Item>
									<Command.Item
										value="resume cv work experience career"
										onSelect={openResume}
										className={ITEM_CLASS}
									>
										<FileText className={ICON_CLASS} weight="regular" aria-hidden="true" />
										<span>Resume</span>
									</Command.Item>
									{SOCIALS.map((social) => (
										<Command.Item
											key={social.label}
											value={`link ${social.label} ${social.keywords}`}
											onSelect={() => openLink(social.href)}
											className={ITEM_CLASS}
										>
											<social.icon className={ICON_CLASS} weight="regular" aria-hidden="true" />
											<span>{social.label}</span>
											<ArrowSquareOut className="ml-auto size-3.5 shrink-0 text-kumo-link" weight="regular" aria-hidden="true" />
										</Command.Item>
									))}
								</Command.Group>

								<Command.Group heading="Actions">
									<Command.Item
										value="email send write contact"
										onSelect={sendEmail}
										className={ITEM_CLASS}
									>
										<EnvelopeSimple className={ICON_CLASS} weight="regular" aria-hidden="true" />
										<span>Email me</span>
										<span className="ml-auto text-kumo-default opacity-70">{EMAIL}</span>
									</Command.Item>
									<Command.Item
										value="copy email address clipboard"
										onSelect={copyEmail}
										className={ITEM_CLASS}
									>
										<Copy className={ICON_CLASS} weight="regular" aria-hidden="true" />
										<span>{copied ? "Copied to clipboard" : "Copy email address"}</span>
									</Command.Item>
								</Command.Group>
							</Command.List>
						</Command>

						<span role="status" aria-live="polite" className="sr-only">
							{copied ? "Copied to clipboard" : ""}
						</span>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}
