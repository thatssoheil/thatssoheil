# ADR-0010 - Theming

**Status:** Accepted (2026-10-11)

## Context

The site needs first-class light and dark modes and should use Kumo's semantic mode
contract. A time-of-day schedule is not an appropriate source of a visitor's preference.

## Decision

Set `data-mode="light"` or `data-mode="dark"` on the root element. System preference
chooses the initial mode; a manual toggle overrides it. This system-first resolution is
site policy, not a Kumo requirement.

Do not use Tailwind `dark:` variants in components. Components consume the same semantic
roles in both modes; the tokens respond to `data-mode`. Retire the time-scheduled theme.

## Consequences

Both modes are first-class and share one semantic component implementation. The system
preference gives a predictable default, while the manual toggle gives the visitor
control without duplicating dark-specific component styles.
