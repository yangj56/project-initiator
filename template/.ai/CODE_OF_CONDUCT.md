# Code Style

Use this for TypeScript, UI, naming, and tests. Repo structure lives in
[`PRACTICES.md`](./PRACTICES.md).

## Principles

- Readable over clever
- No `any` unless justified
- One job per function or component
- Never trust client input
- Follow conventions, not preference

## TypeScript

- `strict` mode
- Prefer `type` over `interface` unless you are extending
- Discriminated unions for state
- Type inputs and outputs

Avoid `any`, un-narrowed `unknown`, and unnecessary `as`.

## UI

- Tailwind utilities. Use `cn()` for conditional classes.
- `src/components/ui/` is shadcn. Compose those files. Do not edit them.
- Prefer server data loading over `useEffect`.
- `React.memo` only after profiling.

## Testing

- Unit-test core logic and data helpers.
- Do not couple tests to implementation details.
- `npm run check` before finishing.

## Naming

| Type | Convention |
| --- | --- |
| Variables | camelCase |
| Types and components | PascalCase |
| Files | kebab-case |
| Constants | UPPER_CASE |

## Anti-patterns

- Business logic in large presentational components
- Database access or secrets in client bundles
- `any` to move fast
- Copy-pasted domain logic
- Hardcoded values that belong in config

## Tooling

ESLint 9 and Prettier. Husky and lint-staged run on the user's commit.
