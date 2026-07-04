# Section Liquid Glass Design

**Date:** 2026-07-04
**Branch:** `chore/ds-systematize`
**Status:** Approved design

## Problem

The hero now feels more atmospheric and less like a bordered panel, but Manifesto and Connect still read as large rectangular cards over the field. They are readable, but not yet fully compatible with the liquid-glass visual language.

## Direction

Use **Dissolved Reading Glass**: keep the prose and actions easy to read, while making each section feel like a glass artifact suspended in the same field as the hero. The sections should look structured, but not boxed.

## Decisions

- Keep Manifesto as one readable glass field, not separate cards per paragraph.
- Reduce edge dominance on section surfaces; no new hard outlines.
- Add liquid depth inside the surface using soft radial wash, faint refraction lines, and layered alpha highlights.
- Give Manifesto a quiet left rail behind the metadata column so the grid feels intentional without becoming a sidebar card.
- Treat Manifesto paragraph rows as suspended reading bands with subtle separators, not bordered items.
- Make Connect feel like a closing instrument panel: copy on the left, action dock on the right.
- Make the email CTA the primary luminous control and social links smaller glass tiles.
- Widen the hero glass plane so the atmospheric glass covers more of the wordmark area without reintroducing a hard rectangular border.
- Preserve current content, section order, accessibility, and responsive readability.

## Non-Goals

- No shard layout or multiple floating paragraph cards.
- No decorative blobs, orbs, or unrelated visual motifs.
- No new copy.
- No changes to chat feature flags or API behavior.
- No full design-system rewrite.

## Component Shape

### Manifesto

The section keeps its two-column reading structure on desktop and stacks on mobile. The outer surface becomes softer and more atmospheric. A subtle rail or glow layer sits behind the left label/subheading column. Paragraph rows receive quiet horizontal refraction lines or alpha separators to create rhythm without making each paragraph a card.

### Connect

The section keeps a compact two-zone structure. The left zone carries the label, heading, and short copy. The right zone becomes an action dock: one primary email control plus social tiles. The dock may have a slightly stronger inner glow than Manifesto because it is interactive.

### Hero Continuity

The hero plane remains borderless and radial, but its width should increase so the liquid-glass atmosphere covers more of the wordmark and surrounding title cluster. The change must preserve the recent fix: no harsh top edge, no obvious rectangular card, and the visible name must settle to `Soheil Fakour`.

## Visual QA

- Dark hero: wider glass atmosphere covers more of the wordmark without becoming a bordered box.
- Dark Manifesto: surface feels suspended and liquid, not like a plain card.
- Light Manifesto: prose remains comfortable and the rail does not become a visible decorative strip.
- Dark Connect: email/social actions read as a cohesive glass control group.
- Mobile: sections stack cleanly; no text or controls overflow; no nested-card feeling.
- Both themes: section readability remains stronger than the hero plane because these sections carry prose.
