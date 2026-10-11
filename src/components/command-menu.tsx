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
	FileText,
	Flask,
} from "@phosphor-icons/react/ssr";
import { SECTIONS, SOCIALS, EMAIL } from "@/lib/constants";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { jumpToSection } from "@/lib/section-navigation";
import { cn } from "@/lib/utils";
import { surfaceRole, textRole, typeRole, Button } from "@/components/ui";
const ITEM_CLASS =
	// py-3 on mobile keeps each row a ≥44px touch target (the palette is the
	// mobile nav); sm:py-2.5 keeps the compact desktop rows unchanged.
	[
		"group flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2.5 text-sm cursor-pointer data-[selected=true]:bg-kumo-fill-hover data-[selected=true]:text-kumo-default",
		textRole.muted,
	].join(" ");

const ICON_CLASS =
	"size-4 text-kumo-default opacity-70 group-data-[selected=true]:text-kumo-link";

export function CommandMenu() {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
	const pathname = usePathname();
	const router = useRouter();
	// On touch devices the menu doubles as mobile nav, so the palette input must
	// not autofocus — that would pop the on-screen keyboard over the section list
	// the moment the menu opens.
	const coarsePointer = useCoarsePointer();

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setOpen((o) => !o);
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
		void navigator.clipboard?.writeText(EMAIL);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}, []);

	return (
		<>
			{/* Desktop trigger — ⌘K hint chip */}
			<Button variant="ghost" size="default"
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open command menu"
				className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-lg border border-kumo-hairline px-2.5 text-sm text-kumo-default opacity-70 hover:text-kumo-default hover:border-kumo-line hover:bg-kumo-fill-hover focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumo-focus"
			>
				<span className="font-sans" aria-hidden="true">⌘</span>
				<span aria-hidden="true">K</span>
			</Button>

			{/* Mobile trigger — opens the same menu (also serves as mobile nav) */}
			<Button variant="ghost" size="default"
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open command menu"
				className="sm:hidden inline-flex size-11 items-center justify-center -mr-2 rounded-lg text-kumo-default opacity-70 hover:bg-kumo-fill-hover hover:text-kumo-default focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kumo-focus"
			>
				<List className="size-5" aria-hidden="true" />
			</Button>

			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-kumo-overlay" />
					<Dialog.Content
						aria-describedby={undefined}
						className={cn(
							surfaceRole.commandMenuPanel,
							"fixed left-1/2 top-[16%] z-[var(--z-modal)] w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden text-kumo-default outline-none",
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
								<MagnifyingGlass className="size-4 text-kumo-default opacity-70 shrink-0" />
								<Command.Input
									autoFocus={!coarsePointer}
									placeholder="Jump to a section, open a link…"
									className="w-full bg-transparent py-3.5 text-sm font-sans text-kumo-default outline-none placeholder:text-kumo-default placeholder:opacity-50"
								/>
							</div>

							<Command.List className="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
								<Command.Empty className="py-8 text-center text-sm text-kumo-default opacity-70">
									Nothing here.
								</Command.Empty>

								<Command.Group heading="Sections">
									{SECTIONS.map((s) => (
										<Command.Item
											key={s.id}
											value={`section ${s.label}`}
											onSelect={() => goToSection(s.id)}
											className={ITEM_CLASS}
										>
											<Hash className={ICON_CLASS} weight="regular" />
											<span>{s.label}</span>
											<ArrowElbowDownLeft className="ml-auto size-3.5 opacity-0 group-data-[selected=true]:opacity-40" weight="regular" aria-hidden="true" />
										</Command.Item>
									))}
								</Command.Group>

								<Command.Group heading="Links">
									<Command.Item
										value="playground experiments tracker macro notes data"
										onSelect={openPlayground}
										className={ITEM_CLASS}
									>
										<Flask className={ICON_CLASS} weight="regular" />
										<span>Playground</span>
									</Command.Item>
									<Command.Item
										value="resume cv work experience career"
										onSelect={openResume}
										className={ITEM_CLASS}
									>
										<FileText className={ICON_CLASS} weight="regular" />
										<span>Resume</span>
									</Command.Item>
									{SOCIALS.map((l) => (
										<Command.Item
											key={l.label}
											value={`link ${l.label} ${l.keywords}`}
											onSelect={() => openLink(l.href)}
											className={ITEM_CLASS}
										>
											<l.icon className={ICON_CLASS} weight="regular" />
											<span>{l.label}</span>
										</Command.Item>
									))}
								</Command.Group>

								<Command.Group heading="Actions">
									<Command.Item
										value="email send write contact"
										onSelect={sendEmail}
										className={ITEM_CLASS}
									>
										<EnvelopeSimple className={ICON_CLASS} weight="regular" />
										<span>Email me</span>
										<span className="ml-auto text-kumo-default opacity-70">{EMAIL}</span>
									</Command.Item>
									<Command.Item
										value="copy email address clipboard"
										onSelect={copyEmail}
										className={ITEM_CLASS}
									>
										<Copy className={ICON_CLASS} weight="regular" />
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
