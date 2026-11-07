# {{name}}

{{description}}

Next.js app created with `project-initiator`. It is meant to run on Vercel.

## Local

Node 24 is required.

```bash
npm run db:local
npm run dev
```

Postgres listens on `localhost:5435`. The CLI writes `.env.local` with:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/app
STORAGE_DRIVER=local
```

`.env.sample` lists every variable. Keep it in sync with `src/env.ts`.

- http://localhost:3000
- http://localhost:3000/api/health

`npm run dev` does not start Postgres. Use `npm run db:local`.

## Checks

```bash
npm run check
npm run test:e2e
npm run perf
```

`npm run check` is typecheck, lint, Prettier, and Vitest. Playwright and k6
are separate. k6 is a system binary.

## Database

Edit `src/db/schema.ts`, then:

```bash
npm run drizzle:generate
npm run drizzle:check
```

Apply migrations yourself. Do not run them from the Vercel build.

## Storage

`STORAGE_DRIVER` is `local` or `s3`. Local files go in `.data/uploads`.
S3 needs the variables in `.env.sample`. The first upload route must follow
`.ai/PRACTICES.md`.

## Vercel

Push the repository yourself, then import it in Vercel or run `npx vercel`.

- Framework preset: Next.js
- Build command: `next build`
- Node.js 24
- Set every variable from `.env.sample` for Production, Preview, and Development
- Use a pooled `DATABASE_URL`
- Apply migrations before production traffic. The build does not run them.

There is no `vercel.json`. Vercel detects Next.js.

## Agent git

Cursor, Claude Code, and Codex are blocked from `git commit` and `git push`.
Your own terminal git still works.

Codex runs the project hook only after you trust it. Open `/hooks` in Codex
and trust this repository's hook.
