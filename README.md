# project-initiator

Scaffold a Next.js app the Vercel way, then add Drizzle, Postgres, S3, Playwright, k6, Zod, and agent git guards.

Node.js 24 or newer is required.

## Install

```bash
npm i project-initiator
```

## Create a project

Run this in the folder where the new app should be created. On a terminal, it asks for a project name and a description. Press Enter to keep a value you already passed.

```bash
npx project-initiator
```

You can pass the name and description up front:

```bash
npx project-initiator my-app --description "Internal tools"
```

The name is the new directory and the npm package name. It must be one path segment: start with a letter or number, then only letters, numbers, `.`, `_`, or `-`. If that directory already exists and is not empty, the command stops and creates nothing.

The name and description are written into the new app's `package.json`, `README.md`, and `project.md`.

## Set up the new app

When the command finishes, start local Postgres and run the app. Docker must be running. `npm run dev` does not start Postgres.

```bash
cd my-app
npm run db:local
npm run dev
```

Open:

- http://localhost:3000
- http://localhost:3000/api/health

`npm run db:local` starts Postgres 16 on `localhost:5435`, database `app`, user and password `postgres`. That URL is for local Docker only. Stop it with `npm run db:local:down`.

## What the command does

1. `create-next-app@latest` with TypeScript, the App Router, Tailwind, ESLint, `src/`, the `@/*` import alias, and npm.
2. `shadcn@latest init --defaults` (style `base-nova`, RSC, neutral, CSS variables, Lucide).
3. Copy this package's template into the app. `src/app/globals.css`, `src/lib/utils.ts`, and `components.json` stay as shadcn wrote them.
4. Import `./src/env` from `next.config.ts`, append `.data/` to `.gitignore`, and merge `package.json`. `engines.node` becomes `>=24`.
5. Write `.env.local` and create `.data/`.
6. `git init`. Nothing is committed.
7. `npm install` the app dependencies at `@latest`.

If `create-next-app` fails, the template is not applied. If a later step fails, the command names that step and leaves the directory in place.

## What the app includes

- Zod environment validation in `src/env.ts`. `DATABASE_URL` is required, so a Vercel build fails when it is missing.
- A `health` Server Action, query, and `GET /api/health`. Invalid input returns `400`. The route does not touch the database.
- Drizzle and `pg`, plus the Docker Postgres above.
- Storage adapters for `local` (files under `.data/uploads`) and `s3`.
- Playwright (`npm run test:e2e`) and a k6 smoke script (`npm run perf`). Install k6 on the machine. It is not an npm package. `npm run check` does not run it.
- `.ai` docs, plus root `AGENTS.md` and `CLAUDE.md`.
- Husky for your git workflow: `pre-commit` runs lint-staged, and `pre-push` runs `format:check`.
- Cursor, Claude Code, and Codex hooks that deny `git commit` and `git push`. Other git commands stay allowed. Your own terminal git is outside those hooks.

You commit and push. The agents do not.

Codex runs the project hook after you open `/hooks` and trust it. Cursor and Claude Code load the hook with the project.

## Deploy

The command does not log in to Vercel or deploy. Push the repository yourself, then import it or run `npx vercel`.

- Framework preset: Next.js
- Build command: `next build`
- Node.js 24
- Set every variable from `.env.sample` for Production, Preview, and Development
- Use a pooled `DATABASE_URL`
- Apply Drizzle migrations yourself before production traffic. The build does not run them.

## Environment

This package does not read environment variables. [`.env.example`](.env.example) records that. npm credentials stay in `npm login`, not in the repository.

Apps created by the command get their env list from `template/.env.sample`. The command writes `.env.local` in the new app.

## Publish to npm

The package name on the registry is `project-initiator`. That name was unpublished on 2020-03-26. The 24-hour hold has passed, so a new publish can claim it. If the registry rejects the name, publish under a scope you own, such as `@your-scope/project-initiator`, and keep the `bin` name.

`npm test` runs before every `npm publish`.

### First publish

Trusted publishing can only update a package that already exists. Publish `0.1.0` once from your machine:

```bash
npm login
npm whoami
npm publish --access public
```

Open the sign-in link npm prints if it asks for a browser login. Do not pass `--provenance` for this local publish. Provenance comes from GitHub Actions after the trusted publisher is configured.

### Later publishes

1. On the package's npm page, open **Settings**, then **Trusted Publisher**.
2. Choose GitHub Actions. Set your GitHub user or organization, this repository, and workflow filename `publish.yml`. Allow `npm publish`.
3. Bump `version` in `package.json`. The same version cannot be published twice.
4. Commit, tag, and push the tag. [`.github/workflows/publish.yml`](.github/workflows/publish.yml) runs `npm ci`, `npm test`, and `npm publish` with GitHub's OIDC token. No `NPM_TOKEN` secret is required.

```bash
git tag v0.1.1
git push origin v0.1.1
```

This repository does not have a git remote yet. Push it to GitHub before the workflow can run. Use a GitHub-hosted runner. npm checks the workflow filename exactly.

## This repository

`npm test` runs Vitest for the CLI: prompts, `package.json` merge, the template file list, and the agent git guard. It does not run `create-next-app`.

Design: [`docs/superpowers/specs/2026-11-07-project-initiator-design.md`](docs/superpowers/specs/2026-11-07-project-initiator-design.md).
