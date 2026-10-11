# ADR-0007 - Cloudflare-based design system

**Status:** Accepted (2026-10-11)

## Context

The owner directed that the site's visuals become a faithful Cloudflare-system build.
The governing sources are two related layers: Kumo for product and interface design, and
the Cloudflare brand guide for brand and story surfaces. A single flat palette or token
namespace would erase the distinct jobs of product actions and brand expression.

## Decision

Adopt Kumo as the product layer and the Cloudflare brand guide as the brand layer. Apply
each by surface, with Kumo semantic roles governing interface behavior and brand-guide
constants governing brand accents and typography. Do not use Cloudflare's logo or flare.

The site token names follow Kumo's source namespaces. Pin these Kumo color roles:

- `--color-kumo-canvas`
- `--color-kumo-base`
- `--color-kumo-elevated`
- `--color-kumo-recessed`
- `--color-kumo-control`
- `--color-kumo-brand`
- `--color-kumo-brand-hover`
- `--color-kumo-line`
- `--color-kumo-hairline`
- `--color-kumo-focus`

Pin these text roles separately:

- `--text-color-kumo-default`
- `--text-color-kumo-link`
- `--text-color-kumo-brand`

Keep the namespace distinction explicit: color `kumo-brand` is the blue product action
color; text `kumo-brand` is orange brand text. Never alias one to the other. The brand
palette uses Tangerine `#F6821F`, Ruby `#FF6633`, and Mango `#FBAD41`; secondary brand
colors are reserved for diagrams or illustration. Exact Kumo values come from the
published Kumo theme-generator configuration and colors reference at implementation
time. Each token must trace to a Kumo source name or an official brand constant. Other
Kumo roles are available only when their source and use are verified; never silently
invent a role or claim private dashboard fidelity.

The tier law in ADR-0001 remains: source values feed semantic roles, which feed Tailwind
utilities; components never skip a tier. Raw values stay in the canonical token source.

ADRs 0002, 0003, and 0005 are superseded where they conflict with this decision. ADR-0001
is re-mapped to Kumo's source namespaces, ADR-0004 is re-checked for source-backed text
roles, and ADR-0006 continues to make the root page the design-system reference.

## Consequences

Product actions, brand expression, and neutral surfaces retain distinct semantic jobs.
Token changes remain traceable to published sources, and future work has one governing
system instead of two competing visual vocabularies.
