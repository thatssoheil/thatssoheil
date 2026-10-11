# Deliberately omitted

What this design system intentionally does not have, so a future reader or audit does
not mistake a scoped decision for a gap. This is a solo, single-consumer personal site;
the system is sized to that, not to a multi-team product.

| Omitted | Why | Revisit when |
|---|---|---|
| **RTL / i18n readiness** | The site is English-only by design; no second locale is in scope. | A second locale is actually planned. |
| **A full optional status-color set** | Kumo provides semantic status roles, but the site should use status colors only for real states; no shipped surface currently needs a broad palette. | A real surface needs a status that Kumo's existing roles support. |
| **DTCG / JSON token export + Figma Code Connect** | One author and one consumer, with no Figma source, do not justify a round-trip pipeline. | A second consumer or a Figma source appears. |
| **Dedicated `/ds` showcase route** | The root page is the stable consumer and reference under ADR-0006; a parallel catalog risks drift. | A second route, client, or contributor needs a browsable catalog. |
| **Release versioning / changelog** | This is a site-local design system with one consumer; source-backed token governance and checks matter more than package releases. | The system is published or reused elsewhere. |
| **Automated visual-regression matrix** | Maintaining a broad test matrix is not justified for one site; lint and token checks cover inexpensive invariants. This omission does not waive task-specific screenshot or two-mode acceptance evidence. | The system stabilizes, repeated visual regressions justify a harness, or a second consumer appears. |

See [`CONTEXT.md`](../CONTEXT.md) and the ADRs in [`docs/adr/`](./adr/).
