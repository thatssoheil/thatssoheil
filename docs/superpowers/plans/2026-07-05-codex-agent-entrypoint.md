# Codex Agent Entrypoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Codex the canonical repository agent entrypoint by replacing `CLAUDE.md` with `AGENTS.md` and removing the stale root handoff.

**Architecture:** Keep one root instruction file, `AGENTS.md`, that indexes durable repo guidance in `docs/agents/*`. Remove stale branch-local continuation state instead of preserving it as an agent source.

**Tech Stack:** Markdown docs, Git, pnpm verify commands for the Next.js repository.

## Global Constraints

- Do not modify product-facing AI code under `src/lib/ai-soheil/*` or `src/app/api/chat/*`.
- Do not rename generic agent documentation under `docs/agents/*`.
- Do not keep parallel root `CLAUDE.md` and `AGENTS.md` copies.
- Preserve existing root project instruction content when moving it to `AGENTS.md`.

---

### Task 1: Codex Root Instructions

**Files:**
- Rename: `CLAUDE.md` -> `AGENTS.md`
- Delete: `HANDOFF.md`

**Interfaces:**
- Consumes: Root project instruction content from `CLAUDE.md`.
- Produces: Root Codex-readable project instructions in `AGENTS.md`.

- [ ] **Step 1: Rename the root instruction file**

Run:

```bash
git mv CLAUDE.md AGENTS.md
```

Expected: `git status --short` shows `R  CLAUDE.md -> AGENTS.md`.

- [ ] **Step 2: Remove the stale handoff**

Run:

```bash
git rm HANDOFF.md
```

Expected: `git status --short` shows `D  HANDOFF.md`.

- [ ] **Step 3: Confirm the new entrypoint content**

Run:

```bash
sed -n '1,160p' AGENTS.md
```

Expected: output starts with `# thatssoheil` and includes links to `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, and `docs/agents/domain.md`.

- [ ] **Step 4: Commit the migration**

Run:

```bash
git add AGENTS.md HANDOFF.md
git commit -m "chore: migrate agent entrypoint to Codex"
```

Expected: commit succeeds with the rename and deletion.

### Task 2: Verification

**Files:**
- Inspect: `AGENTS.md`
- Inspect: repository search results

**Interfaces:**
- Consumes: Migration commit from Task 1.
- Produces: Verification evidence for the PR.

- [ ] **Step 1: Verify no Claude entrypoint remains**

Run:

```bash
test ! -e CLAUDE.md && test -f AGENTS.md
```

Expected: exit code `0`.

- [ ] **Step 2: Verify no non-generated Claude references remain**

Run:

```bash
rg -n --hidden --glob '!node_modules/**' --glob '!cloudflare-env.d.ts' --glob '!.git/**' -i "claude" . || true
```

Expected: no output.

- [ ] **Step 3: Verify product AI and generic agent docs are untouched**

Run:

```bash
git diff --name-only origin/dev...HEAD
```

Expected: output is limited to `AGENTS.md`, `HANDOFF.md`, and docs under `docs/superpowers/`.

- [ ] **Step 4: Run the detected verify gate**

Run:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Expected: every command exits `0`.
