import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "vitest";

import { mergePackage } from "./merge-package.mjs";
import { appendDataGitignore, patchNextConfig } from "./overlay.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("keeps create-next-app scripts and Next.js version", () => {
  const overlay = JSON.parse(
    readFileSync(path.join(root, "template/package.overlay.json"), "utf8"),
  );
  const merged = mergePackage(
    {
      dependencies: { next: "16.4.2", react: "19.3.1", "react-dom": "19.3.1" },
      scripts: { dev: "next dev", build: "next build", start: "next start", lint: "eslint" },
    },
    overlay,
    { name: "my-app", description: "A starter app" },
  );

  expect(merged.dependencies.next).toBe("16.4.2");
  expect(merged.scripts.dev).toBe("next dev");
  expect(merged.scripts.build).toBe("next build");
  expect(merged.scripts.start).toBe("next start");
  expect(merged.scripts.lint).toBe("eslint");
  expect(merged.scripts.check).toContain("typecheck");
  expect(merged.scripts["db:local"]).toContain("docker compose");
  expect(merged.scripts["drizzle:generate"]).toContain("drizzle-kit");
  expect(merged.engines.node).toBe(">=24");
  expect(merged.dependencies["drizzle-orm"]).toBeUndefined();
  expect(merged.name).toBe("my-app");
  expect(merged.description).toBe("A starter app");
  expect(Array.isArray(overlay.dependencies)).toBe(true);
  for (const packageName of [...overlay.dependencies, ...overlay.devDependencies]) {
    expect(packageName).not.toMatch(/[\^~]|@latest|\d+\.\d+/);
  }
});

test("patches next config once", () => {
  const source = 'import type { NextConfig } from "next";\nconst nextConfig: NextConfig = {};\nexport default nextConfig;\n';
  const patched = patchNextConfig(source);
  expect(patched.startsWith('import "./src/env";\n')).toBe(true);
  expect(patchNextConfig(patched)).toBe(patched);
});

test("appends .data/ to gitignore once", () => {
  const once = appendDataGitignore("node_modules\n");
  expect(once).toBe("node_modules\n.data/\n");
  expect(appendDataGitignore(once)).toBe(once);
});
