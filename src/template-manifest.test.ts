import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "vitest";

import { validateAppName } from "./cli.mjs";

const template = path.join(path.dirname(fileURLToPath(import.meta.url)), "../template");

const required = [
  ".ai/AGENTS.md",
  ".ai/PRACTICES.md",
  ".ai/CODE_NEXTJS.md",
  ".ai/CODE_OF_CONDUCT.md",
  ".ai/NEVER_DO.md",
  ".ai/SECURITY.md",
  ".ai/DOCUMENTATION.md",
  ".ai/CODE_TECH_STACK.md",
  "src/app/actions/health/input.ts",
  "src/app/actions/health/queries.ts",
  "src/app/actions/health/actions.ts",
  "src/app/actions/health/queries.test.ts",
  "src/app/(public)/api/health/route.ts",
  "src/repositories/health.ts",
  "src/env.ts",
  "src/lib/db.ts",
  "src/db/schema.ts",
  "docker-compose.yml",
  "playwright.config.ts",
  "perf/k6/smoke.js",
  ".cursor/hooks.json",
  ".claude/settings.json",
  ".codex/hooks.json",
  "scripts/agent-git-guard.mjs",
];

test("template contains the overlay files", async () => {
  await Promise.all(required.map((file) => access(path.join(template, file))));
  expect(required.length).toBeGreaterThan(0);
});

test("app names are a single safe segment", () => {
  expect(validateAppName("my-app")).toBeNull();
  expect(validateAppName(".")).toBeTruthy();
  expect(validateAppName("..")).toBeTruthy();
  expect(validateAppName("nested/app")).toBeTruthy();
  expect(validateAppName(undefined)).toBeTruthy();
});
