# Deliberately omitted

What this design system **intentionally does not have** — so a future reader (or audit)
doesn't mistake a scoping decision for a gap. This is a solo, single-consumer personal
site; the system is sized to that, not to a multi-team product.

| Omitted | Why | Revisit when |
|---|---|---|
| **RTL / i18n readiness** | Site is English-only by design. | A second locale is actually planned. |
| **A full status-color set** (success/warning/info) | Only `--destructive` is needed today; the product has no such states. | A surface needs them. |
| **DTCG / JSON token export + Figma Code Connect** | N=1 author, N=1 consumer, no Figma source — a round-trip pipeline is pure ceremony. | A second consumer or a Figma source appears. |
| **Release versioning / changelog** | One consumer; the real governance gap was the lint gate, not release management. | The system is published/reused elsewhere. |
| **Light-mode parity polish** | Dark is the default; light is kept *correct* (AA + working glass) but not pampered. | Light becomes a primary mode. |
| **Glass enrichment** (elevation tiers, grain, tint, chromatic aberration) | The audit + spec research say build the API + perf budget first; enrichment is a legibility/perf risk. | A concrete surface earns it (own ADR). |
| **Visual-regression test matrix** | Deferred to Slice 3 — real harness cost for a small site; the lint gate + token-coverage test cover the cheap wins now. | The system stabilizes / churn warrants it. |

See [`CONTEXT.md`](../CONTEXT.md) and the ADRs in [`docs/adr/`](./adr/).
