import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

const script = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../template/scripts/agent-git-guard.mjs",
);

function run(host: string, payload: unknown) {
  const input = typeof payload === "string" ? payload : JSON.stringify(payload);
  return spawnSync(process.execPath, [script, host], {
    input,
    encoding: "utf8",
  });
}

function decision(host: string, payload: unknown) {
  const result = run(host, payload);
  expect(result.status).toBe(0);
  const stdout = result.stdout.trim();
  if (!stdout) return { denied: false };
  const body = JSON.parse(stdout) as {
    permission?: string;
    hookSpecificOutput?: { permissionDecision?: string };
  };
  const denied =
    body.permission === "deny" || body.hookSpecificOutput?.permissionDecision === "deny";
  return { denied, body };
}

const hosts = ["cursor", "claude", "codex"] as const;

describe.each(hosts)("%s git guard", (host) => {
  const shell = (command: string) =>
    host === "cursor"
      ? { command }
      : { tool_name: "Bash", tool_input: { command } };

  test("denies git commit and git push", () => {
    for (const command of [
      "git commit",
      "git commit --amend",
      "git push",
      "git push --force",
      "npm test && git push",
      "echo $(git commit -m x)",
      "git -C /tmp commit -m x",
      "/usr/bin/git push origin main",
    ]) {
      expect(decision(host, shell(command)).denied, command).toBe(true);
    }
  });

  test("allows status, diff, and add", () => {
    for (const command of ["git status", "git diff", "git add .", 'echo "git commit"']) {
      expect(decision(host, shell(command)).denied, command).toBe(false);
    }
  });

  test("denies invalid JSON", () => {
    expect(decision(host, "{").denied).toBe(true);
  });

  test("denies git commit and push MCP tools", () => {
    expect(decision(host, { tool_name: "git_commit" }).denied).toBe(true);
    expect(decision(host, { tool_name: "mcp__gitlens__git_push" }).denied).toBe(true);
  });
});

test("cursor allow payload is permission allow", () => {
  const result = decision("cursor", { command: "git status" });
  expect(result.denied).toBe(false);
  expect(result.body).toEqual({ permission: "allow" });
});

test("claude allow prints no denial", () => {
  const result = run("claude", {
    tool_name: "Bash",
    tool_input: { command: "git status" },
  });
  expect(result.status).toBe(0);
  expect(result.stdout.trim()).toBe("");
});
