# Signal Glass audit remediation design

**Date:** 2026-10-11  
**Status:** Draft for owner review; no repository changes made  
**Source audit:** `/root/hermes-dump/thatssoheil-review/audit-2026-10-11/2026-10-11-signal-glass-audit.md`  
**Target repository context:** `moon-watch` is `origin/dev` plus `b3cb2c4`; production is `origin/main` at `2d19047`.

## Goal and guardrails

Turn the audit's Now bucket into bounded, verifiable work. Keep the security fast-lane separate from design-system changes. Work on a feature branch from `dev`, validate locally, merge to `dev` for preview review, and make no production merge without the owner's explicit approval. This document is a plan only.

Preserve settled identity copy. Do not restore the retired chat or its API. Do not add glass enrichment, a `/ds` gallery, a full status-color set, DTCG/Figma export, light-mode parity polish, or a visual-regression matrix. These are deliberate omissions (`docs/deliberately-omitted.md:7-16`). Keep the solid-by-default material and the no-visible-dark-rim rule (`docs/adr/0002-glass-material.md:14-25`).

## Security fast-lane

Run these workstreams before the next production release. The audit found 44 production dependency advisories, including 4 critical and 24 high, but did not prove that every advisory's exploit preconditions apply to the OpenNext Worker. Treat the audit output as urgent triage, not as 44 confirmed exploitable paths (pass-2-engineering-platform.md, finding 1).

### S1. Triage and disposition production dependency advisories

**Scope:** Map each production advisory to the resolved package, reachable feature or route, and applicable runtime preconditions. Apply only fixes compatible with Next.js 16 and the current OpenNext adapter. If no safe fix exists, document the concrete reason and revisit trigger for that package.

**Touched files:** `package.json`; `pnpm-lock.yaml`. Update any source or configuration only if an evidenced compatibility fix requires it.

**Acceptance criteria:**

- Each critical and high advisory has a recorded disposition: fixed, not applicable with evidence, or deferred with an owner-visible reason and revisit condition.
- `pnpm audit --prod` is rerun; remaining advisories and their disposition are reported honestly.
- No dependency is blindly upgraded across an adapter boundary.
- The existing validation and OpenNext Worker build complete after the chosen changes.

**Verification:** Run `pnpm audit --prod`, `pnpm run test`, `pnpm exec opennextjs-cloudflare build`, and a preview runtime smoke check. Compare resolved versions and audit output before/after; do not infer success from a lockfile diff alone.

**Effort:** M.

**Out of scope:** Replacing the framework or adapter, blanket overrides without compatibility evidence, treating all advisories as exploitable, or claiming zero risk solely because the command exits successfully.

### S2. Ship baseline HTTP security headers on the actual Worker response

**Scope:** Choose a response-header mechanism that OpenNext on Workers actually serves. `public/_headers` exists but did not produce the observed live policy. Add the baseline CSP, HSTS, frame restriction, Referrer-Policy, and nosniff policy while preserving current route and preview behavior.

**Touched files:** `src/middleware.ts`, `next.config.ts`, `src/app/layout.tsx`, and `public/_headers` only if it remains part of the verified serving path. The exact implementation location must be proven against the deployed Worker.

**Acceptance criteria:**

- Live production and preview responses include the intended policy headers on `/` and representative app routes.
- The CSP permits the existing synchronous theme bootstrap using a tested hash or nonce strategy; it does not silently break theme selection or page resources.
- Preview `X-Robots-Tag: noindex, nofollow` remains present, including the separate static-asset fix in S3.
- The final policy does not claim more coverage than the routes tested.

**Verification:** Inspect response headers with `curl -sS -D - -o /dev/null` on the dev preview after deploy; exercise the theme bootstrap and check browser console/policy violations. Verify production only after owner-approved release. Read back `/`, `/resume`, and a generated image response.

**Effort:** M.

**Out of scope:** A broad CSP report-ingestion service, unrelated edge rules, or accepting `_headers` configuration as proof without live response evidence.

## Now workstreams: accessibility and crawl correctness

### W1. Restore forced-colors keyboard focus and remove duplicate announcements

**Scope:** Make focus visible on shared controls under forced-colors mode. Correct the H1's repeated accessible name and the command menu's initial copy-status announcement without changing the visible hero name or settled identity wording.

**Touched files:** `src/app/globals.css`, `src/components/ui/button.tsx`, `src/components/theme-toggle.tsx`, `src/components/header.tsx`, `src/components/command-menu.tsx`, `src/components/sections/hero.tsx`, and `src/components/resume/resume.module.css` only where its local forced-colors rule must remain consistent.

**Acceptance criteria:**

- Every shared shell control with `:focus-visible` retains a clear system-color outline in forced-colors mode, even when normal-mode box shadows are suppressed.
- The H1 exposes "Soheil Fakour" once to assistive technology while responsive visual spans remain correct.
- The copy status live region is empty before an action and announces only the result.
- Ordinary theme focus styling, skip link, command-menu trigger, and resume toolbar remain intact.

**Verification:** Use Chromium forced-colors emulation and keyboard traversal of header links, theme toggle, command-menu trigger, and buttons. Inspect the accessibility tree for a single H1 name; open the menu and verify copy status before and after copying. Run `pnpm run test`.

**Effort:** S.

**Out of scope:** Claiming full WCAG conformance from one browser check, rebuilding the retired chat, or adding a `prefers-contrast` palette without a tested need.

### W2. Correct preview static-asset noindex, Person JSON-LD, and sitemap freshness

**Scope:** Close the observed static `/llms.txt` preview-header exception, make the resume and root Person graph agree, and replace the frozen sitemap dates with factual content-modified dates.

**Touched files:** `src/middleware.ts`; `public/llms.txt`; `src/components/json-ld.tsx`; `src/components/resume/resume-json-ld.tsx`; `src/lib/constants.ts` only if needed to reference the established role; `src/app/sitemap.ts`; and the existing home/resume content source only if a maintained content date belongs there.

**Acceptance criteria:**

- Preview `/llms.txt` returns `X-Robots-Tag: noindex, nofollow`, verified on the live preview host. Existing preview noindex behavior remains intact.
- Resume JSON-LD uses one consistent Person identity and no competing `jobTitle` values for the same `@id`. The visible resume heading can remain recruiter-oriented if that preserves owner-approved wording.
- Home and resume sitemap `lastmod` values reflect material content edits, not deployment time; current XML no longer reports the stale July 13 date.
- Production JSON-LD remains valid JSON and production crawl routes remain unchanged apart from the corrected data.

**Verification:** Fetch preview `/llms.txt` and inspect headers. Parse every JSON-LD block on production `/resume`, compare Person IDs and job titles, and inspect production `/sitemap.xml` dates after deploy. Keep Search Console validation as a separate owner-access task.

**Effort:** S.

**Out of scope:** Rewriting all `llms.txt` content, changing the public role copy, fixing unrelated dev README Playground links, or treating schema syntax as proof of Search/Google validation.

## Now workstream: design identity decision gate

### W3. Decide the field, grid, and cipher contract before implementation

**Scope:** Record the owner's choice for the dormant SignalField/StructureGrid layer and the absent cipher reveal. The current static hero and retired chat are real decisions; neither should be reversed by implication. The old refraction moment was scoped to the chat in ADR-0002, so restoring an ambient field does not authorize site-wide refraction.

**Touched files:** Decision-dependent. Likely `CONTEXT.md`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/signal-field/signal-field.tsx`, `src/components/signal-field/structure-grid.tsx`, `src/app/globals.css`, and related filter/hook files if their contract changes. Amend an ADR only if the owner changes the accepted material decision.

**Acceptance criteria:**

- One explicit branch is selected: restore the field/grid as a visible part of the current system, or retire/rewrite the dormant identity contract.
- Source, `CONTEXT.md`, and any affected ADRs describe the same runtime choice.
- The hero remains literal and accessible; chat and `/api/chat` remain retired.
- If the field is restored, it stays decorative, honors reduced motion and reduced transparency, and receives mobile/light/dark review before production. Its infinite blurred animation cost is measured or clearly recorded as unverified.
- Refraction remains scoped to an owner-approved moment; it is not made a site-wide effect.

**Verification:** Review the root DOM and desktop/mobile light/dark preview against the chosen direction. Check reduced-motion and reduced-transparency behavior. If restored, collect a representative mobile performance trace before calling the field budget acceptable. If retired, search for remaining imports and stale field/reveal claims.

**Effort:** M, including the owner decision. Do not start the implementation branch until that decision is recorded.

**Out of scope:** Reintroducing the hero chat, animating the settled hero name without owner approval, brightening reading surfaces to compensate for a missing field, or adding grain, tint, elevation tiers, or chromatic aberration.

## Next bucket seeds from the Cloudflare shortlist

These are follow-on design-system opportunities, not prerequisites for the Now acceptance criteria. The Cloudflare review inspected Kumo and public surfaces; it did not verify private dashboard parity (`cloudflare-ds-review.md:18-24`).

1. **Semantic surface ladder:** define a small canvas/base/elevated/recessed vocabulary by mapping it onto existing Signal Glass semantic tokens. Do not create a second primitive tier or change the solid-first material.
2. **Hairline and concentric geometry:** apply precise nested-radius math where a real surface needs it. Preserve the Signal Glass dark-glass exception: no visible dark rim. Avoid a general border-plus-shadow stack.
3. **Explicit interaction states:** cover only states used by shipped controls. Align focus, hover, active, and disabled behavior; keep hover color feedback immediate while preserving motion for meaningful spatial changes.
4. **Typography and primitive keep-or-kill:** follow ADR-0003's thin role set and real Geist Mono decision. Count dev-only Playground uses separately; decide Card and Separator by current consumers, with Surface remaining the material seam.

**Next-bucket verification:** use source call-site review, `pnpm run test`, and focused browser checks for the changed controls/surfaces. Do not add a visual-regression matrix, full status-color palette, token export pipeline, or dedicated `/ds` page.

## Release and review exit criteria

- Each Now workstream has a separate, reviewable change with its own acceptance evidence.
- `pnpm run test` passes; run the OpenNext build before any Wrangler dry-run when deploy configuration changes.
- Deploy to the canonical dev preview and verify the actual served response or UI behavior, not only a green build.
- Keep production on `main` untouched until the owner reviews the preview and explicitly approves the merge.
- Report unresolved advisories, unmeasured performance, and external indexing checks as open rather than implying completion.
