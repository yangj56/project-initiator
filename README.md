# project-initiator

Scaffold a Next.js app the Vercel way, then add this package's stack and
guardrails.

```bash
npx project-initiator
```

From this repository:

```bash
node src/cli.mjs
```

Node 24 or newer is required. The generated app requires the same.

## Usage

On a terminal, the CLI asks for a project name and a description. A name or
description passed on the command line is the default. Press Enter to keep it.

```bash
npx project-initiator my-app --description "Internal tools"
```

Without a terminal, it does not prompt. Pass the name. The description is
optional.

```bash
npx project-initiator my-app --description "Internal tools"
```

The name is the directory and the npm package name. It must be one path
segment: start with a letter or number, then only letters, numbers, `.`, `_`,
or `-`. `.`, `..`, and names with spaces or slashes are rejected. If that
directory already exists and is not empty, the CLI stops and creates nothing.

The name and description are written into the new app's `package.json`,
`README.md`, and `project.md`.

## What it runs

In order:

1. `create-next-app@latest` with TypeScript, the App Router, Tailwind, ESLint,
   `src/`, the `@/*` import alias, and npm. Install and git are skipped here.
2. `shadcn@latest init --defaults` (style `base-nova`, RSC, neutral, CSS
   variables, Lucide).
3. Copy `template/` into the app. `src/app/globals.css`, `src/lib/utils.ts`,
   and `components.json` are left as shadcn wrote them.
4. Import `./src/env` from `next.config.ts`, append `.data/` to `.gitignore`,
   and merge `package.json`. `dev`, `build`, `start`, and `lint` stay as
   `create-next-app` wrote them. `engines.node` becomes `>=24`.
5. Write `.env.local` and create `.data/`.
6. `git init`. Nothing is committed. `create-next-app` is run with git
   disabled, so this is the repository. If `git init` fails, install still
   runs.
7. `npm install` Next.js, React, `eslint-config-next`, and the overlay
   libraries, each at `@latest`. This package does not pin those versions.

If `create-next-app` fails, the overlay is not applied. If a later step fails,
the CLI names that step and leaves the directory in place.

When it finishes, start local Postgres, run the app, and open the health
route:

```bash
cd my-app
npm run db:local
npm run dev
```

- http://localhost:3000
- http://localhost:3000/api/health

`npm run dev` does not start Postgres.

## What the app includes

- Zod environment validation in `src/env.ts` through `@t3-oss/env-nextjs`.
  `DATABASE_URL` is required, so a Vercel build fails when it is missing.
- A `health` Server Action, query, and `GET /api/health`. Invalid input
  returns `400`. The route does not touch the database. `src/db/schema.ts`
  imports Drizzle and defines no tables.
- Drizzle, `pg`, and Docker Postgres 16. `npm run db:local` listens on
  `localhost:5435`, database `app`, user and password `postgres`. That URL is
  for local Docker only.
- Storage adapters for `local` (files under `.data/uploads`) and `s3`.
- Playwright (`npm run test:e2e`) and a k6 smoke script (`npm run perf`). k6
  is a system binary, not an npm dependency. `npm run check` does not run it.
- `.ai` docs for the App Router, Server Actions, queries, and Zod at the
  boundary, plus root `AGENTS.md` and `CLAUDE.md`.
- Husky for the human git workflow: `pre-commit` runs lint-staged, and
  `pre-push` runs `format:check`.
- Cursor, Claude Code, and Codex hooks that deny `git commit` and `git push`,
  including those commands inside `&&`, pipes, and command substitution. Other
  git commands stay allowed. Your own terminal git is outside those hooks.

Agents do not commit or push. You do.

Codex runs the project hook only after you open `/hooks` and trust it. Cursor
and Claude Code load the hook with the project.

## Deploy

The CLI does not log in to Vercel, link a project, or deploy. There is no
`vercel.json`. Vercel detects Next.js.

Push the repository yourself, then import it or run `npx vercel`.

- Framework preset: Next.js
- Build command: `next build`
- Node.js 24
- Set every variable from `.env.sample` for Production, Preview, and
  Development
- Use a pooled `DATABASE_URL`
- Apply Drizzle migrations yourself before production traffic. The build does
  not run them.

## This repository

`npm test` runs Vitest for the CLI: prompts, `package.json` merge, the
template file list, and the agent git guard. It does not run
`create-next-app`.

Design: [`docs/superpowers/specs/2026-11-07-project-initiator-design.md`](docs/superpowers/specs/2026-11-07-project-initiator-design.md).
