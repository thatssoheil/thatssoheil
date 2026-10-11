# ADR-0001 - Token tier-precedence law

**Status:** Accepted (2026-06-29); re-mapped by ADR-0007 (2026-10-11)

## Context

The design system needs an explicit rule for how source values, semantic roles, and
component-facing utilities compose. Without it, components can bypass semantic roles
and depend directly on values, making a source-system change expensive and inconsistent.

## Decision

**Components consume semantic roles; semantic roles consume source values. Never skip a tier.**

- **Tier 1 - source values:** Kumo theme values and the official Cloudflare brand
  constants, held in the canonical token source. Raw values are not used in components.
- **Tier 2 - semantic roles:** source-mapped Kumo roles, including the `--color-kumo-*`
  and `--text-color-kumo-*` namespaces. This is the design vocabulary; use names only
  when the mapping is supported by the published source.
- **Tier 3 - Tailwind:** component-facing utilities exposed from the semantic roles in
  `@theme inline`. Product code uses this layer or named semantic component APIs.

The law is enforced by lint and token-coverage checks. Raw color literals and direct
source values are forbidden in product components. The only hex literals permitted by
the rebuild contract are the official brand constants in the canonical token source.

## Consequences

The site can change its source values without rewriting components. Kumo roles and
brand constants remain traceable to their sources, and the lint gate makes tier
boundaries verifiable.
