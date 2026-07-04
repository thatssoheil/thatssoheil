# ADR-0003 — Type system: honest fonts + a thin semantic ramp

**Status:** Accepted (2026-06-29) · supersedes the unused 40-step Geist-clone ramp

## Context

`--font-mono` was aliased to Lexend, so `code`/`pre`/`kbd` and the `-mono` ramps
rendered proportional and `/ds` mislabeled the face — the highest-consensus defect in
the audit (#3). Separately, ~40 composite type ramps shipped with **zero** product
adoption (#2): a Geist clone nobody used.

## Decision

- **Fonts, honestly:** `--font-sans` = **Lexend** (UI + the uppercase eyebrow
  *register*). `--font-mono` = **real Geist Mono** (`code`/`pre`/`kbd` + the `-mono`
  ramps). The cipher wordmark uses `--font-cipher` (Geist Mono) directly. Uppercase
  tracked labels are a *register*, not monospace — they stay Lexend.
- **A thin semantic ramp, not 40 steps:** collapse to ~6–7 named roles
  (`display / heading / body / body-sm / eyebrow / label / code`) that carry the brand
  law (weight-300 headings, negative tracking), migrate the product onto them, and
  delete the unused step ramps. *(Migration lands in Slice 2; this ADR sets the target.)*

## Consequences

The system tells the truth about its fonts. The type vocabulary is small enough that
the product actually uses it, which is the whole point.
