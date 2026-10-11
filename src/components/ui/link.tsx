import NextLink from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/ssr";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const linkVariants = cva(
	"inline-flex items-baseline gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-focus",
	{
		variants: {
			variant: {
				inline: "text-kumo-link underline underline-offset-4 hover:text-kumo-brand-hover",
				plain: "text-kumo-default no-underline hover:text-kumo-link",
			},
		},
		defaultVariants: {
			variant: "inline",
		},
	},
);

type LinkProps = ComponentProps<typeof NextLink> &
	VariantProps<typeof linkVariants> & {
		showExternalIcon?: boolean;
	};

function isExternalHref(href: LinkProps["href"]) {
	return typeof href === "string" && /^(?:https?:)?\/\//i.test(href);
}

function Link({
	className,
	variant = "inline",
	showExternalIcon,
	target,
	rel,
	href,
	children,
	...props
}: LinkProps) {
	const external = isExternalHref(href);
	const showIcon = showExternalIcon ?? (external || target === "_blank");
	const safeRel =
		target === "_blank"
			? [
					...(rel?.split(/\s+/) ?? []).filter(
						(value) => value && !["noopener", "noreferrer"].includes(value.toLowerCase()),
					),
					"noopener",
					"noreferrer",
				].join(" ")
			: rel;

	return (
		<NextLink
			data-slot="link"
			href={href}
			target={target}
			rel={safeRel}
			className={cn(linkVariants({ variant }), className)}
			{...props}
		>
			{children}
			{showIcon ? <ArrowSquareOut size={14} aria-hidden="true" /> : null}
		</NextLink>
	);
}

export { Link, linkVariants };
