# Chat Feature Flag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Feature-flag the AI Soheil hero chat behind `ENABLE_CHAT` / `NEXT_PUBLIC_ENABLE_CHAT` env vars so the site can ship without chat while development continues.

**Architecture:** Two env vars gate the chat at two layers — `NEXT_PUBLIC_ENABLE_CHAT` (build-time, client-side) hides the chat UI, and `ENABLE_CHAT` (runtime, Cloudflare Worker var) rejects requests to `/api/chat`. Both default to `"false"` for the ship-without-chat version. Dev defaults to `"true"` so local development is unaffected. The canonical toggle is a GitHub Actions variable on the repo.

**Tech Stack:** Next.js 16 App Router, Cloudflare Workers (OpenNext), TypeScript 6

## Global Constraints

- `NEXT_PUBLIC_ENABLE_CHAT` must be set at build time (Next.js convention — `NEXT_PUBLIC_*` is inlined into client bundle)
- `ENABLE_CHAT` must be a string `"true"` or `"false"` (Cloudflare Worker `vars` are always strings)
- The flag must default to `"false"` for production, `"true"` for local dev
- Zero visual regression when chat is disabled — the hero looks identical to the chat-absent version
- TypeScript must type-check cleanly with `pnpm typecheck`

---

## File Structure

| File | Role |
|------|------|
| `wrangler.jsonc` | Add `ENABLE_CHAT` runtime var for Cloudflare Worker |
| `.dev.vars.example` | New file — document all dev env vars (AI_SOHEIL_API_URL, AI_SOHEIL_API_KEY, ENABLE_CHAT) |
| `cloudflare-env.d.ts` | Regenerate after adding var (adds `ENABLE_CHAT: string` type) |
| `src/app/api/chat/route.ts` | Guard: return 404 when `ENABLE_CHAT !== "true"` |
| `src/components/sections/hero.tsx` | Guard: skip `<HeroChat>` when flag is false |
| `README.md` | Document the feature flag and GitHub variable setup |

---

### Task 1: Add `ENABLE_CHAT` to Cloudflare Worker vars

**Files:**
- Modify: `wrangler.jsonc:38-40` (the `vars` block)
- Modify: `cloudflare-env.d.ts` (regenerate via `wrangler types`)
- Create: `.dev.vars.example`

**Interfaces:**
- Consumes: nothing
- Produces: `env.ENABLE_CHAT: string` available in `getCloudflareContext()` at runtime, value `"false"` in prod, `"true"` in dev

- [ ] **Step 1: Add `ENABLE_CHAT` to wrangler.jsonc vars**

In `wrangler.jsonc`, the `vars` block at line 38 currently has:
```jsonc
"vars": {
    "AI_SOHEIL_API_URL": "https://agent.thatssoheil.website/v1"
},
```

Change it to:
```jsonc
"vars": {
    "AI_SOHEIL_API_URL": "https://agent.thatssoheil.website/v1",
    "ENABLE_CHAT": "false"
},
```

Note: `FREELLMAPI_KEY` was renamed to `AI_SOHEIL_API_KEY`. If you previously had the secret set on Cloudflare, migrate it:

```bash
wrangler secret put AI_SOHEIL_API_KEY   # paste the same value
wrangler secret delete FREELLMAPI_KEY   # clean up old secret
```

- [ ] **Step 2: Regenerate cloudflare-env.d.ts**

Run: `pnpm cf-typegen`

This runs `wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts` and adds `ENABLE_CHAT: string` to the `__BaseEnv_CloudflareEnv` interface.

Expected: command succeeds, `cloudflare-env.d.ts` now contains `ENABLE_CHAT: string`.

Verify with:
```bash
grep 'ENABLE_CHAT' cloudflare-env.d.ts
```
Expected output: `ENABLE_CHAT: string;`

- [ ] **Step 3: Create .dev.vars.example**

The `.dev.vars` file is gitignored (via `.env*` in `.gitignore`). Create `.dev.vars.example` as documentation for what dev vars are needed:

```
# Dev vars for thatssoheil — copy to .dev.vars and fill in secrets.
# wrangler.jsonc provides defaults for non-secret vars; .dev.vars
# overrides them for `wrangler dev` / `next dev` (OpenNext dev mode).

# Required: your AI Soheil API key (get from agent.thatssoheil.website admin)
AI_SOHEIL_API_KEY=your-key-here

# Optional overrides (defaults in wrangler.jsonc):
# AI_SOHEIL_API_URL=https://agent.thatssoheil.website/v1

# Feature flag — set "true" for local dev (chat enabled), "false" to test
# the chat-disabled ship.
ENABLE_CHAT=true
```

- [ ] **Step 4: Verify typecheck**

Run: `pnpm typecheck`

Expected: PASS (no new errors).

- [ ] **Step 5: Commit**

```bash
git add wrangler.jsonc cloudflare-env.d.ts .dev.vars.example
git commit -m "feat(flag): add ENABLE_CHAT Cloudflare Worker var (default false)"
```

---

### Task 2: Guard `/api/chat` route with `ENABLE_CHAT`

**Files:**
- Modify: `src/app/api/chat/route.ts:33-35` (after `getCloudflareContext()` call)

**Interfaces:**
- Consumes: `env.ENABLE_CHAT: string` from Task 1
- Produces: `POST /api/chat` returns 404 when `ENABLE_CHAT !== "true"`

- [ ] **Step 1: Add the guard in route.ts**

In `src/app/api/chat/route.ts`, immediately after line 34 (`const { env } = getCloudflareContext();`), insert a guard block. The existing code at lines 33-35 is:

```typescript
export async function POST(req: Request): Promise<Response> {
    const { env } = getCloudflareContext();

    if (isCrossOrigin(req)) return json({ error: "forbidden" }, 403);
```

Change to:

```typescript
export async function POST(req: Request): Promise<Response> {
    const { env } = getCloudflareContext();

    // Feature flag — ship without chat until the feature is ready.
    if (env.ENABLE_CHAT !== "true") {
        return new Response("Not Found", { status: 404 });
    }

    if (isCrossOrigin(req)) return json({ error: "forbidden" }, 403);
```

Note: `env.ENABLE_CHAT` is typed as `string` (from the regenerated `cloudflare-env.d.ts`). The string comparison `!== "true"` is correct — Cloudflare Worker vars are always strings, never booleans.

- [ ] **Step 2: Verify typecheck**

Run: `pnpm typecheck`

Expected: PASS. The `ENABLE_CHAT` field now exists on the `CloudflareEnv` type from Task 1's type regeneration.

- [ ] **Step 3: Verify lint**

Run: `pnpm lint`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat(flag): guard /api/chat with env.ENABLE_CHAT — 404 when disabled"
```

---

### Task 3: Gate `<HeroChat>` UI with `NEXT_PUBLIC_ENABLE_CHAT`

**Files:**
- Modify: `src/components/sections/hero.tsx:142` (the `<HeroChat />` render line)

**Interfaces:**
- Consumes: `NEXT_PUBLIC_ENABLE_CHAT` build-time env var (set via shell or `.env`)
- Produces: hero section renders chat only when `NEXT_PUBLIC_ENABLE_CHAT === "true"`

- [ ] **Step 1: Gate the HeroChat render**

In `src/components/sections/hero.tsx`, line 142 currently reads:

```tsx
                {/* Ask, don't scroll — the prompt bar grows in place into the chat. */}
                <HeroChat />
```

Replace lines 141-142 with:

```tsx
                {/* Ask, don't scroll — the prompt bar grows in place into the chat.
                    Feature-flagged: ship without chat by setting NEXT_PUBLIC_ENABLE_CHAT=false. */}
                {process.env.NEXT_PUBLIC_ENABLE_CHAT === "true" && <HeroChat />}
```

Note: `process.env.NEXT_PUBLIC_ENABLE_CHAT` is a build-time constant in Next.js — `NEXT_PUBLIC_*` env vars are inlined at build time. The value is a string `"true"` or `"false"`, never boolean. When the var is unset, `process.env.NEXT_PUBLIC_ENABLE_CHAT` is `undefined`, which is `!== "true"`, so chat is hidden — safe default.

- [ ] **Step 2: Add type declaration for NEXT_PUBLIC_ENABLE_CHAT**

Next.js does not auto-type `NEXT_PUBLIC_*` vars for `process.env` in TypeScript. We need a declaration so `pnpm typecheck` passes. The standard Next.js convention is to declare it in `next-env.d.ts` or a separate `env.d.ts`. However, `next-env.d.ts` is gitignored (see `.gitignore` line 42: `next-env.d.ts`). Instead, create a declaration file that won't be regenerated.

Create `src/env.d.ts`:

```typescript
// Declare NEXT_PUBLIC_* env vars that are inlined at build time by Next.js.
// These are NOT available at runtime — they are baked into the client bundle
// at build time. The source value is an env var set in the build environment.
declare namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_ENABLE_CHAT?: string;
    }
}
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm typecheck`

Expected: PASS.

- [ ] **Step 4: Verify build with flag disabled (the ship mode)**

```bash
NEXT_PUBLIC_ENABLE_CHAT=false pnpm build
```

Then scan the built output for the chat-related strings that should NOT appear when disabled:

```bash
grep -r 'ask me anything' .next/ 2>/dev/null || echo "PASS: chat placeholder absent"
grep -r 'HeroChat' .next/static/chunks/*.js 2>/dev/null | head -5
```

The first grep should return nothing (no chat placeholder text). The second may still include `HeroChat` in the chunk map if Next.js doesn't fully tree-shake it — that's acceptable for a personal site. The guard is `process.env.NEXT_PUBLIC_ENABLE_CHAT === "true"` which is a runtime boolean; the component code may still be in the bundle but will never render.

- [ ] **Step 5: Verify build with flag enabled (chat-present mode)**

```bash
NEXT_PUBLIC_ENABLE_CHAT=true pnpm build
```

```bash
grep 'ask me anything' .next/static/chunks/*.js | head -1
```

Expected: finds the chat placeholder text — chat is present in the bundle.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/hero.tsx src/env.d.ts
git commit -m "feat(flag): gate HeroChat UI with NEXT_PUBLIC_ENABLE_CHAT"
```

---

### Task 4: Document the feature flag

**Files:**
- Modify: `README.md` — add a Feature Flags section

**Interfaces:**
- Consumes: nothing
- Produces: documentation for how to toggle the chat flag

- [ ] **Step 1: Add Feature Flags section to README.md**

In `README.md`, add a section after the deployment instructions (or at the end). The exact insertion point depends on the current README structure — add it as the last section before any footer.

```markdown
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
The dev server picks up `.dev.vars` for Cloudflare bindings via OpenNext's dev mode.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs(flag): document ENABLE_CHAT and NEXT_PUBLIC_ENABLE_CHAT feature flags"
```

---

## Self-Review

**1. Spec coverage:** The user asked for a GitHub env variable to feature-flag the chat so they can ship without it. Covered:
- Task 1: `ENABLE_CHAT` runtime flag in Cloudflare Worker vars
- Task 2: API route guard (404 when disabled)
- Task 3: UI guard (component conditionally rendered)
- Task 4: Documentation including GitHub canonical variable location

**2. Placeholder scan:** No TBDs, TODOs, or hand-wavy steps. Every step has exact code and exact commands.

**3. Type consistency:** `ENABLE_CHAT: string` from Task 1's `cloudflare-env.d.ts` regeneration is consumed by Task 2 as `env.ENABLE_CHAT !== "true"`. `NEXT_PUBLIC_ENABLE_CHAT` is declared in `src/env.d.ts` in Task 3 and consumed in `hero.tsx`.

---

## Execution Handoff

Plan complete. Saved to `docs/superpowers/plans/2026-07-03-chat-feature-flag.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**