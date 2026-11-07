# Practices

Keep these rules. They matter more than personal style.

## Folder structure

```text
src/
├── app/
│   ├── (private)/
│   │   └── ...
│   ├── (public)/
│   │   └── ...
│   ├── actions/<domain>/
│   │   ├── input.ts
│   │   ├── queries.ts
│   │   └── actions.ts
│   └── .../_components/
├── components/
│   ├── ui/
│   └── common/
├── db/
├── lib/
└── repositories/
```

- Route UI: `src/app/**`
- Protected UI and API routes: `src/app/(private)/**`
- Public UI and API routes: `src/app/(public)/**`
- Route groups do not change the URL. Keep URL segments inside the group.
- Server Actions are not routes. Keep them in `src/app/actions/<domain>/`.
- Route-local components: `src/app/**/_components/`
- Keep a component route-local when only that route uses it.
- Move a component to `src/components/` when more than one route area uses it.
- Shared composed UI: `src/components/common/`
- Generated shadcn UI: `src/components/ui/`. Do not edit those files.
- Schema: `src/db/schema.ts`
- Drizzle queries: `src/repositories/`
- Do not add a parallel `server/` folder.

The starter ships `health` under `(public)/api/health` and
`src/app/actions/health/`. Add `(private)/` with the first protected route.

## API routes

Create a Route Handler only when the app needs an HTTP endpoint. Normal UI
reads and writes use Server Actions in `src/app/actions/<domain>/`.

- Put APIs in `src/app/(public)/api/**` when they are reachable without an
  app session: public file reads, upload handshakes, or webhooks.
- Put APIs in `src/app/(private)/api/**` when they require a signed-in session
  before doing useful work.
- Split mixed access by endpoint.
- Route Handlers validate all input with Zod and re-check authorization
  before repository calls.

## Upload safety

Treat browser-provided filenames, content types, sizes, and storage keys as
untrusted.

- Validate the requested content type and size with Zod before issuing a
  presigned URL or saving a local file.
- Generate storage keys on the server. Never accept a caller-chosen key unless
  it matches the expected scope prefix exactly.
- Local uploads must check the byte count and sniff the bytes before writing.
- Remote uploads must `peek` the stored object and verify the bytes match the
  registered MIME type before inserting a row.
- If a remote object fails that check, remove it and do not create the row.
- Keep upload validation in shared helpers so local and S3 paths use the same
  rules.

`src/lib/storage/` exposes `presignPut`, `presignGet`, `peek`, `read`, and
`remove`. Local writes use `writeLocalObject`. S3 browser uploads use
`presignPut`.

## Data flow

```text
UI -> app/actions/<domain>/queries.ts or actions.ts -> repositories -> db
HTTP route -> Zod -> repositories -> db
```

- Pages, layouts, and client components never import `src/repositories/` or `@/lib/db`.
- Server Actions never import `@/lib/db`.
- Route Handlers may call repositories only after validation.
- Repositories import `server-only` and own Drizzle.

## Zod input validation

All external input is parsed before database access or side effects.

- Put schemas in `src/app/actions/<domain>/input.ts`.
- `actions.ts`: parse every input with Zod before writes, uploads, cache
  invalidation, or repository calls.
- `queries.ts`: parse user-controlled input with Zod before repository calls.
- `src/app/(private|public)/api/**/route.ts`: parse params, query strings,
  JSON, and form data with Zod.
- Reuse `input.ts` schemas when Actions and Route Handlers share a shape.
- Use `z.infer<typeof schema>` when a shared type is useful.
- `src/env.ts` is only for environment variables.
- `parseJsonBody` in `src/lib/api-utils.ts` rejects a body that is not JSON
  with status 400. The handler still parses the resulting value with Zod.

A failed `safeParse` returns `{ ok: false, error: "Validation failed" }` from
an action or query, and status 400 from a Route Handler.

## Auth and authorization

- This starter does not ship a session implementation.
- When a route is protected, re-check the session inside the Action or Route
  Handler, after parsing and before the repository call.
- UI visibility is not authorization.
- Validate client IDs, load the record on the server, then check ownership.

## Database changes

- Change the schema in `src/db/schema.ts`.
- Generate with `npm run drizzle:generate`.
- Check with `npm run drizzle:check`.
- Do not hand-edit a migration that has already been applied.
- Do not run database-mutating commands unless the user asks for that command.
  See [`NEVER_DO.md`](./NEVER_DO.md).

## Git and PRs

Git history is user-controlled.

- Do not `git add`, commit, push, force-push, merge, rebase, or tag.
- Commit and push stay prohibited even when the prompt asks the agent to do
  them. The user runs those commands.
- Hooks enforce the commit and push ban for Cursor, Claude Code, and Codex.
- Keep pull requests small.
- UI changes need a description and screenshots.
- `npm run check` must pass before handoff.

## Feature workflow

For a behavior change:

1. Read [`../project.md`](../project.md).
2. Read the matching route, action, and repository files.
3. Add or update `input.ts` for new input shapes.
4. Keep business rules out of large presentational components.
5. Add focused tests for non-trivial logic.
6. Run focused checks, then `npm run check` when appropriate.
