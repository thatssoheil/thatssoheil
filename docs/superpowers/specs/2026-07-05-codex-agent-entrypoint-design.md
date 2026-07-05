# Codex Agent Entrypoint Migration Design

## Goal

Make Codex the primary repository agent surface by replacing the Claude-specific
project instruction entrypoint with a Codex-readable `AGENTS.md`, while leaving
generic agent guidance and product-facing AI features intact.

## Scope

- Rename `CLAUDE.md` to `AGENTS.md`.
- Preserve the existing project instructions exactly unless wording needs to refer
  to the new filename.
- Remove the stale root `HANDOFF.md`, which describes an old branch/worktree and
  is no longer a trustworthy continuation surface.
- Do not rename or rewrite `docs/agents/*`; those files describe generic
  issue-tracker, triage, and domain-document conventions.
- Do not rename or rewrite `src/lib/ai-soheil/*`, `src/app/api/chat/*`,
  `public/llms.txt`, or chat feature flags; those are product-facing AI surfaces,
  not Claude tooling.

## Architecture

Codex and other AI tools read root project instructions from `AGENTS.md`. The
repo should keep one canonical instruction file at the root instead of parallel
Claude and Codex copies, avoiding drift between tools.

The root instruction file remains a small index into the repo's durable agent
documentation:

- `docs/agents/issue-tracker.md` for GitHub issue conventions.
- `docs/agents/triage-labels.md` for the canonical triage role vocabulary.
- `docs/agents/domain.md` for `CONTEXT.md` and ADR consumption.

## Testing

This is a documentation/tooling migration. Verification should prove:

- No `CLAUDE.md` remains at the repo root.
- `AGENTS.md` exists and contains the project instructions.
- No non-generated `claude` text remains in the repository.
- Product AI paths and generic `docs/agents/*` paths remain unchanged.
- The repo still passes the detected verify gate: `pnpm lint`,
  `pnpm typecheck`, `pnpm build`, and `pnpm test`.
