# ADR-0005 — The signal field uses a named second hue

**Status:** Accepted (2026-06-29)

## Context

The living `SignalField` blends three blobs. Two derive from the accent
(`--signal-500`, `--signal-700/400`); the middle blob was a **raw teal `oklch` literal**
(`oklch(… 210)`) hardcoded per theme — a stray value that broke the "swap six signal
values to retheme" contract (audit #6).

## Decision

The teal is a **deliberate companion hue**, not an accident. It is named
**`--field-accent`** (per theme) and `--field-blob-b` references it. The field is the
one place a second hue is sanctioned — it gives the glass something with chroma variety
to refract. The accent ramp stays mono-hue everywhere else.

## Consequences

The field's palette is explicit and tunable in one place; the retheme contract holds
(signal swap + one named field-accent). If the brand accent ever changes, `--field-accent`
is the single knob for the field's companion tone.
