"use client";

import { useCallback, useEffect, useState } from "react";
import { Command } from "cmdk";
import { Dialog, VisuallyHidden } from "radix-ui";
import {
	Hash,
	Mail,
	Copy,
	Search,
	Menu,
	CornerDownLeft,
} from "lucide-react";
import { SECTIONS, SOCIALS, EMAIL, type SectionId } from "@/lib/constants";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";

const ITEM_CLASS =
	// py-3 on mobile keeps each row a ≥44px touch target (the palette is the
	// mobile nav); sm:py-2.5 keeps the compact desktop rows unchanged.
	"group flex items-center gap-3 rounded-md px-3 py-3 sm:py-2.5 text-sm text-foreground/70 cursor-pointer data-[selected=true]:bg-accent data-[selected=true]:text-foreground";

const ICON_CLASS =
	"size-4 text-muted-foreground group-data-[selected=true]:text-brand";

function prefersReducedMotion() {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

export function CommandMenu() {
	const [open, setOpen] = useState(false);
	const [copied, setCopied] = useState(false);
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

	const jumpTo = useCallback((id: SectionId) => {
		setOpen(false);
		const behavior = prefersReducedMotion() ? "auto" : "smooth";
		// The hero is pinned (GSAP ScrollTrigger), so its element spans the whole
		// pin range — scrollIntoView would land at the end of that range, where the
		// exit transition has already played out and the screen reads blank. Scroll
		// to the absolute top instead to land on the hero's start.
		if (id === ("hero" satisfies SectionId)) {
			window.scrollTo({ top: 0, behavior });
			return;
		}
		document.getElementById(id)?.scrollIntoView({ behavior });
	}, []);

	const openLink = useCallback((href: string) => {
		setOpen(false);
		window.open(href, "_blank", "noopener,noreferrer");
	}, []);

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
				className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<span className="font-sans">⌘</span>
				<span>K</span>
			</button>

			{/* Mobile trigger — opens the same menu (also serves as mobile nav) */}
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Open command menu"
				className="sm:hidden inline-flex size-11 items-center justify-center -mr-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
			>
				<Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
			</button>

			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-[var(--z-overlay)] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
					<Dialog.Content
						aria-describedby={undefined}
						className="fixed left-1/2 top-[16%] z-[var(--z-modal)] w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-[var(--shadow-elevated)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
					>
						<VisuallyHidden.Root>
							<Dialog.Title>Command menu</Dialog.Title>
						</VisuallyHidden.Root>

						<Command
							label="Command menu"
							className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-muted-foreground"
						>
							<div className="flex items-center gap-2 border-b border-border px-4">
								<Search className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
								<Command.Input
									autoFocus={!coarsePointer}
									placeholder="Jump to a section, open a link…"
									className="w-full bg-transparent py-3.5 text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground"
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
											onSelect={() => jumpTo(s.id)}
											className={ITEM_CLASS}
										>
											<Hash className={ICON_CLASS} strokeWidth={1.5} />
											<span>{s.label}</span>
											<CornerDownLeft className="ml-auto size-3.5 opacity-0 group-data-[selected=true]:opacity-40" strokeWidth={1.5} />
										</Command.Item>
									))}
								</Command.Group>

								<Command.Group heading="Links">
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
										<span className="ml-auto font-mono text-[10px] text-muted-foreground">{EMAIL}</span>
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
