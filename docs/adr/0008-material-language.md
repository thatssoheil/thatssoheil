# ADR-0008 - Material language

**Status:** Accepted (2026-10-11)

## Context

The rebuild follows Kumo's product surface conventions instead of the site's former
translucent material language. Surface hierarchy must remain legible in both themes and
should not depend on blur or decorative effects.

## Decision

Use layered, opaque semantic surfaces. Distinguish surface levels with the Kumo canvas,
base, elevated, recessed, and control roles. Use hairlines for flat surface separation
and reserve the Kumo line and its matching shadow treatment for the appropriate
raised surface or control.

Control shadows are restrained and source-backed. A card must never have both a border
and a drop shadow. Keep nested edges mathematically concentric. Do not use translucency,
backdrop blur, refraction, grain, chromatic aberration, or decorative glass effects.

This decision supersedes ADR-0002's material direction.

## Consequences

Surface hierarchy comes from semantic layers and precise edges rather than special
rendering effects. The material remains predictable, themeable, and legible without a
translucency fallback.
