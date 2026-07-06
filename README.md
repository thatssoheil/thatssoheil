# Soheil Fakour

**Coding vision into existence**

Frontend Engineer × Product Curator

---

## Manifesto

Frontend Engineer and Product Curator

### On curation

I stopped chasing perfection a while ago. Reality moves too fast for finished work. What I chase now is curation, choosing what stays and what gets cut, building from the pieces that hold up. A product isn't great because it has everything. It's great because someone decided what to leave out.

### On working

I'd rather show you the thing than argue about the thing. If an idea matters, I'll build a small working version of it before the next meeting. If it doesn't survive contact with the real product, I'll remove it without ceremony. The work wins the room. Words rarely do.

### On the medium

I started in backend, writing infrastructure that kept hotel inventory and travel agencies in sync. No one ever saw it. No one ever felt it. After a year I left to build what people actually touch. Frontend isn't decoration for me. It's the surface where every product decision either lands or doesn't. That's where the work matters.

## Connect

Say hello.

Email first. Catch me on X. Everything else, eventually.

- **Email:** [soheil.fakour@gmail.com](mailto:soheil.fakour@gmail.com)
- **GitHub:** [github.com/thatssoheil](https://github.com/thatssoheil)
- **LinkedIn:** [linkedin.com/in/soheilfakour](https://linkedin.com/in/soheilfakour)
- **X / Twitter:** [@Thatssoheil](https://x.com/Thatssoheil)
- **Site:** [thatssoheil.website](https://thatssoheil.website)

## AI Soheil chat

The hero prompt and Cmd+K “Ask Soheil” action are behind a two-part env gate:

- `NEXT_PUBLIC_ENABLE_CHAT=true` renders client chat entry points at build time.
- `ENABLE_CHAT=true` lets `/api/chat` accept requests at runtime.

Local setup:

```bash
cp .env.example .env.local
cp .dev.vars.example .dev.vars
```

Fill `AI_SOHEIL_API_KEY` in `.dev.vars`. The upstream must be OpenAI-compatible at
`$AI_SOHEIL_API_URL/chat/completions`; the default URL already includes `/v1`.
