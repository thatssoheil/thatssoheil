# Resume verification — 2026-07-13

## Repository checks

- `pnpm lint`: exit `0`. ESLint emitted the existing `jsx-ast-utils` diagnostic about an unresolved `TSSatisfiesExpression`; it reported no lint failure.
- `pnpm typecheck`: exit `0`.
- `pnpm test`: exit `0`. Token coverage resolved all 74 referenced tokens, mobile scroll stability passed, and the résumé contract reported its required facts present and excluded claims absent.
- `pnpm build`: exit `0`. Next.js 16.2.9 compiled successfully, generated 9 of 9 static pages, and reported `/resume` as prerendered static content.
- `pnpm start`: the fresh production server reached `Ready in 167ms` at `http://localhost:3000`; all browser and PDF evidence below was regenerated from that production process after the final review fixes.

## Responsive checks

- Desktop screenshot viewport: `1440 x 1800` pixels. The captured PNG reports `1440 x 1800` pixels.
- Mobile screenshot viewport: `390 x 844` pixels. The captured PNG reports `390 x 844` pixels.
- Both captures were visually inspected at their native resolution. The résumé remains one content column with readable metadata, no horizontal clipping, no reordered content, and no overlapping fixed chrome.

## PDF checks

Chromium's reference export completed with exit `0` and no browser header or footer. `pdfinfo` reported these exact lines:

```text
Pages:           2
Page size:       594.96 x 841.92 pts (A4)
```

`stat -c '%s bytes'` reported `111018 bytes`, which is below the `1048576`-byte limit.

`pdftotext -layout` completed with exit `0`. The extracted reading order begins with `Soheil Fakour`, `Senior Frontend Engineer`, `Tehran, Iran`, and visible telephone, email, website, GitHub, and LinkedIn text. It follows the approved section order, places Dideban immediately after the page-one form feed, and contains no site navigation, footer, export control, duplicated content, or decorative glyph noise.

The required-term search exited `0` with these exact matches:

```text
1:Soheil Fakour
2:Senior Frontend Engineer
8:Senior Frontend Engineer with 6+ years in software engineering, including 5+ years focused on frontend development. Builds maintainable
14:Frontend: React, Next.js, TypeScript, JavaScript, HTML, CSS, Tailwind CSS
15:Architecture: Nx monorepos, Design systems, Component libraries, REST APIs, WebSockets, Role-based access control,
17:Product Engineering: TanStack Query, React Hook Form, Zod, Redux, Zustand, Recharts, GSAP, Accessibility, Performance optimization
21:Frontend Engineer                                                                                                                  Feb 2026 — Present
22:Climic                                                                                                                                    Tehran, Iran
27:   Audited and modernized an early AI-generated React codebase, replacing inconsistent components and uncoordinated API calls with
37:MCINEXT                                                                                                                                    Tehran, Iran
47:   Shipped production Xperix features for the Oman market from supplied Figma designs—documentation, responsive navigation,
51:Dideban · Contract                                                                                                                Tehran, Iran
90:Next.js · React · TypeScript · Tailwind CSS · GSAP · Cloudflare
98:Amirkabir University of Technology
```

The forbidden-term search for `25%|50\+ startups|official IELTS|solo developer|Product Designer|hospital staff|patients use` produced empty stdout and exited `1`, the expected ripgrep status for no matches.

Both PDF pages were rasterized from the exported PDF at `1190 x 1684` pixels and visually inspected at native resolution. No bullet or heading is clipped, no role heading is orphaned, no experience article is split, the typography is readable, and the two pages have comparably balanced content density. Page one contains the identity through MCINEXT; page two begins with Dideban and contains the remaining approved sections. Both pages are black on white without glass, background field, navigation, footer, export control, or browser-added header/footer. Contact and project links remain understandable as visible text, and `pdfinfo -url` reports six retained link annotations.

The first reviewed export exposed the scheduled dark `color-scheme` as a `#121212` page-margin perimeter even though the content area was white. The corrected print contract now paints `@page` white and forces the print root to `color-scheme: only light`; `scripts/check-resume.mjs` asserts both rules. Independent pixel sampling of the regenerated PDF renders reported the following for each page:

```text
page 1: corners=[(255, 255, 255), (255, 255, 255), (255, 255, 255), (255, 255, 255)]; white perimeter=5744/5744; white pixels in each 40x40 corner block=[1600, 1600, 1600, 1600]
page 2: corners=[(255, 255, 255), (255, 255, 255), (255, 255, 255), (255, 255, 255)]; white perimeter=5744/5744; white pixels in each 40x40 corner block=[1600, 1600, 1600, 1600]
```

The earlier page-canvas correction changes only page-root painting. The final factual and semantic corrections likewise leave the measured output at exactly two A4 pages and preserve the extracted reading order.

## Final factual reconciliation

The July 2026 Google Drive source review found multiple independently created or updated résumé versions that agree on `Climic — February 2026 – Present | Tehran, Iran`; the earliest authored `muse-frontend` commits are dated 2026-02-22. The canonical record and rendered output therefore use `Feb 2026 — Present` with semantic `startDate: "2026-02"`. Those same source versions agree on `Dideban — August 2023 – December 2023 | Tehran, Iran`; the canonical record and page-two output now include that location. Completed role and education ranges render their start and end values in separate semantic `<time>` elements, while the visible range remains unchanged.

The export toolbar now explicitly instructs users to choose “Save as PDF” and disable “Headers and footers” in the native print dialog. This setting is owned by the browser and cannot be disabled programmatically by the web page; turning it off prevents the browser from adding its date, page title, URL, and page numbers to the A4 margins. The automated reference export uses Chromium's equivalent `--no-pdf-header-footer` flag, and visual inspection confirms that no browser header or footer appears.

## Artifacts

- Desktop web screenshot: `/tmp/soheil-resume-desktop.png`
- Mobile web screenshot: `/tmp/soheil-resume-mobile.png`
- Reference PDF: `/tmp/soheil-fakour-resume.pdf`
- Extracted PDF text: `/tmp/soheil-fakour-resume.txt`
- PDF page-one render: `/tmp/soheil-fakour-resume-page-1.png`
- PDF page-two render: `/tmp/soheil-fakour-resume-page-2.png`
