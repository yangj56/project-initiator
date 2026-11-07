#!/usr/bin/env node

import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createNextAppArgs, installLatestArgs, installPlan, runInherited, shadcnInitArgs } from "./create-next.mjs";
import { mergePackage } from "./merge-package.mjs";
import { appendDataGitignore, applyOverlay, patchNextConfig, patchTextFile, writeProjectDetails } from "./overlay.mjs";
import { promptOnTerminal, validateAppName } from "./prompt.mjs";

export { validateAppName };

const LOCAL_ENV = `DATABASE_URL=postgresql://postgres:postgres@localhost:5435/app
STORAGE_DRIVER=local
`;

function fail(step, message) {
  console.error(`\n${step} failed.`);
  if (message) console.error(message);
  process.exit(1);
}

async function main() {
  let answers;
  try {
    answers = await promptOnTerminal(process.argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
  const { name, description } = answers;

  const cwd = process.cwd();
  const appDir = path.join(cwd, name);
  if (existsSync(appDir) && readdirSync(appDir).length > 0) {
    console.error(`Directory ${name} already exists and is not empty.`);
    process.exit(1);
  }

  const templateDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../template");
  const created = runInherited("npx", createNextAppArgs(name), cwd);
  if (created !== 0) fail("create-next-app");

  const shadcn = runInherited("npx", shadcnInitArgs(appDir), cwd);
  if (shadcn !== 0) fail("shadcn init", `The app is at ${appDir}.`);

  let overlay;
  try {
    await applyOverlay(appDir, templateDir);
    await patchTextFile(path.join(appDir, "next.config.ts"), patchNextConfig);
    await patchTextFile(path.join(appDir, ".gitignore"), appendDataGitignore);
    const basePackage = JSON.parse(await readFile(path.join(appDir, "package.json"), "utf8"));
    overlay = JSON.parse(await readFile(path.join(templateDir, "package.overlay.json"), "utf8"));
    await writeFile(
      path.join(appDir, "package.json"),
      `${JSON.stringify(mergePackage(basePackage, overlay, { name, description }), null, 2)}\n`,
    );
    await writeProjectDetails(appDir, { name, description });
    await writeFile(path.join(appDir, ".env.local"), LOCAL_ENV);
    await mkdir(path.join(appDir, ".data"), { recursive: true });
  } catch (error) {
    fail("overlay", error instanceof Error ? error.message : String(error));
  }

  const git = runInherited("git", ["init"], appDir);
  if (git !== 0) {
    console.error("git init failed. npm install will continue.");
  }

  const plan = installPlan(overlay);
  const installed = runInherited("npm", installLatestArgs(plan.dependencies), appDir);
  if (installed !== 0) fail("npm install", `The app is at ${appDir}.`);
  const devInstalled = runInherited("npm", installLatestArgs(plan.devDependencies, { dev: true }), appDir);
  if (devInstalled !== 0) fail("npm install", `The app is at ${appDir}.`);

  console.log(`
Created ${name}.

1. cd ${name}
2. npm run db:local
3. npm run dev
4. Open http://localhost:3000 and http://localhost:3000/api/health

Vercel: push this repository yourself, import it with the Next.js preset, and
copy every variable from .env.sample. Use a pooled DATABASE_URL. Apply Drizzle
migrations yourself. Do not add them to the Vercel build command.

Codex: open /hooks and trust the project hook. Until you do, Codex will not
run the git guard. Cursor and Claude Code load it with the project.

Agents cannot git commit or git push in this app. You run those commands.
`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
