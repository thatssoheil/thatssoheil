# ATS-First Online Resume Design

**Date:** 2026-07-13
**Branch:** `feat/env-enabled-chat`
**Status:** Approved direction; awaiting spec review

## Context

Soheil needs a first-class resume at `thatssoheil.website/resume` that serves two audiences from one source of truth:

1. recruiters and hiring managers reading it online; and
2. applicant tracking systems reading an exported PDF.

The primary objective is to win interviews for Senior Frontend Engineer roles. Visual appeal is important, but it must not compromise parsing, reading order, accessibility, or print reliability. The resume should also communicate product judgment without presenting Soheil as a product designer. Where designs were supplied in Figma, the copy must describe frontend implementation rather than visual-design ownership.

Career evidence was reconciled from multiple resume versions in Google Drive, direct interviews, the current Climic codebase and Git history, the archived MCINEXT `nx-dashboard` and `nx-chatbot` repositories, and public product material. Unverifiable percentages and inherited company marketing metrics are explicitly excluded.

Current ATS guidance informs the format:

- use a text-based PDF with a simple linear reading order;
- use standard section names;
- avoid columns, tables, text boxes, graphics, and contact details in headers or footers;
- keep the PDF well below common upload limits;
- preserve explicit titles, employers, dates, skills, and locations as text.

## Goal

Ship one canonical, responsive resume experience that:

- positions Soheil as a product-minded Senior Frontend Engineer;
- communicates six-plus years of software experience and five-plus years of frontend focus;
- presents evidence-backed work across healthcare AI, conversational AI, B2B platforms, real-time interfaces, design systems, and frontend architecture;
- reads cleanly as a web page;
- exports through the browser into a deterministic two-page A4 PDF;
- remains searchable, selectable, linkable, accessible, and ATS-friendly;
- uses the existing Signal Glass visual language online with restrained design-engineering polish;
- collapses to a conservative black-on-white document in print;
- prevents online and PDF content from drifting apart.

## Non-Goals

This slice will not:

- create a separate independently maintained PDF content source;
- add a PDF-generation service or client-side canvas/image PDF library;
- create a résumé builder or content-management interface;
- tailor the resume automatically to arbitrary job descriptions;
- use skill meters, proficiency charts, portraits, logos, timelines, or infographics;
- introduce scroll hijacking, parallax, entrance choreography, or résumé-specific decorative animation;
- claim product-design ownership for interfaces supplied through Figma;
- add unverified impact metrics, marketing claims, customer-acquisition claims, or code-volume metrics;
- elevate short or unsuccessful work into misleading major achievements.

## Product Decision

Use **one canonical resume with two presentation modes**.

- `/resume` is the public, indexable web version.
- The same semantic DOM becomes the application document under `@media print`.
- An `Export PDF` action calls `window.print()` and relies on the browser's native “Save as PDF” path.
- Web-only site chrome, controls, section navigation, ambient fields, glass, and motion are removed in print.
- Resume content is never duplicated into a hidden alternate print tree.

The PDF is intentionally two pages. A single page would remove the evidence required to support a senior-level position or force type below a comfortable reading size.

## Positioning and Voice

### Primary title

`Senior Frontend Engineer`

“Product-minded” or “product judgment” may appear in prose. “Product Designer” must not appear as a role or implied ownership claim.

### Baseline summary

> Senior Frontend Engineer with 6+ years in software engineering, including 5+ years focused on frontend development. Builds maintainable frontend architecture and product workflows for AI, healthcare, B2B, and real-time applications. Experienced owning frontend delivery in early-stage teams, modernizing inconsistent codebases, developing shared systems, and translating Figma designs into responsive production interfaces.

The final copy may be tightened for fit, but must retain the core positioning and factual boundaries.

### Editorial standard

Each accomplishment should follow this shape where the evidence allows it:

`engineering action + system/problem + practical result`

Bullets should:

- begin with a concrete verb;
- describe ownership precisely;
- name relevant architecture or workflow details naturally;
- prefer practical outcomes over adjectives;
- include a metric only when directly supported;
- use full, ATS-readable terminology alongside acronyms where helpful;
- avoid repeating the same stack in every role.

## Evidence Policy

### Supported quantitative evidence

- Climic: sole Frontend Engineer in an eight-person startup team.
- Climic: four product locales—English, Persian, Arabic, and Turkish.
- Climic: the 50-row patient workflow previously allowed more than 100 request operations and was redesigned around two to three list-level requests.
- MCINEXT: RBAC and shared administration behavior across two dashboard products.
- MCINEXT: work inside a six-application branded chatbot platform.
- Epic Labs / 6Success: approximately ten production WordPress sites delivered and maintained.
- Rechat: Developer of the Month twice.

### Excluded claims

- arbitrary percentage improvements from older resumes;
- Xperix landing-page or testimonial statistics;
- commit counts, line counts, or repository file counts as impact metrics;
- customers acquired by Soheil when the accounts existed before he joined;
- the old “50+ startups” Epic Labs claim;
- solo-developer ownership at Zaman;
- design ownership for handed Figma work;
- broad adoption claims about all staff at Mom Fertility Hospital;
- patient-panel usage at Climic before it is actually handed over;
- integration availability before production rollout is confirmed.

## Content Architecture

The resume uses this exact top-level order:

1. Identity and contact
2. Professional Summary
3. Technical Skills
4. Work Experience
5. Selected Project
6. Education and Recognition
7. Additional Information

Standard headings are deliberate. They should not be renamed to branded alternatives such as “Journey,” “Toolbox,” or “Selected Signals.”

### Identity and contact

Required facts:

- Soheil Fakour
- Senior Frontend Engineer
- Tehran, Iran
- Open to remote roles in Iran and international opportunities, including Europe and GCC
- `+98 910 313 9376`
- `soheil.fakour@gmail.com`
- `thatssoheil.website`
- GitHub
- LinkedIn

Contact details must be visible text in the document body, not only icons, tooltips, an HTML header, or a print footer. X / Twitter is not required in the application document.

### Technical Skills

Use compact text groups rather than meters or large badge clouds. The final vocabulary should remain grounded in demonstrated work.

Suggested groups:

- **Frontend:** React, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS
- **Architecture:** Nx monorepos, design systems, reusable component libraries, server state, REST APIs, WebSockets, role-based access control, internationalization, responsive interfaces
- **Product Engineering:** TanStack Query, React Hook Form, Zod, Redux, Zustand, Recharts, GSAP, accessibility, performance optimization
- **Tooling:** Git, pnpm, Vite, Cypress, Jest, Docker, Cloudflare, Nginx, WordPress

The final list should favor skills relevant to Senior Frontend Engineer postings and avoid claiming expert depth where the experience does not support it.

### Work Experience

Use reverse chronological order. Employer, title, employment type, date range, and location/remote status remain explicit text.

#### Climic — Senior/Frontend title presentation to finalize from employment record

**Resume positioning:** current role; sole Frontend Engineer; healthcare AI; early 2026–present. The exact start month must be confirmed before final copy is locked rather than inferred from Git history.

Allocate four to five bullets covering:

- joining an eight-person clinical AI startup launched by Mom Fertility Hospital as the sole Frontend Engineer;
- auditing and modernizing an early AI-generated frontend with major inconsistencies, duplication, and uncoordinated API behavior;
- establishing TanStack Query services, centralized endpoints/query keys, server pagination, lazy loading, and explicit HTTP/WebSocket reconciliation;
- redesigning the patient list architecture from more than 100 potential row-level requests to two or three list-level requests for a 50-row screen;
- building shared encounter, patient, settings, table, form, date/time, localization, and access-control foundations;
- strengthening recording and live-encounter reliability through cross-tab synchronization, signoff gating, token refresh, ordered autosave, and submit flushing;
- supporting four locales and mixed-direction clinical content;
- creating project specifications, consistency documentation, and agent-ready codebase guidance;
- contributing continuous product judgment through scope curation and small workflow improvements.

Usage wording must stay narrow: clinician-facing functionality is used at Mom Fertility Hospital and by one external physician. It must not imply that all hospital staff or patients use the system.

#### MCINEXT — Frontend Engineer — Dec 2023–Nov 2025

Allocate four to five bullets across the most relevant products:

- **Daani:** joined during the early stage; served as the only Frontend Engineer for the first three months; built the Next.js 13 application from scratch from supplied designs; integrated and adapted an internal Instagram-like media explorer for a gamified children's search product using Zarebin.
- **Anzu administration:** worked on B2B chatbot administration and call-center analysis products; built authentication, Q&A management, user/expert administration, role management, filtering, pagination, and embedded analytics flows.
- **Shared architecture and RBAC:** designed the frontend permission model around backend roles and permissions; gated routes, navigation, tabs, components, and individual actions; consolidated duplicated authentication, user, role, and management behavior into shared Nx libraries used by two dashboards.
- **Conversational platform:** developed shared capabilities inside a six-application Nx chatbot platform, including segmented streaming text-to-speech, continuous browser speech recognition, file/media uploads, WebSocket-driven operator handoff, and feedback workflows.
- **Xperix:** shipped production frontend features for the Oman-market AI support product from supplied Figma designs, including public documentation, responsive navigation, conversation filtering, reporting and topic analytics, publishing/embed setup, secure OTP-based agent reset, and the GSAP-driven landing hero.
- **Nova:** mention only as brief supporting work—Material UI migration and electricity-dashboard interface implementation for a short-lived initiative.

It is acceptable to state that the broader production platforms were used by MCI, Mobinnet, Bank Saderat, and other companies, but the wording must not suggest Soheil acquired those customers.

#### Dideban — Contract Frontend Engineer — Aug–Dec 2023

One concise bullet. Describe the short engagement and verified contribution to pricing, subscriptions, and selected internal-panel features. Do not inflate the two-month active contribution into full product ownership.

#### Zaman — Frontend Engineer — Jul 2022–Oct 2023

Allocate two bullets:

- maintained and evolved existing Engenesis and Being Profile features as part of a client-services team with senior support;
- built the net-new enrollment completion flow that generated a personalized printable ticket for each attendee of an in-person course.

Do not describe this role as solo development or claim the products were built from scratch.

#### Epic Labs / 6Success — Contract Frontend Engineer — Jun 2022–Jun 2023

One or two bullets covering approximately ten self-hosted WordPress client sites, pixel-accurate implementation from supplied responsive designs, custom CSS/JavaScript, maintenance, Cloudflare, server deployment, and Nginx configuration.

#### Rechat — Frontend Engineer — Sep 2021–Jun 2022

One or two bullets covering responsive email, social, print, and deal-document templates implemented from supplied designs, tested across target devices, and published through a repository-to-CMS pipeline. Include Developer of the Month twice under recognition or within the entry, but do not invent the reason.

#### Independent Frontend and WordPress Projects — Apr 2020–Aug 2021

One concise bullet explaining the deliberate frontend transition through HTML, CSS, JavaScript, WordPress, and several paid production projects. Do not label this period as unemployment or an unexplained career break.

#### Lamasoo — Junior Backend Developer — Jan 2019–Mar 2020

One concise bullet describing junior Node.js work with promises, queues, and asynchronous integration behavior for a hotel/travel-agency channel-management system.

### Selected Project

Include one compact project entry for `thatssoheil.website`:

- Next.js, React, TypeScript, Tailwind CSS, GSAP, and Cloudflare;
- a versioned Signal Glass design system with semantic tokens and accessibility constraints;
- a grounded streaming AI chat with server validation, rate limiting, abort/retry behavior, and a repo-local knowledge source.

This project supplies direct evidence of personal interface and product taste. It should not displace professional experience on page one.

### Education and recognition

- B.Eng. in Computer Engineering, Amirkabir University of Technology, Oct 2016–Oct 2021
- Rechat Developer of the Month, two times

### Additional information

- English — Advanced Professional Proficiency
- Do not list Persian or Spanish.
- Do not claim an official IELTS credential. The university-administered 7.5 result is omitted from the base resume.

## Page Allocation

The A4 PDF should be engineered around these boundaries:

### Page 1

- identity and contact;
- professional summary;
- technical skills;
- Climic;
- MCINEXT.

### Page 2

- Dideban;
- Zaman;
- Epic Labs / 6Success;
- Rechat;
- Independent Frontend and WordPress Projects;
- Lamasoo;
- selected project;
- education, recognition, English, and availability.

Role articles should avoid splitting across pages where feasible. Headings must not be orphaned at the bottom of a page. Exact spacing and bullet counts may be tightened during print verification without removing the core evidence.

## Web Experience

### Route and shell

- Add a first-class `/resume` route inside the existing App Router site.
- Preserve the global site header and footer online.
- Use the existing ambient field and Signal Glass vocabulary as the page environment.
- Center the resume on a near-solid reading surface approximately 880–920px wide on desktop.
- Adapt to a comfortable edge-to-edge document on narrow screens without horizontal scrolling.
- Keep one visual and semantic column at all breakpoints.

### Document styling

- Use the existing Lexend and Geist Mono system online.
- Establish hierarchy through typography, whitespace, rules, and restrained weight changes.
- Avoid giving every bullet or skill its own card.
- Keep employer, title, date, location, and contract status visibly labeled.
- Use normal link affordances and selectable text.
- Reuse existing semantic color and surface tokens; do not introduce arbitrary colors.
- Maintain the design system's near-solid reading material and WCAG-compliant de-emphasis tiers.

### Controls

Provide a compact web-only action area outside the document:

- `Export PDF` invokes `window.print()` directly;
- email is a normal `mailto:` link;
- telephone is a normal `tel:` link;
- section anchors may assist long-page navigation if they remain quiet and keyboard accessible.

The export interaction does not use a custom modal, fake progress sequence, or client-generated PDF canvas. Supporting text may briefly clarify that the native dialog's “Save as PDF” option creates the application file.

### Motion

The resume is scanning-heavy static content, so motion is functional only:

- no entrance animation for the document or sections;
- no scroll hijacking, parallax, typewriter effects, or animated skill indicators;
- short hover/focus transitions for links and controls;
- subtle active scale near `0.98` on pressable controls;
- instant or simplified behavior under `prefers-reduced-motion`;
- preserve existing reduced-transparency and contrast support.

## Print and PDF Experience

Use dedicated `@media print` rules and `@page` configuration.

Required print behavior:

- A4 portrait output;
- deterministic margins and page breaks;
- conservative system font stack;
- black text on white;
- no site header, footer, ambient background, glass, shadows, controls, icons, or decorative animation;
- no content in the print header or footer generated by the page itself;
- real hyperlinks retained in the PDF;
- searchable and selectable text;
- no hidden alternate resume tree;
- target file size below 1 MB;
- exactly two pages in the reference Chromium export;
- no clipped bullets, orphan headings, accidental blank pages, or split contact details.

Browser-added print headers and footers cannot be controlled reliably by page CSS. Verification instructions should note that they must be disabled in the native print dialog when saving the application PDF.

## Architecture

### Data model

Create a typed source such as `src/data/resume.ts` containing:

- identity and availability;
- contact links;
- summary;
- skill groups;
- experience entries and evidence-backed bullets;
- selected project;
- education;
- recognition;
- language information.

The module should model dates, external links, employment type, optional project groupings, and print-safe labels explicitly. Components render the data; factual copy does not live scattered through JSX.

Site-wide facts should be reconciled where the current site conflicts with the approved resume. In particular, `src/data/now.ts` currently describes being on the ground in Oman, while the approved location is Tehran with openness to Iran, Europe, and GCC opportunities. The implementation plan should update or centralize these facts rather than leaving contradictory public claims.

### Rendering boundary

- Keep the route predominantly server-rendered.
- Isolate `window.print()` inside a small client control.
- Use one semantic `main` landmark.
- Use one `h1` for the name and standard `h2` headings for resume sections.
- Represent each role with an `article`.
- Use machine-readable `time` elements for dates where practical.
- Use a document-body `address` for contact information.
- Use real unordered lists for accomplishments.
- Use anchors for every contact and external profile.

### Components

Prefer a small, resume-specific component boundary rather than a general resume framework. Expected responsibilities may include:

- resume page shell;
- identity/contact block;
- section heading;
- skill group list;
- experience article and optional project labels;
- selected-project entry;
- education/recognition block;
- web-only export controls.

Existing UI primitives may be reused when they preserve semantics and print cleanly. Do not force card, badge, or icon-button primitives into document content where plain HTML is clearer.

## Metadata and Discovery

Add route-specific metadata:

- title: `Soheil Fakour — Senior Frontend Engineer`;
- a concise description grounded in the approved summary;
- canonical URL: `https://thatssoheil.website/resume`;
- Open Graph and Twitter metadata using existing site assets unless a resume-specific card is clearly justified;
- update the sitemap to include `/resume`.

Add structured data appropriate to a public professional profile:

- `ProfilePage` for the resume route;
- `Person` for Soheil;
- explicit job title, URL, email, location, and profile links where appropriate;
- avoid unsupported employer or credential claims.

## Accessibility

- Preserve a logical heading outline and DOM order.
- Keep all contact information visible as text.
- Ensure all web-only controls have clear labels and visible focus.
- Maintain keyboard navigation for section links and export.
- Use at least 44px touch targets for standalone interactive controls on mobile.
- Do not encode meaning through color alone.
- Maintain sufficient contrast for body text and de-emphasized metadata.
- Respect reduced motion, reduced transparency, and contrast preferences already supported by the site.
- Keep external-link indicators decorative or properly labeled; do not make icons the only link name.

## Verification

### Automated repository checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Use the exact available scripts discovered during implementation planning; do not invent missing commands.

### Web behavior

- `/resume` renders without client JavaScript for all factual content.
- Export opens the native print dialog.
- Email, telephone, website, GitHub, and LinkedIn links resolve correctly.
- Desktop, tablet, and mobile widths remain single-column and free of overflow.
- Global navigation works online and disappears in print.
- Keyboard focus is visible and follows reading order.
- Reduced-motion and reduced-transparency modes remain usable.

### PDF and ATS behavior

- Export a reference A4 PDF from Chromium.
- Confirm exactly two pages with `pdfinfo` or an equivalent PDF inspector.
- Confirm the file remains below 1 MB.
- Run `pdftotext` and inspect the extracted order.
- Verify name, title, contact details, headings, employers, dates, role titles, education, and technical keywords appear as plain extracted text.
- Confirm there is no duplicated hidden content, unexpected navigation text, decorative glyph noise, or scrambled column order.
- Confirm hyperlinks remain interactive.
- Copy and paste representative sections from the PDF into plain text and compare the reading order.
- Inspect both pages visually for clipping, orphan headings, split bullets, blank space imbalance, and browser-added headers/footers.

### Content audit

- Reconcile every date against the source resumes and interview record.
- Confirm the exact Climic start month before final copy is locked.
- Confirm all employer and product spellings.
- Confirm every quantitative claim against repository or user-provided evidence.
- Search final copy for excluded claims and unsupported percentages.
- Ensure Xperix language says implementation from Figma, not design ownership.
- Ensure Zaman does not say solo developer.
- Ensure Mom Fertility usage is scoped to clinicians and one external physician.

## Acceptance Criteria

The design is complete when:

- `/resume` is a polished, accessible, responsive route consistent with Signal Glass;
- the content positions Soheil clearly for Senior Frontend Engineer roles;
- web and PDF modes use one content source and one semantic DOM;
- the reference PDF is exactly two A4 pages, text-based, below 1 MB, and parses in the correct order;
- all career claims are evidence-backed and prohibited metrics are absent;
- supplied Figma work is described as implementation rather than product-design ownership;
- the page exposes standard résumé headings and explicit contact, employer, title, date, education, and skill text;
- verification passes for repository quality checks, accessibility, responsive behavior, print layout, hyperlinks, and extracted PDF text.
