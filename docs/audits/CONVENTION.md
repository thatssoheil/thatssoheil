# Audits — convention

This folder is the durable record of rigorous, periodic audits of the website. An
audit is a structured, evidence-based health-check that produces a ranked, actionable
report — not a vibe check. Every audit is committed here so the site's quality is
tracked over time and never lost to a chat session.

## When to run one

- **Before a release** of any large feature (a redesign, a new section, a new
  integration).
- **After** landing such a feature, to catch what shipping introduced.
- **Quarterly**, as a standing cadence, even with no big change in flight.

## How to run one (the council method)

Audits use a multi-agent **council**: a fan-out of specialists, a reconciliation
round, and a single synthesized report. The canonical run is the
`signal-glass-council-audit` workflow shape:

1. **Specialists (fan-out).** ~20–30 agents, each pinned to ONE profession and a
   single, non-redundant mandate (e.g. WCAG auditor, performance engineer, brand
   strategist, security engineer). Each reads the **actual code**, cites `file:line`,
   ranks findings by severity, names genuine strengths, and scores its domain /10.
2. **Council (reconcile + debate).** ~5 domain chairs each receive their specialists'
   findings plus the cross-domain headlines, then state consensus, resolve real
   conflicts/trade-offs, surface cross-cutting themes, and prioritize.
3. **Editor synthesis.** One agent writes the final report.

Keep specialists in their lane and evidence-based; the value is in `file:line`
citations and honest severity, not generic advice. Scale the roster to the surface
area, but never pad it with redundant lenses.

## What a report must contain

`Executive summary` (verdict + overall grade + the single most important next step) ·
`Scorecard` (per-domain /10) · `What's genuinely excellent` · `Top priorities`
(one ranked, de-duplicated list across all domains — each with **severity**
Blocker/High/Medium/Low, the issue with `file:line`, the concrete fix, and rough
**effort** S/M/L) · `Debates` (trade-offs and how they resolved) · `By domain` ·
`Roadmap` (Now / Next / Later).

## Naming & metadata

- One file per audit: `docs/audits/YYYY-MM-DD-<topic>-audit.md` (kebab-case topic).
- Start each file with a YAML front-matter block: `date`, `topic`, `branch`,
  `method`, `overall` score, per-domain `scores`, and a `remediation:` pointer to the
  spec that acts on it.

## Follow-through (the point of all this)

An audit that isn't acted on is decoration. Every audit **spawns a remediation spec**
(`docs/superpowers/specs/YYYY-MM-DD-<topic>-remediation-design.md`) that turns the
`Now` bucket into an implementation plan. Later audits should open by noting which of
the prior audit's priorities were resolved — the folder is a ledger, not a graveyard.

## Index

- [2026-06-29 — Signal Glass website](./2026-06-29-signal-glass-council-audit.md) —
  overall **6.5/10**; craft is high, gated by a hollow content system (facts trapped
  in README) and a cluster of unfinished hardening (contrast, the chat takeover).
