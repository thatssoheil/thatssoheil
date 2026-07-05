# ADR-0006 — Root page as the design-system reference

**Status:** Accepted (2026-07-06)

## Context

Signal Glass used to have a dedicated `/ds` route that mirrored tokens, type, glass,
and component examples. That page was useful while the system was still being built,
but the site has now stabilized around a single consumer: the homepage. Keeping a
parallel gallery creates drift pressure and makes polish decisions happen twice.

## Decision

Remove the `/ds` route. The root page is now the living reference for Signal Glass.

- `src/app/globals.css` remains the token and material source of truth.
- `src/components/ui/*` owns reusable primitives such as `Surface`, `Button`, `Input`,
  and `IconButton`.
- Product sections on `/` are the proof of the system. New design-system work should
  land in those primitives or in the root page's actual surfaces.
- Historical audits and specs may still mention `/ds`; they are records, not current
  routing or governance.

## Consequences

There is no separate gallery to maintain or exempt from product lint gates. Design
system conventions must be verifiable through the homepage, lint rules, token coverage,
and production build rather than a hand-maintained showcase.
