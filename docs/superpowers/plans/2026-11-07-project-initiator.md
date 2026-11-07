# project-initiator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace this photo-contest app with the `project-initiator` package that scaffolds a blank Vercel Next.js app plus the overlay in the spec.

**Architecture:** A Node ESM CLI runs `create-next-app@16`, then `shadcn init --defaults` (base-nova), then copies `template/` and merges `package.json`. One Node script denies agent `git commit` and `git push` for Cursor, Claude Code, and Codex.

**Tech Stack:** Node `>=24`, plain ESM, Vitest, create-next-app 16, shadcn base-nova, Drizzle, `pg`, Zod, AWS S3 SDK, Playwright, k6.

**Spec:** `docs/superpowers/specs/2026-11-07-project-initiator-design.md`

## Global Constraints

- Package name `project-initiator`. Binary name `project-initiator`.
- Node `>=24` for the package and the generated app.
- Generated app package manager is npm.
- Next.js 16 App Router, React 19, TypeScript, Tailwind, shadcn `base-nova`.
- `create-next-app` flags: `--yes --ts --tailwind --eslint --app --src-dir --import-alias @/* --use-npm --no-react-compiler --agents-md --no-agent-feedback --skip-install --disable-git`.
- shadcn: `init --defaults --no-monorepo` (`--defaults` is template next and preset base-nova).
- Do not overwrite `src/app/globals.css` or `src/lib/utils.ts` when they already exist.
- Keep create-next-app `dev`, `build`, `start`, and `lint` scripts and its `next` / `react` / `react-dom` versions.
- Local Postgres: `postgres:16-alpine`, host port `5435`, database `app`, user `postgres`, password `postgres`.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5435/app` in the generated `.env.local`.
- Health schema: `echo` is an optional trimmed string of at most 80 characters.
- Health repository does not import `@/lib/db`.
- Agent guard denies `git commit` and `git push`, including chains and substitutions, and fails closed.
- The agent does not commit or push.
- Do not run `npm publish`.
- Default `npm test` does not run `create-next-app`.

## Review Focus

- A quoted `&&` inside `git commit -m "..."` must not be treated as a second command, and `echo $(git commit)` must still be denied.
- `git add` and `git status` must stay allowed.
- Invalid guard JSON must deny for every host.
- Overlay copy must not clobber shadcn's `globals.css` or `utils.ts`.
- `next.config.ts` must import `./src/env` exactly once.

### Task 1: Agent git guard

**Files:**
- Create: `template/scripts/agent-git-guard.mjs`
- Test: `src/agent-git-guard.test.ts`

**Interfaces:**
- Consumes: stdin JSON, argv host `cursor` | `claude` | `codex`
- Produces: Cursor `{ permission: "deny" | "allow" }`; Claude and Codex `hookSpecificOutput.permissionDecision = "deny"` or empty stdout when allowed

### Task 2: Package merge and overlay helpers

**Files:**
- Create: `src/merge-package.mjs`, `src/overlay.mjs`, `template/package.overlay.json`
- Test: `src/merge-package.test.ts`

**Interfaces:**
- Produces: `mergePackage(base, overlay)`, `patchNextConfig(source)`, `appendDataGitignore(source)`, `applyOverlay(appDir, templateDir)`

### Task 3: Template app files

**Files:**
- Create: `template/**` health domain, env, db, storage, docker, playwright, k6, `.ai`, hook configs, README, `project.md`

### Task 4: CLI

**Files:**
- Create: `src/cli.mjs`, `src/create-next.mjs`
- Test: `src/template-manifest.test.ts`

**Interfaces:**
- Produces: bin `project-initiator <name>`

### Task 5: Replace the contest app

Remove the photo-contest source, infra, and older specs. Keep this spec, this plan, and the new package. Point root agent docs and hooks at the guard. Run `npm test`.
