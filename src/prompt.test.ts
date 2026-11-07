import { expect, test } from "vitest";

import { createNextAppArgs, installLatestArgs, installPlan } from "./create-next.mjs";
import { fillProjectDetails } from "./overlay.mjs";
import { collectProjectAnswers } from "./prompt.mjs";

test("asks for a project name and description", async () => {
  const prompts = [];
  const result = await collectProjectAnswers({
    argv: ["node", "project-initiator"],
    isTTY: true,
    question: async (prompt) => {
      prompts.push(prompt);
      if (prompt.startsWith("Project name")) return "my-app";
      return "Team photos";
    },
    warn: () => {},
  });

  expect(prompts).toEqual(["Project name: ", "Description: "]);
  expect(result).toEqual({ name: "my-app", description: "Team photos" });
});

test("asks again when the name is not a single segment", async () => {
  const answers = ["bad name", "my-app", "A starter"];
  const result = await collectProjectAnswers({
    argv: ["node", "project-initiator"],
    isTTY: true,
    question: async () => answers.shift() ?? "",
    warn: () => {},
  });
  expect(result).toEqual({ name: "my-app", description: "A starter" });
});

test("uses typed answers as defaults when enter is pressed", async () => {
  const result = await collectProjectAnswers({
    argv: ["node", "project-initiator", "from-arg", "--description", "From the flag"],
    isTTY: true,
    question: async () => "",
    warn: () => {},
  });
  expect(result).toEqual({ name: "from-arg", description: "From the flag" });
});

test("non-interactive runs take the name and description from arguments", async () => {
  const result = await collectProjectAnswers({
    argv: ["node", "project-initiator", "my-app", "--description", "Hello"],
    isTTY: false,
    question: async () => {
      throw new Error("should not prompt");
    },
    warn: () => {},
  });
  expect(result).toEqual({ name: "my-app", description: "Hello" });
});

test("installs create-next-app and every added library at latest", () => {
  expect(createNextAppArgs("my-app")).toContain("create-next-app@latest");
  const plan = installPlan({
    dependencies: ["zod", "drizzle-orm"],
    devDependencies: ["vitest"],
  });
  expect(installLatestArgs(plan.dependencies)).toEqual([
    "install",
    "next@latest",
    "react@latest",
    "react-dom@latest",
    "zod@latest",
    "drizzle-orm@latest",
  ]);
  expect(installLatestArgs(plan.devDependencies, { dev: true })).toEqual([
    "install",
    "--save-dev",
    "eslint-config-next@latest",
    "vitest@latest",
  ]);
});

test("writes the name and description into the project text", () => {
  expect(fillProjectDetails("# {{name}}\n\n{{description}}\n", { name: "my-app", description: "Hello" })).toBe(
    "# my-app\n\nHello\n",
  );
});
