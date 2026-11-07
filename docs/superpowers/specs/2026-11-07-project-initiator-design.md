# project-initiator

Date: 2026-11-07

Status: Implemented. Not committed.

Size: Project

`project-initiator` is an npm package in this repository. Running it creates
a blank Next.js app on the Vercel path, then applies the stack and guardrails
from this photo-contest app. The photo-contest product is the reference. It is
not copied.

## Intent

A new app should start the way Vercel starts Next.js, then already contain the
structure this repo expects: App Router, Zod at every boundary, Drizzle,
Postgres, S3, Playwright, k6, `.ai` docs, and agent hooks. Agents from OpenAI
(Codex) and Claude must not commit or push. The person who owns the repo does
that.

## Goals

- `npx project-initiator <name>` creates the app.
- The Next.js app comes from official `create-next-app`, then an overlay.
- The generated app deploys on Vercel with the Next.js preset.
- Local Postgres is Docker. Production Postgres is `DATABASE_URL` on Vercel.
- File storage supports `local` and `s3`.
- `.ai` docs describe App Router, Server Actions, queries, and Zod-validated
  Route Handlers.
- A small `health` domain shows those folders in compiling code.
- Cursor, Claude Code, and Codex hooks deny `git commit` and `git push`.
- The human's own terminal git is outside those hooks.

## Non-goals

- Copying competitions, photos, auth, Strava, Turnstile, Azure, or Terraform.
- Logging into Vercel, linking a project, or deploying.
- Publishing this package to the npm registry during implementation.
- A product upload screen. The storage module is ready for a later route.
- A session implementation. The docs still require a server-side session check
  once a protected action exists.
- Running `create-next-app` inside the default unit-test command.

## Anti-goals

- A vendored Next.js tree that skips `create-next-app`.
- A git hook that blocks the human from committing or pushing.
- `SKIP_ENV_VALIDATION` on a Vercel build.
- Running database migrations inside the Vercel build command.
- An agent path that commits or pushes because a prompt asked it to.

## Constraints

- This repository becomes the package. The photo-contest application files are
  removed when the package is implemented, including the older contest specs.
  This spec stays, and `docs/superpowers/README.md` lists it. Git history
  stays. The agent does not commit.
- Node `>=24` for the package and the generated app.
- Package name `project-initiator`. Binary name `project-initiator`.
- Package manager for the generated app is npm.
- Next.js 16 App Router, React 19, TypeScript, Tailwind 4, shadcn `base-nova`.
- Drizzle uses `drizzle-orm/node-postgres` and `pg`, as `src/lib/db.ts` does
  in this repo.
- Local Postgres listens on host port `5435`. Database name `app`. User and
  password `postgres` / `postgres`. That URL is for local Docker only.
- k6 is a system binary. It is not an npm dependency.
- Codex project hooks run only after the user trusts them once with `/hooks`.

## Approaches

| Approach | Trade-off | Outcome |
| --- | --- | --- |
| `create-next-app`, then copy a maintained overlay | Official Vercel/Next startup. The CLI must merge `package.json` and patch `next.config.ts`. | **Chosen** |
| Copy a complete Next template and skip `create-next-app` | Deterministic, but the startup is ours to keep current. | Rejected |
| Add the stack only inside an app the user already created | Skips the required Next.js startup. | Rejected |

## Design

### CLI

The published CLI is plain ESM JavaScript. `npx` runs it with `node`. There is
no compile step on the user's machine. The package `files` list includes the
CLI and `template/`. `private` is unset so the package can be published later.
Implementation does not run `npm publish`.

Usage:

```text
npx project-initiator <name>
```

`<name>` is a single path segment. `.` and `..` are rejected. It is the
directory name and the Next.js project name. The CLI does not prompt.

Steps, in order:

1. Refuse to continue when `<name>` is missing, or when that directory exists
   and is not empty. Create nothing in that case.
2. Run `create-next-app` non-interactively. The builder reads that version's
   `--help` and selects the flags that produce TypeScript, the App Router,
   Tailwind, ESLint, `src/`, the import alias `@/*`, and npm. Use the
   `create-next-app` major that matches Next.js 16.
3. Run `shadcn` init non-interactively. The builder reads `--help` and selects
   the flags that produce style `base-nova`, RSC, TypeScript, base color
   `neutral`, CSS variables, Lucide, and `src/app/globals.css`. Aliases match
   this repo's `components.json`.
4. Copy `template/` into the app. Do not overwrite `src/app/globals.css` or
   `src/lib/utils.ts` when shadcn wrote them.
5. Merge `package.json`. Keep the `create-next-app` versions of `next`,
   `react`, and `react-dom`. Keep its `dev`, `build`, `start`, and `lint`
   scripts. Add the overlay dependencies and scripts. Set `engines.node` to
   `>=24`.
6. Patch `next.config.ts` so it imports `./src/env` when that import is absent.
   Leave the rest of the generated config in place.
7. Append `.data/` to `.gitignore` when that entry is absent.
8. Write `.env.local` with the local `DATABASE_URL` and
   `STORAGE_DRIVER=local`. `.env.sample` already lists every variable.
9. `npm install` in the new app.
10. `git init` when `create-next-app` did not create a repository. Do not commit.
11. Print the next human steps: start Docker Postgres, run the app, and where
    to put the same env vars in Vercel.

If step 2 fails, stop before the overlay. If a later step fails, print the
step name and leave the directory in place.

Overlay dependencies:

- `drizzle-orm`, `pg`, `zod`, `@t3-oss/env-nextjs`, `@aws-sdk/client-s3`,
  `@aws-sdk/s3-request-presigner`, `server-only`
- dev: `drizzle-kit`, `@types/pg`, `dotenv`, `tsx`, `vitest`,
  `@playwright/test`, `prettier`, `eslint-config-prettier`, `husky`,
  `lint-staged`

shadcn init adds its own UI dependencies. The overlay does not pin those over
the versions shadcn installed.

Overlay scripts:

| Script | Purpose |
| --- | --- |
| `typecheck` | `tsc --noEmit` |
| `format` / `format:check` | Prettier |
| `check` | typecheck, lint, format check, Vitest |
| `test` | Vitest |
| `drizzle:generate` / `drizzle:check` / `drizzle:studio` | Drizzle Kit, config `drizzle.config.ts` |
| `db:local` | `docker compose up -d --wait` |
| `db:local:down` | `docker compose down` |
| `test:e2e` | Playwright |
| `perf` | k6 smoke script |

`dev` stays `next dev`. Postgres is started with `db:local`, not inside `dev`.

Husky `pre-commit` runs lint-staged. `pre-push` runs `format:check`. Those
hooks belong to the human git workflow. They are not the agent guard.

### Generated app layout

```text
src/app/(public)/api/health/route.ts
src/app/actions/health/input.ts
src/app/actions/health/queries.ts
src/app/actions/health/actions.ts
src/repositories/health.ts
src/lib/db.ts
src/lib/api-utils.ts
src/lib/storage/          local and s3 adapters
src/db/schema.ts          imports only, no tables
src/env.ts
drizzle.config.ts
docker-compose.yml
playwright.config.ts
e2e/smoke.spec.ts
perf/k6/smoke.js
.env.sample
.ai/                      guardrail docs
AGENTS.md
CLAUDE.md
project.md
.cursor/rules/engineering-docs.mdc
.cursor/hooks.json
.claude/settings.json
.codex/hooks.json
scripts/agent-git-guard.mjs
```

`create-next-app` owns the public home page. The overlay does not replace it.

`(private)/` is documented in `.ai/PRACTICES.md` and is created with the first
protected route. The starter does not add an empty private page.

### Health domain

`src/app/actions/health/input.ts` exports:

```ts
export const healthQueryInput = z.object({
  echo: z.string().trim().max(80).optional(),
});
```

`queries.ts` and `actions.ts` accept `unknown`, call `safeParse`, and call the
repository only after success. A failed parse returns
`{ ok: false, error: "Validation failed" }`.

`src/repositories/health.ts` imports `server-only`. It does not import
`@/lib/db`. It returns `{ status: "ok", echo }` from the parsed input.
`src/lib/db.ts` still exists, uses a `pg` `Pool` and
`drizzle-orm/node-postgres`, and reads `DATABASE_URL` from `src/env.ts`. The
first table's repository is the file that imports `@/lib/db`.

`GET /api/health` parses the query string with `healthQueryInput`. Invalid
input returns `400` and `{ error: "Validation failed" }`. Success returns
`200` and the repository result. `src/lib/api-utils.ts` exposes `parseJsonBody`
for later JSON routes. It returns `400` when the body is not JSON. The health
route does not use it.

The action takes the same `unknown` input and the same schema, so a later form
has a mutation path to copy. It does not write to the database.

### Data and storage

`src/db/schema.ts` has the Drizzle imports this repo uses and no tables. The
CLI does not generate a migration. `drizzle/` appears when a person adds a
table and runs `npm run drizzle:generate`.

`docker-compose.yml` runs `postgres:16-alpine` with the local credentials
above and a healthcheck.

`src/env.ts` uses `@t3-oss/env-nextjs` and Zod. Required: `DATABASE_URL`.
`STORAGE_DRIVER` is `local` or `s3`, default `local`. Optional:
`S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
`S3_ENDPOINT`, `S3_KEY_PREFIX`. `.env.sample` lists the same keys.
`next.config.ts` imports `./src/env`, so a Vercel build fails when
`DATABASE_URL` is missing.

The storage adapter matches this repo's methods, with drivers `local` and
`s3` only:

- `presignPut`, `presignGet`, `peek`, `read`, `remove`

Local files live under `.data/uploads`, which is gitignored. S3 uses the AWS
SDK. When `S3_ENDPOINT` is set, the client uses path-style addressing. The
adapter throws a clear error when `STORAGE_DRIVER=s3` and the bucket is
missing. Keys are chosen by server code that does not exist yet. The upload
rules in `.ai/PRACTICES.md` say how the first upload route must validate type
and size, generate the key, and `peek` the bytes before inserting a row.

### Vercel

The generated app has no `vercel.json`. Vercel detects Next.js.

The generated README tells the user to:

- Push the repository themselves, then import it in Vercel or run `npx vercel`.
- Set every variable from `.env.sample` on Production, Preview, and Development.
- Keep the framework preset on Next.js and the build command on `next build`.
- Use a pooled `DATABASE_URL`.
- Apply migrations themselves before production traffic. The build does not
  run Drizzle migrate or push.

`.ai/CODE_TECH_STACK.md` names Vercel as the host and Node 24 as the runtime.

### `.ai` docs

The template includes these files, rewritten from this repo with the contest
product, Azure, Strava, and Turnstile removed:

| File | Keeps |
| --- | --- |
| `AGENTS.md` | Read order and the must-keep rules |
| `PRACTICES.md` | Folder tree, public/private route groups, data flow, Zod, upload safety, git |
| `CODE_NEXTJS.md` | App Router, `proxy.ts`, server boundary, Drizzle, env, Zod checklist |
| `CODE_OF_CONDUCT.md` | TypeScript, UI, naming, tests |
| `NEVER_DO.md` | Boundary prohibitions, secrets, destructive commands, agent git |
| `SECURITY.md` | Validate at the boundary, authorize on the server, upload limits |
| `DOCUMENTATION.md` | Update `project.md` when behavior changes |
| `CODE_TECH_STACK.md` | Versions, scripts, Docker Postgres, Vercel |

Root `AGENTS.md` and `CLAUDE.md` point at `.ai/AGENTS.md`.
`.cursor/rules/engineering-docs.mdc` does the same.

Folder rules stay:

```text
page or route
  -> src/app/actions/<domain>/queries.ts or actions.ts
    -> src/repositories/<domain>.ts
      -> src/lib/db.ts
```

Route Handlers live in `src/app/(public)/api/**` or
`src/app/(private)/api/**`. They parse params, query strings, JSON, and form
data with a schema from `input.ts` before any repository call. Actions and
handlers that share a shape share that schema. Types come from
`z.infer<typeof schema>`.

`PRACTICES.md` states that protected Actions and Route Handlers re-check the
session in the same function, after parsing and before the repository call.
UI visibility is not authorization. The starter has no session code.

`project.md` is a one-page blank spec: the app name, the stack, and a note
that behavior changes are recorded there.

`NEVER_DO.md` tells agents not to `git add`, commit, push, merge, rebase, tag,
or force-push. Commit and push stay prohibited even when the prompt asks the
agent to do them. The user runs those commands. Database-mutating commands
stay prohibited unless the user asks for that exact command.

### Agent git guard

One script, `scripts/agent-git-guard.mjs`, reads JSON on stdin. The host is
the first argument: `cursor`, `claude`, or `codex`. It uses only Node.

Registrations:

| Host | File | Events |
| --- | --- | --- |
| Cursor | `.cursor/hooks.json` | `beforeShellExecution`, `beforeMCPExecution`, both `failClosed: true` |
| Claude Code | `.claude/settings.json` | `PreToolUse` matchers `Bash` and `mcp__` |
| Codex | `.codex/hooks.json` | `PreToolUse` matchers `Bash` and `mcp__`, timeout 10 seconds |

Cursor command: `node scripts/agent-git-guard.mjs cursor`.

Claude command uses `$CLAUDE_PROJECT_DIR` so the script resolves from the
project root.

Codex command resolves the script with `git rev-parse --show-toplevel`,
because a Codex session can start in a subdirectory. The README says to open
`/hooks` and trust the project hook. Until that trust exists, Codex skips it.

The script denies a shell command when any segment would run `git commit` or
`git push`. Segments split on `&&`, `||`, `;`, `|`, and newlines. The same
check applies inside `$()` and backticks. Leading environment assignments are
ignored. `git -C <path>` and `git -c <key>=<value>` still count. The
executable may be `git` or a path whose basename is `git`.

It denies an MCP call when the tool name contains `git_commit`, `git_push`,
`git-commit`, or `git-push`.

It allows other commands, including `git status`, `git diff`, `git log`,
`git add`, `git checkout`, `git branch`, `git fetch`, and `git pull`.

Deny text: commit and push are reserved for the user, and the agent should
not retry through another command, script, or MCP tool.

Output:

- Cursor returns `{ "permission": "deny", "user_message", "agent_message" }`.
  An allowed command returns `{ "permission": "allow" }`.
- Claude and Codex return `hookSpecificOutput` with `hookEventName`
  `PreToolUse`, `permissionDecision` `deny`, and `permissionDecisionReason`.
  An allowed command prints no denial.

On invalid JSON, a missing command, or any thrown error, the script catches
the error, prints that host's deny payload, and exits `0`. Codex treats an
uncaught crash as permission to continue, so the catch is required. Cursor
also sets `failClosed`, which blocks the tool if the process dies before
output.

The guard looks at the command string the agent submitted. It does not open
npm scripts to see whether they call git. The starter defines no script that
commits or pushes. `.ai/NEVER_DO.md` forbids adding one for an agent to run.

### Package repository layout

```text
package.json
src/cli.mjs
src/create-next.mjs
src/overlay.mjs
src/merge-package.mjs
template/                 the generated-app files listed above
src/merge-package.test.ts
src/agent-git-guard.test.ts
src/template-manifest.test.ts
README.md
```

The guard script shipped to new apps lives in `template/scripts/`. The test
runs that file.

## Left to the builder

- The exact `create-next-app` and `shadcn` flags, chosen from `--help` so the
  outcomes in this spec hold.
- The wording of the generated README, as long as it covers local Docker,
  env vars, Vercel, migrations, and Codex `/hooks` trust.
- How the `next.config.ts` patch detects an existing env import.

## Tests

Library `npm test` covers:

- The guard script, spawned with stdin, for `cursor`, `claude`, and `codex`.
  Deny `git commit`, `git commit --amend`, `git push`, `git push --force`,
  `npm test && git push`, and `echo $(git commit -m x)`.
  Allow `git status`, `git diff`, and `git add`.
  Deny invalid JSON.
  Deny an MCP payload whose tool name is `git_commit` or `git_push`.
- `merge-package` keeps `create-next-app` `dev` / `build` / `start` / `lint`
  and its Next.js version, and adds `check`, `db:local`, Drizzle, and
  `engines.node` `>=24`.
- The template manifest includes the `.ai` files, the health domain, the three
  hook configs, `src/env.ts`, `src/lib/db.ts`, `src/db/schema.ts`,
  `docker-compose.yml`, `playwright.config.ts`, and `perf/k6/smoke.js`.

The generated app includes:

- A Vitest test that `healthQueryInput` accepts a short `echo`, rejects a
  string over 80 characters, and that the query function returns the
  validation error without calling the repository.
- A Playwright smoke test for `/` and `/api/health` on `http://localhost:3000`,
  with `webServer` running `next dev`.
- `perf/k6/smoke.js` requesting `/`. `npm run check` does not run k6.

`npm test` for the library does not run `create-next-app`.
