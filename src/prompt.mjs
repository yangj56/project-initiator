import readline from "node:readline/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";

export function validateAppName(name) {
  if (!name || name !== path.basename(name) || name === "." || name === "..") {
    return "Enter a single directory name, for example my-app.";
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)) {
    return "Use a name that starts with a letter or number and contains only letters, numbers, dots, underscores, or hyphens.";
  }
  return null;
}

export function readArgs(argv) {
  const args = argv.slice(2);
  const positional = [];
  let description;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--description") {
      description = args[index + 1] ?? "";
      index += 1;
      continue;
    }
    positional.push(args[index]);
  }
  return { name: positional[0], description };
}

export async function collectProjectAnswers({ argv, isTTY, question, warn }) {
  const parsed = readArgs(argv);
  let name = parsed.name;
  let description = parsed.description ?? "";

  if (!isTTY) {
    const problem = validateAppName(name);
    if (problem) throw new Error(`${problem}\nUsage: project-initiator [name] [--description text]`);
    return { name, description };
  }

  for (;;) {
    const hint = name ? ` (${name})` : "";
    const entered = (await question(`Project name${hint}: `)).trim();
    const candidate = entered || name;
    const problem = validateAppName(candidate);
    if (!problem) {
      name = candidate;
      break;
    }
    warn(problem);
    name = undefined;
  }

  const descriptionHint = description ? ` (${description})` : "";
  const enteredDescription = (await question(`Description${descriptionHint}: `)).trim();
  if (enteredDescription) description = enteredDescription;
  return { name, description };
}

export async function promptOnTerminal(argv) {
  const rl = readline.createInterface({ input, output });
  try {
    return await collectProjectAnswers({
      argv,
      isTTY: Boolean(input.isTTY),
      question: (text) => rl.question(text),
      warn: (message) => output.write(`${message}\n`),
    });
  } finally {
    rl.close();
  }
}
