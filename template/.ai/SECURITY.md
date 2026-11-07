# Security

Use this for security checks. Zod and auth practices live in
[`PRACTICES.md`](./PRACTICES.md).

## Invariants

- Validate at trust boundaries: HTTP, forms, webhooks, and uploads.
- Authorize on the server. Deny by default.
- Least privilege. Secrets stay out of code and logs.
- Fail securely. Error responses do not include internals.

## Checklist

- Zod schemas live in `input.ts` for Actions and shared API input.
- Server-side authorization per resource. Never trust a client ID or role.
- No secrets in client bundles, logs, or committed files.
- Drizzle query builder by default. Raw `sql` only with parameterized values.
- Sanitize user-generated rich text before rendering.
- Uploads need size and type limits and must not be served as executable content.
- Outbound user-controlled URLs need allowlists, timeouts, and size limits.
- `next.config.ts` imports `src/env`, so a missing `DATABASE_URL` fails the Vercel build.

## Threat-model prompts

For a sensitive feature, list assets, actors, entry points, abuse cases, and
controls.

## Agent changes

Auth, permissions, uploads, payments, and external fetches are
security-critical. When uncertain, tighten validation.
