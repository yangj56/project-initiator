# Tech Stack

Use this for versions and scripts. Routing and data flow live in
[`CODE_NEXTJS.md`](./CODE_NEXTJS.md).

## Runtime

| Layer | Choice |
| --- | --- |
| Node | **24.x** (`.nvmrc`, `.node-version`, `engines`) |
| Host | **Vercel**, Next.js preset, build command `next build` |
| Framework | Current **Next.js** App Router (`create-next-app@latest`, then `next@latest`) |
| UI | Current **React**, **Tailwind**, and **shadcn/ui** style `base-nova` |
| Forms | Native fields plus Zod in Server Actions |
| Env | `@t3-oss/env-nextjs` in `src/env.ts` |

## Data

| Layer | Choice |
| --- | --- |
| Database | **PostgreSQL** via `DATABASE_URL` |
| ORM | **Drizzle** — `src/db/schema.ts`, `drizzle/`, `drizzle.config.ts`, `pg` |
| Local | Docker Compose — `npm run db:local` on `localhost:5435`, database `app` |
| Production | Pooled `DATABASE_URL` set in the Vercel project. Migrations are applied by a person, not by the build. |
| Files | `local` under `.data/uploads`, or `s3` |

Schema change: edit `src/db/schema.ts`, run `npm run drizzle:generate`, then
`npm run drizzle:check`.

Database-mutating commands are human-only unless the user asks for that
command. See [`NEVER_DO.md`](./NEVER_DO.md).

## Tooling

TypeScript 5, ESLint 9, Prettier 3, Vitest, Playwright, k6, Husky, lint-staged.

k6 is installed on the machine. It is not an npm dependency. `npm run check`
does not run k6.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev |
| `npm run db:local` | Start local Postgres |
| `npm run check` | typecheck, lint, format, Vitest |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright smoke test |
| `npm run perf` | k6 smoke script |
| `npm run drizzle:generate` / `drizzle:check` | Schema diff and migration history |
