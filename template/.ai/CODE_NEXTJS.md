# Next.js App Router

**Next.js 16** (App Router, React 19) + **Drizzle** + **PostgreSQL** on **Vercel**.
Use this for routing, Server Actions, repositories, Drizzle, and env. Required
practices live in [`PRACTICES.md`](./PRACTICES.md).

## 1. Routing

- App Router files live under `src/app/**`.
- Route-local UI goes in `_components/`.
- Use Server Components by default.
- Add `"use client"` only for hooks, effects, event handlers, or browser APIs.
- Use `loading.tsx` per segment and `<Suspense>` for slow subtrees.
- `params`, `searchParams`, `cookies()`, and `headers()` may need `await` in
  Next.js 16.
- `proxy.ts` replaces the old middleware filename. `proxy.ts` is not enough
  for auth. Protected Actions and Route Handlers check the session themselves.

Folder rules live in [`PRACTICES.md`](./PRACTICES.md).

## 2. Root config

| File | Role |
| --- | --- |
| `next.config.ts` | **`import "./src/env"`** so the build fails on a bad env |
| `drizzle.config.ts` | Kit dialect `postgresql`, schema `src/db/schema.ts`, reads `DATABASE_URL` |
| `eslint.config.mjs` | ESLint 9 + next + prettier last |
| `tsconfig.json` | `@/*` → `./src/*` |
| `.env.local` / `.env.sample` | Secrets. The schema is `src/env.ts` |

## 3. Server boundary

Copy the `health` domain when you add a feature.

```text
src/app/actions/<domain>/input.ts      Zod schemas
src/app/actions/<domain>/queries.ts    reads for Server Components
src/app/actions/<domain>/actions.ts    mutations and cache revalidation
src/repositories/<domain>.ts           Drizzle
src/app/(public|private)/api/<domain>/route.ts
```

- App UI calls Server Actions.
- `queries.ts` handles reads.
- `actions.ts` handles mutations. Mark the file with `"use server"`.
- `app/api/**/route.ts` is for HTTP callers.
- Drizzle stays in repositories.
- The health repository does not query Postgres. The first repository that
  reads or writes a table imports `@/lib/db`.

## 4. Drizzle

- **Schema** — `src/db/schema.ts` is the source of truth. Edit it, then generate a migration.
- **Client** — `src/lib/db.ts` uses `pg` `Pool` and `drizzle-orm/node-postgres`. Pass `{ schema }` into `drizzle` once `src/db/schema.ts` exports tables. Repositories import the client. Pages, actions, and client components do not.
- **Repositories** — one file per domain. Route Handlers go through repositories.
- **Transactions** — repositories open a transaction when one write must cover several tables.
- **Migrations** — `drizzle:generate` creates SQL. `drizzle:check` validates history. Applying SQL needs an explicit user request. The Vercel build does not migrate.

## 5. Env (`src/env.ts`)

t3-env (`@t3-oss/env-nextjs`) plus Zod.

- `DATABASE_URL` is required. `STORAGE_DRIVER` is `local` or `s3`.
- `next.config.ts` imports `./src/env`, so a Vercel build fails when the env is invalid.
- `SKIP_ENV_VALIDATION=true` is not used on Vercel.
- Keep `.env.sample` in sync with `src/env.ts`.

## 6. Zod at the boundary

This is required. See [`PRACTICES.md`](./PRACTICES.md).

1. Put schemas in `src/app/actions/<domain>/input.ts`.
2. `actions.ts` calls `safeParse` before writes or repository calls.
3. `queries.ts` calls `safeParse` on user-controlled params before repository calls.
4. Route Handlers parse JSON, params, query strings, and form data.
5. Do not call a repository before parsing.
6. Use `z.infer<typeof schema>` for a shared type when that helps.

`GET /api/health` parses the query string with `healthQueryInput` and then
calls `getHealth`. Invalid input returns 400.

JSON routes call `parseJsonBody` first. A body that is not JSON returns 400.
The parsed value is still `unknown` until Zod accepts it.

## 7. New feature checklist

1. Put route files in the right `app/` segment.
2. Add `input.ts` Zod schemas for new inputs.
3. Keep reads and writes in `queries.ts` and `actions.ts`.
4. Keep Drizzle in repositories.
5. Parse input and check auth before database work.
6. Add focused tests for non-trivial logic.

Scripts, versions, and local Postgres: [`CODE_TECH_STACK.md`](./CODE_TECH_STACK.md).
