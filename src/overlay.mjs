import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SKIP_ALWAYS = new Set(["package.overlay.json"]);
const SKIP_IF_EXISTS = new Set([
  "src/app/globals.css",
  "src/lib/utils.ts",
  "components.json",
]);

async function exists(file) {
  try {
    await readFile(file);
    return true;
  } catch {
    return false;
  }
}

async function copyTree(from, to, templateRoot) {
  const entries = await readdir(from, { withFileTypes: true });
  await mkdir(to, { recursive: true });
  for (const entry of entries) {
    const source = path.join(from, entry.name);
    const relative = path.relative(templateRoot, source);
    if (SKIP_ALWAYS.has(relative)) continue;
    const destination = path.join(to, entry.name);
    if (entry.isDirectory()) {
      await copyTree(source, destination, templateRoot);
      continue;
    }
    if (SKIP_IF_EXISTS.has(relative) && (await exists(destination))) continue;
    await copyFile(source, destination);
  }
}

export async function applyOverlay(appDir, templateDir) {
  await copyTree(templateDir, appDir, templateDir);
}

export function patchNextConfig(source) {
  if (source.includes('"./src/env"') || source.includes("'./src/env'")) return source;
  return `import "./src/env";\n${source}`;
}

export function appendDataGitignore(source) {
  const lines = source.split("\n").map((line) => line.trim());
  if (lines.includes(".data/")) return source;
  const suffix = source.endsWith("\n") || source.length === 0 ? "" : "\n";
  return `${source}${suffix}.data/\n`;
}

export async function patchTextFile(file, transform) {
  const source = await readFile(file, "utf8");
  await writeFile(file, transform(source));
}

export function fillProjectDetails(source, { name, description }) {
  return source.replaceAll("{{name}}", name).replaceAll("{{description}}", description ?? "");
}

export async function writeProjectDetails(appDir, details) {
  for (const file of ["README.md", "project.md"]) {
    await patchTextFile(path.join(appDir, file), (source) => fillProjectDetails(source, details));
  }
}
