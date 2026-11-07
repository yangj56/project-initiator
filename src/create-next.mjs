import { spawnSync } from "node:child_process";

export const FRAMEWORK_PACKAGES = ["next", "react", "react-dom"];
export const FRAMEWORK_DEV_PACKAGES = ["eslint-config-next"];

export function createNextAppArgs(name) {
  return [
    "--yes",
    "create-next-app@latest",
    name,
    "--yes",
    "--ts",
    "--tailwind",
    "--eslint",
    "--app",
    "--src-dir",
    "--import-alias",
    "@/*",
    "--use-npm",
    "--agents-md",
    "--no-agent-feedback",
    "--skip-install",
    "--disable-git",
  ];
}

export function shadcnInitArgs(appDir) {
  return [
    "--yes",
    "shadcn@latest",
    "init",
    "--defaults",
    "--no-monorepo",
    "--cwd",
    appDir,
  ];
}

function unique(items) {
  return [...new Set(items)];
}

export function installPlan(overlay) {
  return {
    dependencies: unique([...FRAMEWORK_PACKAGES, ...(overlay.dependencies ?? [])]),
    devDependencies: unique([...FRAMEWORK_DEV_PACKAGES, ...(overlay.devDependencies ?? [])]),
  };
}

export function installLatestArgs(names, { dev = false } = {}) {
  const args = ["install"];
  if (dev) args.push("--save-dev");
  args.push(...names.map((name) => `${name}@latest`));
  return args;
}

export function runInherited(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}
