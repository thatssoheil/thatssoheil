# Soheil Fakour

**Coding vision into existence**

Frontend Engineer × Product Curator

---

## Manifesto

Frontend Engineer and Product Curator

### On curation

I stopped chasing perfection a while ago. Reality moves too fast for finished work. What I chase now is curation — choosing what stays and what gets cut, building from the pieces that hold up. A product isn't great because it has everything. It's great because someone decided what to leave out.

### On working

I'd rather show you the thing than argue about the thing. If an idea matters, I'll build a small working version of it before the next meeting. If it doesn't survive contact with the real product, I'll remove it without ceremony. The work wins the room. Words rarely do.

### On the medium

I started in backend, writing infrastructure that kept hotel inventory and travel agencies in sync. No one ever saw it. No one ever felt it. After a year I left to build what people actually touch. Frontend isn't decoration for me. It's the surface where every product decision either lands or doesn't. That's where the work matters.

## Connect

Say hello.

Email first. Catch me on X. Everything else, eventually.

- **Email** — [soheil.fakour@gmail.com](mailto:soheil.fakour@gmail.com)
- **GitHub** — [github.com/thatssoheil](https://github.com/thatssoheil)
- **LinkedIn** — [linkedin.com/in/soheilfakour](https://linkedin.com/in/soheilfakour)
- **X / Twitter** — [@Thatssoheil](https://x.com/Thatssoheil)
- **Site** — [thatssoheil.website](https://thatssoheil.website)

---

## Project Notes

### Feature Flags

#### Chat (AI Soheil hero chat)

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
The deploy workflow reads this variable and injects it into `wrangler.jsonc` at build time.
Manual dispatch accepts an `enable_chat` boolean input to override.

**Required secrets** (set at Settings → Secrets and variables → Actions → Secrets):
- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Workers deploy permissions
- `CLOUDFLARE_ACCOUNT_ID` — Your Cloudflare account ID

**Local dev (chat enabled):**
Copy `.dev.vars.example` to `.dev.vars`, set `ENABLE_CHAT=true`, and run:
```bash
pnpm dev
```
