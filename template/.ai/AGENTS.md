# Agent Instructions

Current Next.js App Router + React + TypeScript + Drizzle + PostgreSQL. Hosted on Vercel.

This is the quick checklist. Do not contradict `.ai/` unless the user explicitly
allows it.

## Read First

1. [`PRACTICES.md`](./PRACTICES.md)
2. [`DOCUMENTATION.md`](./DOCUMENTATION.md)
3. [`CODE_NEXTJS.md`](./CODE_NEXTJS.md)
4. [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
5. [`NEVER_DO.md`](./NEVER_DO.md)
6. [`SECURITY.md`](./SECURITY.md)
7. `node_modules/next/dist/docs/` when Next.js 16 behavior is unclear

## Must Keep

- Read [`../project.md`](../project.md) for project behavior.
- Use [`DOCUMENTATION.md`](./DOCUMENTATION.md) for new feature brainstorming.
- Keep the folder pattern in [`PRACTICES.md`](./PRACTICES.md).
- UI reads and writes go through `src/app/actions/<domain>/`.
- Every input action, query, and Route Handler validates with Zod schemas from `input.ts`.
- Repositories own Drizzle. Pages and actions do not import `@/lib/db`.
- Re-check the session in protected Actions and Route Handlers.
- Server Components by default. `"use client"` only when needed.
- Do not edit generated shadcn files in `src/components/ui/`.
- Keep `.env.sample` in sync with `src/env.ts`.
- Do not `git commit` or `git push`. The user does that.

## Workflow

- Smallest change that satisfies the request. No drive-by refactors.
- No new or upgraded dependencies unless asked.
- Git and database commands follow [`PRACTICES.md`](./PRACTICES.md) and [`NEVER_DO.md`](./NEVER_DO.md).
- Verify with focused checks, then `npm run check` when appropriate.

## Commands

- `npm run check` — typecheck, lint, format check, tests
- `npm test` — Vitest
- `npm run drizzle:generate` — generate a migration from the schema
- `npm run drizzle:check` — validate migration history
- `npm run db:local` — start local Postgres

Full scripts: [`CODE_TECH_STACK.md`](./CODE_TECH_STACK.md). Never run
database-mutating commands unless the user asks for that exact command.
