import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "vitest";

const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), "cli.mjs");

test("runs when invoked through the npm bin symlink", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "project-initiator-"));
  const bin = path.join(dir, "project-initiator");
  symlinkSync(cli, bin);
  try {
    const result = spawnSync(process.execPath, [bin], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Usage: project-initiator");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
