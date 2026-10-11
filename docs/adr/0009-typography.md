# ADR-0009 - Typography

**Status:** Accepted (2026-10-11)

## Context

The Cloudflare brand guide assigns typographic roles with specific tracking and leading,
while Kumo's product rules prohibit tracking overrides and set a minimum content size.
These rules apply to different surfaces and should not be blended into one type policy.

## Decision

Use Inter for proportional text and JetBrains Mono for code and monospace content.

On brand and story surfaces, implement the brand-guide roles and metrics:

| Role | Treatment | Tracking | Leading |
|---|---|---:|---:|
| Eyebrow | Uppercase semibold | +5% | 100% |
| Body | Regular | -2% | 120% |
| Headline | Semibold | -3% | 100% |
| Subheadline | Medium | -3% | 110% |
| URL | Medium | -3% | 100% |

On product and interface surfaces, follow Kumo's no-tracking rule. Keep interface
content, buttons, data, and other interactables at 14px or larger; use 16px or larger
for headings and subheadings. Use sentence case, semibold headings, and medium inline
emphasis as specified by Kumo.

## Consequences

Brand surfaces can use the prescribed tracking without leaking it into product UI.
Inter is the shared proportional face, JetBrains Mono is the code face, and interface
text remains within Kumo's content-size floor.
