import path from "node:path";

import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "package",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        resolve: {
          alias: {
            "@": path.join(root, "template/src"),
            "server-only": path.join(root, "template/src/test-utils/empty-module.ts"),
          },
        },
        test: {
          name: "template",
          environment: "node",
          include: ["template/src/**/*.test.ts"],
        },
      },
    ],
  },
});
