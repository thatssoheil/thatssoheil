---
date: 2026-10-11
topic: Signal Glass website
branch: moon-watch (HEAD b3cb2c4; origin/dev 4556d26; production origin/main 2d19047)
method: "four-pass subagent council (design/craft, engineering/platform, a11y/perf, content/SEO-AIO) + editor reconciliation"
overall: "7.1/10 - strong product and craft foundations are held back by urgent dependency risk, a confirmed forced-colors focus failure, and last-mile platform and crawl defects."
scores:
  design_craft: "7.3/10"
  design_system_craft: "6.5/10"
  engineering: "8.0/10"
  platform_risk: "4.5/10"
  accessibility: "7.1/10"
  performance: "7.7/10"
  content_growth: "7.5/10"
  seo_aio: "8.0/10"
remediation: docs/superpowers/specs/2026-10-11-audit-remediation-design.md
---

## Prior-audit ledger: resolved, open, and regressed against June and July

The four pass ledgers agree that several June items are now resolved or superseded, while a smaller set remains open or has regressed. This synthesis treats the current production tree (`origin/main` at `2d19047`) separately from the dev-based audit clone (`moon-watch`, one commit beyond `origin/dev` at `4556d26`). Playground references are dev-only unless stated otherwise.

### Resolved or superseded

- **June content proof trapped in README: resolved in part.** Current facts live in `src/data/now.ts:14-40` and the recruiting resume in `src/data/resume.ts:79-113,184-200`. The homepage still does not show this proof; see priority 8.
- **June low-contrast copy and arbitrary text opacity: resolved for current product text.** Per-theme `--text-muted` and `--text-faint` roles replaced the old opacity classes. Pass 3 calculated 7.42:1, 5.26:1, 10.47:1, and 7.00:1 against the theme backgrounds. Exact contrast over every possible translucent backdrop remains unverified (`src/app/globals.css:227-230,332-335`; pass-3-a11y-performance.md, "Accessibility ledger").
- **June scrambled H1 and July share-card/crawl foundations: resolved as originally filed.** The name is literal text, generated OG and Twitter image routes work, and robots, sitemap, metadata, JSON-LD, and `llms.txt` exist. The H1 now has duplicate accessible/extracted text, and the crawl artifacts have the fresh defects below (`src/components/sections/hero.tsx:50-60`; `src/app/opengraph-image.tsx:1-8`; `src/app/robots.ts:1-10`; pass-4-content-seo-aio.md, "Prior-audit ledger").
- **June glass sheen inversion, missing glass API, and system governance: resolved.** Light sheen is white-derived; `Surface` is adopted; lint and token checks enforce the tier law. The current field/grid mismatch is a separate regression (`src/app/globals.css:249-251,349-350`; `src/components/ui/surface.tsx:10-38`; `eslint.config.mjs:79-110`).
- **June `/ds` reference and chat takeover: superseded by decisions.** ADR-0006 makes the root page the design reference. The hero chat was retired in August and is absent from production and dev. Do not re-file its historical modal, streaming, privacy, retry, or API issues as live defects (`docs/adr/0006-root-page-as-design-system-reference.md:7-28`; `src/data/manifesto.ts:45-52`; pass-2-engineering-platform.md, "Opening ledger").
- **June lint, branded error boundary, contrast semantics, and July social image coverage: resolved.** `pnpm run test` passed in the recorded engineering/content passes, but this is a static gate chain, not unit coverage (`src/app/error.tsx:8-30`; `package.json:9-18`; pass-2-engineering-platform.md, "Validation results").

### Open

- **Security headers and automated unit coverage remain open from June.** Live production responses lack CSP, HSTS, frame restrictions, Referrer-Policy, and nosniff; the current test script contains no unit runner or test files (pass-2-engineering-platform.md, "OPEN" and findings 2-3).
- **The accepted font contract remains open.** ADR-0003 and `CONTEXT.md` specify real Geist Mono, while the app maps `--font-mono` to a system stack and loads only Lexend for the site (`src/app/globals.css:8-11`; `src/app/layout.tsx:2,9-16`; `docs/adr/0003-type-system.md:14-21`).
- **The documented living field and grid are absent from the product.** The June audit asked for a focused field; the current layout and root page do not mount either component, and the chat-dependent refraction moment has no current consumer (`CONTEXT.md:8-13`; `src/app/layout.tsx:127-132`; pass-1-design-craft.md, finding 1).
- **The homepage still lacks a work-proof section.** Data and resume evidence exist, but `src/app/page.tsx:7-24` renders Hero, Manifesto, and Connect only (pass-4-content-seo-aio.md, finding 1).

### Regressed or newly confirmed

- **Sitemap freshness regressed after the July SEO audit.** Home and resume still report the fixed `2026-07-13` date despite material content changes on October 4 (`src/app/sitemap.ts:5-15`; pass-4-content-seo-aio.md, "Prior-audit ledger").
- **Preview static-file noindex is incomplete.** Preview HTML and crawl routes receive noindex, but the public `/llms.txt` static asset does not (`public/llms.txt`; `src/middleware.ts:4-15,44-48`; pass-4-content-seo-aio.md, finding 2).
- **The resume emits conflicting job titles for one Person ID.** The root and resume JSON-LD both use `/#person`, with different `jobTitle` values (`src/components/json-ld.tsx:34-42`; `src/components/resume/resume-json-ld.tsx:20-29`).
- **Keyboard focus disappears in forced-colors mode.** This is a confirmed current accessibility failure, not merely the June design-system consistency concern (pass-3-a11y-performance.md, finding A1).

## Executive summary

This is a coherent, carefully built site with strong server/client boundaries, a disciplined visual voice, a credible resume, and a real token system. The consolidated grade is **7.1/10**, the equal-weight mean of the eight domain scores below (7.075 rounded to one decimal). The score is pulled down by platform risk and one confirmed keyboard accessibility failure, not by broad architectural weakness.

The single most important next step is to resolve the production security fast-lane before the next production release: triage the 44 production dependency advisories and ship a tested HTTP security policy through a mechanism that is actually served by this Worker. Do not interpret the count as 44 confirmed exploitable paths; applicability remains unverified. The separate design-system decision about the dormant field is important, but it must not delay security and accessibility fixes.

## Scorecard

| Domain | Score | Consolidated judgment |
| --- | ---: | --- |
| Design and craft | 7.3/10 | Quiet, recognizable composition and strong resume treatment; the living-system story and shipped entry surface diverge. |
| Design-system craft | 6.5/10 | Semantic tiers and Surface are real; typography adoption, mono truth, dormant contracts, and unused primitives remain unresolved. |
| Engineering | 8.0/10 | Strong server/client boundaries and passing static gates; no unit-level safety net for active behavior. |
| Platform risk | 4.5/10 | Deployment plumbing is coherent, but advisories and absent live security headers block a green risk posture. |
| Accessibility | 7.1/10 | Strong landmarks, text contrast, and touch sizing; forced-colors focus loss is confirmed. |
| Performance | 7.7/10 | Lean architecture and no active field animation; mobile glass budget and client payload lack representative profiling. |
| Content and growth | 7.5/10 | Resume evidence and voice are strong; the homepage leaves work proof in the resume/data layer. |
| SEO and AIO | 8.0/10 | Metadata, images, and crawl routes work; preview noindex, entity consistency, and freshness need correction. |
| **Overall** | **7.1/10** | **Strong foundation, with a concentrated high-risk platform and accessibility tail.** |

The score is the unweighted mean of the eight pass domain scores. Individual pass scores are preserved in front matter; the overall is editor-calculated, not a score issued by one pass.

## What's genuinely excellent

- **The site has an authored, restrained visual identity.** Lexend, warm-paper light mode, near-black dark mode, one signal accent, a large responsive name, and editorial manifesto panels read as one system without forcing the resume into a generic card grid (`src/components/sections/hero.tsx:35-70`; pass-1-design-craft.md, "Genuinely strong work").
- **Surface is a useful adopted primitive.** Seven production call sites use it, while product source has no raw glass-class bypasses. The solid-first material and reduced-transparency gate make failure safer rather than less legible (`src/components/ui/surface.tsx:10-71`; `src/app/globals.css:475-508`; ds-inventory-2026-10-11.md, sections 2-3).
- **Core runtime architecture is sound.** The root route remains a server component, client behavior sits at leaves, hooks use SSR-safe snapshots, and the command menu uses Radix Dialog (`src/app/page.tsx:1-26`; `src/components/command-menu.tsx:117-129`; pass-2-engineering-platform.md, "Genuine strengths").
- **The common shell has accessible structure.** Skip link, landmarks, heading order, 44px mobile controls, semantic text tiers, and reduced-motion handling are present. The focus exception below is specific and reproducible, not evidence that the baseline is broadly careless (`src/components/skip-to-content.tsx:7-15`; `src/app/globals.css:685-705`; pass-3-a11y-performance.md, "What's genuinely excellent").
- **The resume is a useful recruiting artifact.** It has concrete experience, measurable work, semantic sections, a print stylesheet, export guidance, and a contract check (`src/components/resume/resume-document.tsx:11-87`; `scripts/check-resume.mjs:28-46,61-102`; pass-4-content-seo-aio.md, "What is genuinely strong").
- **The SEO foundation is implemented, not aspirational.** Production canonical metadata, working 1200 by 630 share images, robots, sitemap, and JSON-LD are present. Search Console and Rich Results validation remain external/unverified (`src/app/opengraph-image.tsx:1-8`; `src/app/sitemap.ts:1-43`; pass-4-content-seo-aio.md, "SEO, crawl hygiene and AIO extraction").
- **The hero chat cut is documented curation.** It keeps the current page focused and removes the former streaming, cost, and modality surface from current production scope (`src/data/manifesto.ts:45-52`; pass-1-design-craft.md, prior-audit ledger).

## Top priorities

One ranked, de-duplicated list across the audit. Severity reflects current evidence, not theoretical worst case. Effort is S, M, or L.

1. **High - disposition the production dependency advisories.** The prod tree reports 44 advisories, including 4 critical and 24 high; exploit preconditions on OpenNext Workers are not established. Cite: `package.json:22-31`, `pnpm-lock.yaml:32-43`; pass-2-engineering-platform.md, finding 1. **Fix:** map advisories to affected direct/transitive packages and runtime paths, apply compatible updates or record evidence-based deferrals, then rerun audit and Worker build/runtime smoke. **Effort: M.**
2. **High - restore visible keyboard focus in forced-colors mode.** Shared controls remove outlines and rely on shadows; forced-colors emulation confirmed both outline and box shadow absent on ThemeToggle. Cite: `src/components/ui/button.tsx:7-8`, `src/components/theme-toggle.tsx:10-14`, `src/app/globals.css:697-705`; pass-3-a11y-performance.md, finding A1. **Fix:** apply a global `:focus-visible` system-color outline after component resets, or remove outline suppression where no replacement exists. **Effort: S.**
3. **Medium - add and verify baseline HTTP security headers at the live Worker response layer.** The live root lacks CSP, HSTS, frame restrictions, Referrer-Policy, and nosniff; `public/_headers` alone is not effective on this deployment. Cite: `public/_headers:1-8`, `next.config.ts:5-25`, `src/middleware.ts:33-49`; pass-2-engineering-platform.md, finding 2. **Fix:** use an OpenNext/Workers-served response mechanism, account for the inline theme bootstrap in CSP, and verify production and preview responses. **Effort: M.**
4. **Medium - apply preview noindex to static `/llms.txt`.** This is the observed exception to otherwise restrictive preview headers. Cite: `public/llms.txt`, `src/middleware.ts:4-15,44-48`; pass-4-content-seo-aio.md, finding 2. **Fix:** set the preview header at the asset-serving layer or serve the file through a path covered by middleware; read back the deployed preview response. **Effort: S.**
5. **Medium - merge resume and root Person data without competing `jobTitle` values.** Both JSON-LD blocks use the same `@id` but say `Frontend Engineer and Product Curator` and `Frontend Engineer`. Cite: `src/components/json-ld.tsx:34-42`, `src/components/resume/resume-json-ld.tsx:20-29`; pass-4-content-seo-aio.md, finding 3. **Fix:** choose the canonical machine-readable role or omit the resume `jobTitle`; keep any recruiter-facing resume heading distinct only where appropriate. **Effort: S.**
6. **Medium - decide whether the field/grid/cipher identity contract is still the product direction.** `CONTEXT.md` promises a living field, but layout and live root mount neither field nor grid; the old refraction consumer was tied to the retired chat. Cite: `CONTEXT.md:8-13`, `src/app/layout.tsx:127-132`, `src/app/globals.css:543-572`; pass-1-design-craft.md, finding 1; ds-inventory-2026-10-11.md, section 6 rank 1. **Fix:** obtain an owner choice to restore the ambient field/grid with reduced-motion and mobile checks, or retire/rewrite the dormant contract. Do not restore chat or make refraction site-wide. **Effort: M.**
7. **Low - make sitemap `lastmod` reflect material content changes.** Both entries remain fixed at July 13 despite October content changes. Cite: `src/app/sitemap.ts:5-15`; pass-4-content-seo-aio.md, finding 4. **Fix:** maintain a factual content-modified date and verify sitemap XML; do not use deploy date as a proxy. **Effort: S.**
8. **Medium - surface factual work proof on the home page or retire unused `NOW` claims.** The home composes Hero, Manifesto, and Connect; the data/resume contains specific proof but no home section consumes it. Cite: `src/app/page.tsx:7-24`, `src/data/now.ts:14-40`, `src/data/resume.ts:99-183`; pass-4-content-seo-aio.md, finding 1. **Fix:** owner-select a compact factual proof block from a shared source, or remove unused fields and correct stale consumer comments. Keep chat retired. **Effort: M.**
9. **Medium - add focused tests for active behavior, not just static checks.** `pnpm test` covers lint, typecheck, token, scroll, and resume checks but no unit-test runner/files. Cite: `package.json:9-18`, `.github/workflows/ci.yml:20-33`; pass-2-engineering-platform.md, finding 3. **Fix:** add narrowly scoped tests when touching active interaction or response behavior; do not restore chat-only tests. **Effort: M.**
10. **Low - make the H1 and copy status announcement single-source.** The accessible H1 name repeats, and the copy status region initially contains the email value. Cite: `src/components/sections/hero.tsx:51-60`, `src/components/command-menu.tsx:197-206`; pass-3-a11y-performance.md, findings A2-A3; pass-4-content-seo-aio.md, prior-audit ledger. **Fix:** expose one canonical H1 name while hiding only duplicate responsive visual spans; make the live status node initially empty. **Effort: S.**
11. **Low - align the accepted typography contract with shipped use.** Production uses none of the 30 composite recipes, although 263 uses are in the dev-only Playground; `--font-mono` is system mono instead of the accepted Geist Mono. Cite: `src/app/globals.css:8-11,416-458`, `src/app/layout.tsx:2,9-16`, `docs/adr/0003-type-system.md:14-21`; ds-inventory-2026-10-11.md, sections 1-3. **Fix:** adopt a thin production role set and real mono, then retain only recipes with a named current consumer, including dev-only needs considered separately. **Effort: M.**
12. **Low - right-size unconsumed primitives and stale interaction claims.** `Card` and `Separator` have zero call sites; `Card glass` is a parallel glass entry beside adopted `Surface`. Stale reveal/motto metadata does not drive runtime behavior. Cite: `src/components/ui/card.tsx:5-99`, `src/components/ui/separator.tsx:8-28`, `src/components/ui/surface.tsx:7-20`; `src/components/sections/section-panel.tsx:83,101`; ds-inventory-2026-10-11.md, sections 2-3. **Fix:** remove or retain each only by a concrete consumer; remove `Card glass` if Surface remains the single material seam; correct inert comments/markers. **Effort: S.**
13. **Low - profile before changing client payload, blur, or OG rendering.** The command menu is eagerly imported, mobile glass has no device-tier budget, and OG generation fetches four remote fonts with a cold uncached response; no CWV or mobile trace was collected. Cite: `src/components/header.tsx:9-12,88-91`, `src/app/globals.css:486-517`, `src/app/opengraph-image.tsx:15-22,80-85`; pass-3-a11y-performance.md, findings P1-P3. **Fix:** collect a representative production/mobile trace first; optimize only an observed cost. **Effort: M.**

## Debates

- **Restore or retire the field, grid, and cipher identity layer.** The identity contract and earlier audit treat a living field as central, but the current page is visibly static and the chat/refraction moment was deliberately cut. Resolution: this is an owner choice, not permission to restore chat or add decorative motion by default. Restore field/grid only with reduced-motion and mobile budget checks; otherwise amend `CONTEXT.md` and dormant contracts. Keep field and refraction as separate decisions because ADR-0002 scopes refraction to a contained moment.
- **Quiet redesign versus documented system.** The static hero, absence of section reveal, and removed chat are consistent with the recent quieter curation; the stale `data-reveal` and motto comments are not evidence that motion should return. Resolution: preserve stillness unless the owner asks for a staged moment, but make code and docs accurately describe it. The living-field promise remains the unresolved mismatch.
- **Security urgency versus solo-site reality.** 44 production advisories include critical/high severities and live security headers are absent, so defer neither disposition nor header work. But the passes did not prove every advisory remotely exploitable, and this is a single site: use a bounded fast-lane, validate adapter compatibility, avoid blind dependency churn, and do not add a broad security program unsupported by evidence.
- **Keep or kill the zero-production-adoption typography recipes.** The inventory counts zero production use, not zero repository use: 263 references are on dev-only Playground routes. ADR-0003 already prefers six or seven semantic roles over a 40-step ramp. Resolution: do not migrate the full ramp into product or delete recipes without accounting for dev-only consumers; implement the thin production roles and prune only unused recipes after a keep-or-kill census.
- **Keep or kill Card and Separator.** Both have zero source consumers, while Surface has seven production consumers and Card exposes a competing glass switch. Resolution: keep no primitive for hypothetical reuse. Remove unused APIs unless an actual current surface justifies them; preserve Surface as the material seam. Separator is not automatically needed because the manifesto currently authors its own fading rule.
- **What Cloudflare's direction changes and does not change.** The Cloudflare review recommends transferable system discipline, not wholesale styling. Seed the Next bucket with a semantic surface ladder mapped onto existing tokens, hairline/concentric geometry with Signal Glass's dark-rim exception, and explicit interaction states with immediate hover color. It does not change the black/neutral and signal-blue identity, replace Lexend/Geist Mono, add orange or flare motifs, justify a dashboard shell, or override the solid-by-default/no-enrichment ADR. The inspected evidence is Kumo and public pages; private dashboard parity is unverified (`cloudflare-ds-review.md:18-24,113-132`).
- **Technical security mechanisms versus shipped Worker behavior.** `public/_headers` exists, but the live response has no security policy. Resolution: count only headers verified on live production/preview responses; configuration presence is not acceptance.

## By domain

### Design and design-system craft

The site has a recognizable composition and Surface adoption. The main design-system debts are the absent field/grid contract, a shipped system-mono fallback against an accepted Geist Mono decision, zero production use of the composite ramps, and orphaned primitives. No new glass enrichment is warranted; `docs/adr/0002-glass-material.md:14-25` and `docs/deliberately-omitted.md:14-16` explicitly constrain it. Theme time-scheduling remains implemented; whether that behavior is still desired is unverified (`src/app/layout.tsx:116-124`; pass-1-design-craft.md, "Trade-offs and scope decisions").

### Engineering and platform

Engineering boundaries and deploy plumbing are strong; the recorded test command passed and resolved all 67 token references. It is not a unit-test suite. The urgent gaps are dependency advisory disposition and HTTP response policy; minor cleanup includes retired chat bindings, the public CI marker, merged branch refs, and unused GSAP declarations. Treat these cleanups as lower priority and inspect ownership before deleting branches or secrets (`wrangler.jsonc:75-87`; `public/ci-cd-test.txt:1-6`; pass-2-engineering-platform.md, findings 4-7).

### Accessibility and performance

Semantic structure, common target sizes, reduced motion, and calculated theme text contrast are strengths. Forced-colors focus loss is a confirmed failure. The duplicate H1 name and initial copy status value are small fixes; dialog focus-return, skip-link transfer, mobile soft-keyboard behavior, and assistive-technology coverage were not fully tested. Performance findings are measured one-run payload observations, not Core Web Vitals: no LCP, CLS, INP, TBT, device trace, or user metric was collected (`pass-3-a11y-performance.md`, "Performance measurements and limitations").

### Content, SEO, and AIO

The resume, README mirror, metadata, generated social images, robots, and crawl routes are real. Fix preview `/llms.txt` noindex, conflicting Person `jobTitle`, and stale sitemap dates. Next, consider a factual work-proof block on home, add `/resume` to production `llms.txt`, correct the obsolete `/ds` note and dev-only Playground links, and review owner-approved resume targeting. Search Console, Rich Results validation, and external social-card debugging remain unverified (`pass-4-content-seo-aio.md`, findings 2-7 and "SEO, crawl hygiene and AIO extraction").

## Roadmap

### Now

1. Run the security fast-lane: disposition the production advisory tree and deliver a tested HTTP security policy on actual Worker responses.
2. Restore a visible forced-colors focus indicator on the shared shell controls.
3. Fix preview static `/llms.txt` noindex, unify Person JSON-LD role data, and make sitemap freshness factual.
4. Remove duplicate H1 accessible/extracted text and initialize copy-status announcements empty.
5. Obtain the owner decision on field/grid identity before restoring or deleting the dormant layer.

### Next

1. Resolve homepage proof: render a compact factual work section or retire unused `NOW` fields and stale consumer claims.
2. Complete the type contract with thin production roles and real Geist Mono; count dev-only recipe consumers separately.
3. Keep-or-kill the unused Card/Separator APIs and align remaining primitives with Surface.
4. Seed small, evidence-based system improvements from the Cloudflare shortlist: map semantic surface roles onto existing tokens; use hairline/concentric geometry while preserving the no-visible-dark-rim rule; define states only for shipped interactions and keep hover color feedback immediate.
5. Add `/resume` to production `llms.txt`, correct stale `/ds` and dev-only collateral links, and verify external search/share surfaces when owner access is available.

### Later

1. Profile the mobile glass and command-menu bundle before any optimization; cache or pre-generate OG only if the cold route remains a meaningful cost.
2. Add focused automated tests for active stateful behavior as it is changed; keep broad visual regression work deferred.
3. Reconcile inert reveal/motto metadata and stale chat bindings after confirming the intended field and feature-retirement decisions.
4. Keep omitted items omitted: no RTL/i18n, status-color palette, DTCG/Figma export, `/ds` showcase, release versioning, light-mode parity polish, glass enrichment, or visual-regression matrix (`docs/deliberately-omitted.md:7-16`).

## Index entry (for CONVENTION.md)

```text
- [2026-10-11 - Signal Glass website](./2026-10-11-signal-glass-audit.md) - overall **7.1/10**; strong craft and engineering with concentrated platform security, forced-colors, and crawl-hygiene work remaining.
```