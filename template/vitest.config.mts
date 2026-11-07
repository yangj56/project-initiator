import path from "node:path";

import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(root, "src"),
      "server-only": path.join(root, "src/test-utils/empty-module.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});