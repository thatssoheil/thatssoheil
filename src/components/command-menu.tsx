"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, VisuallyHidden } from "radix-ui";
import {
	Hash,
	Mail,
	Copy,
	Search,
	Menu,
	CornerDownLeft,
	FileText,
} from "lucide-react";
import { SECTIONS, SOCIALS, EMAIL } from "@/lib/constants";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { jumpToSection } from "@/lib/section-navigation";
import { cn } from "@/lib/utils";
import { surfaceRole } from "@/components/ui/surface";
import { textRole, typeRole } from "@/components/ui/typography";

const ITEM_CLASS =
	// py-3 on mobile keeps each row a ≥44px touch target (the palette is the
	// mobile nav); sm:py-2.5 keeps the compact desktop rows unchanged.
	[
		"group flex items-center gap-3 rounded-xl px-3 py-3 sm:py-2.5 text-sm cursor-pointer data-[selected=true]:bg-alpha-100 data-[selected=true]:text-foreground",
		textRole.muted,
	].join(" ");

const ICON_CLASS =
	"size-4 text-muted-foreground group-data-[selected=true]:text-brand";

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
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open command menu"
				className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-xl border border-alpha-300 px-2.5 text-xs text-text-faint hover:text-foreground hover:border-alpha-500 hover:bg-alpha-100 focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
			>
				<span className="font-sans">⌘</span>
				<span>K</span>
			</button>

			{/* Mobile trigger — opens the same menu (also serves as mobile nav) */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open command menu"
				className="sm:hidden inline-flex size-11 items-center justify-center -mr-2 rounded-xl text-text-faint hover:bg-alpha-100 hover:text-foreground focus-visible:outline-none focus-visible:shadow-[var(--ring-focus)]"
			>
				<Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
			</button>

			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/70 backdrop-blur-sm" />
					<Dialog.Content
						aria-describedby={undefined}
						className={cn(
							surfaceRole.commandMenuPanel,
							"fixed left-1/2 top-[16%] z-[var(--z-modal)] w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden text-popover-foreground outline-none",
						)}
					>
						<VisuallyHidden.Root>
							<Dialog.Title>Command menu</Dialog.Title>
						</VisuallyHidden.Root>

						<Command
							label="Command menu"
							className={cn(
								"[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-muted-foreground",
								typeRole.commandGroupHeading,
							)}
						>
							<div className="flex items-center gap-2 border-b border-border px-4">
								<Search className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
								<Command.Input
									autoFocus={!coarsePointer}
									placeholder="Jump to a section, open a link…"
									className="w-full bg-transparent py-3.5 text-sm font-sans text-foreground outline-none placeholder:text-muted-foreground"
								/>
							</div>

							<Command.List className="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
								<Command.Empty className="py-8 text-center text-sm text-muted-foreground">
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
											<Hash className={ICON_CLASS} strokeWidth={1.5} />
											<span>{s.label}</span>
											<CornerDownLeft className="ml-auto size-3.5 opacity-0 group-data-[selected=true]:opacity-40" strokeWidth={1.5} />
										</Command.Item>
									))}
								</Command.Group>

								<Command.Group heading="Links">
									<Command.Item
										value="resume cv work experience career"
										onSelect={openResume}
										className={ITEM_CLASS}
									>
										<FileText className={ICON_CLASS} strokeWidth={1.5} />
										<span>Resume</span>
									</Command.Item>
									{SOCIALS.map((l) => (
										<Command.Item
											key={l.label}
											value={`link ${l.label} ${l.keywords}`}
											onSelect={() => openLink(l.href)}
											className={ITEM_CLASS}
										>
											<l.icon className={ICON_CLASS} strokeWidth={1.5} />
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
										<Mail className={ICON_CLASS} strokeWidth={1.5} />
										<span>Email me</span>
										<span className={`ml-auto text-muted-foreground ${typeRole.commandMeta}`}>{EMAIL}</span>
									</Command.Item>
									<Command.Item
										value="copy email address clipboard"
										onSelect={copyEmail}
										className={ITEM_CLASS}
									>
										<Copy className={ICON_CLASS} strokeWidth={1.5} />
										<span>{copied ? "Copied to clipboard" : "Copy email address"}</span>
									</Command.Item>
								</Command.Group>
							</Command.List>
						</Command>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</>
	);
}
