# ADR-0006 - Root page as the design-system reference

**Status:** Accepted (2026-07-06)

## Context

The site has one primary consumer: the homepage. A separate `/ds` showcase would create
a parallel gallery that can drift from the real product and duplicate polish work.

## Decision

There is no `/ds` route. The root page is the living reference for the Cloudflare-based
design system.

- `src/app/globals.css` is the canonical token and global-style source.
- `src/components/ui/*` owns reusable interface primitives.
- The actual sections on `/` demonstrate the system in use. New design-system work
  should land in those primitives or real root-page surfaces.
- Historical audits and specifications may mention `/ds`; they are records, not
  current routing or governance.

## Consequences

There is no separate gallery to maintain or exempt from product lint gates. Design
conventions are verified through the homepage, lint rules, token coverage, and the
production build.
