# Soheil Fakour

**Coding Vision into Existence**

Frontend Engineer and Product Curator. Tehran.

---

I stopped chasing perfection a while ago. Reality moves too fast for finished work. What I chase now is curation — choosing what stays and what gets cut, building from the pieces that hold up. A product isn't great because it has everything. It's great because someone decided what to leave out.

I'd rather show you the thing than argue about the thing. If an idea matters, I'll build a small working version of it before the next meeting.

I started in backend, writing infrastructure no one would ever touch. I left because I wanted to shape what people actually see and feel. Frontend isn't decoration for me — it's the surface where every product decision either lands or doesn't.

## Now

Anchoring frontend and product on a small team building a medical AI tool that helps clinicians navigate patient data. Heading into Oman next.

Before this: travel and hotel channel-management infrastructure, then a deliberate move to the frontend. Several products since, B2C and B2B, including remote work with teams in Dallas and Toronto.

I lean on agentic AI for the boilerplate so my attention stays where it matters — feature ideation, systems design, and the small mechanics of how a thing feels to use. Then I cut what doesn't survive contact with the real product.

The tools: TypeScript, React 19, Next.js 16, Tailwind, GSAP. Shipped on Cloudflare Workers.

## Open-source

<!-- OSS:START -->
**2 merged PRs** across **2 repos** · **2 open** in flight.

→ [Full dashboard](https://github.com/thatssoheil/oss-contributions)
<!-- OSS:END -->

## Feature Flags

### Chat (AI Soheil hero chat)

The AI-powered hero chat is feature-flagged. To ship without it, set both flags to `"false"`.

| Flag | Where | Purpose |
|------|-------|---------|
| `ENABLE_CHAT` | `wrangler.jsonc` → `vars` | Runtime gate — `/api/chat` returns 404 when `"false"` |
| `NEXT_PUBLIC_ENABLE_CHAT` | Build env var | Build-time gate — chat UI is hidden when not `"true"` |

**Ship without chat:**
```bash
NEXT_PUBLIC_ENABLE_CHAT=false pnpm deploy
```
Ensure `wrangler.jsonc` has `"ENABLE_CHAT": "false"` (default).

**Ship with chat:**
```bash
NEXT_PUBLIC_ENABLE_CHAT=true pnpm deploy
```
Set `"ENABLE_CHAT": "true"` in `wrangler.jsonc`.

**GitHub canonical variable:** The canonical source of truth lives at
**GitHub → Settings → Secrets and variables → Actions → Variables → `ENABLE_CHAT`**.
Future CI/CD should read this variable and pass it to both build and deploy steps.

**Local dev (chat enabled):**
Copy `.dev.vars.example` to `.dev.vars`, set `ENABLE_CHAT=true`, and run:
```bash
pnpm dev
```

## Elsewhere

- **Site** — [thatssoheil.website](https://thatssoheil.website)
- **LinkedIn** — [in/soheilfakour](https://linkedin.com/in/soheilfakour)
- **X** — [@Thatssoheil](https://x.com/Thatssoheil)
- **Email** — [soheil.fakour@gmail.com](mailto:soheil.fakour@gmail.com)

<sub>Bass-heavy techno for focus. Crypto markets as a macro puzzle.</sub>
