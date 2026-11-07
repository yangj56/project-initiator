const KEEP_SCRIPTS = new Set(["dev", "build", "start", "lint"]);

export function mergePackage(base, overlay, details = {}) {
  const scripts = { ...(base.scripts ?? {}) };
  for (const [name, command] of Object.entries(overlay.scripts ?? {})) {
    if (KEEP_SCRIPTS.has(name)) continue;
    scripts[name] = command;
  }

  return {
    ...base,
    name: details.name || base.name,
    description: details.description ?? base.description ?? "",
    scripts,
    dependencies: { ...(base.dependencies ?? {}) },
    devDependencies: { ...(base.devDependencies ?? {}) },
    engines: { ...(base.engines ?? {}), node: ">=24" },
    "lint-staged": overlay["lint-staged"] ?? base["lint-staged"],
  };
}
