#!/usr/bin/env node

const DENY_TEXT =
  "Commit and push are reserved for the user. Do not retry with another git command, a script, or an MCP git tool.";

const host = process.argv[2] === "claude" || process.argv[2] === "codex" ? process.argv[2] : "cursor";

function deny() {
  if (host === "cursor") {
    process.stdout.write(
      `${JSON.stringify({
        permission: "deny",
        user_message: DENY_TEXT,
        agent_message: DENY_TEXT,
      })}\n`,
    );
    return;
  }
  process.stdout.write(
    `${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: DENY_TEXT,
      },
    })}\n`,
  );
}

function allow() {
  if (host === "cursor") {
    process.stdout.write(`${JSON.stringify({ permission: "allow" })}\n`);
  }
}

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on("data", (chunk) => chunks.push(chunk));
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    process.stdin.on("error", reject);
  });
}

function toolNameFrom(payload) {
  const direct = [payload.tool_name, payload.toolName, payload.mcp_tool, payload.tool, payload.name];
  for (const value of direct) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  const input = payload.tool_input;
  if (input && typeof input === "object") {
    const nested = [input.name, input.tool, input.tool_name, input.toolName];
    for (const value of nested) {
      if (typeof value === "string" && value.length > 0) return value;
    }
  }
  return null;
}

function commandFrom(payload) {
  if (typeof payload.command === "string") return payload.command;
  const input = payload.tool_input;
  if (input && typeof input === "object" && typeof input.command === "string") {
    return input.command;
  }
  return null;
}

function isBlockedTool(name) {
  return /git[_-]commit/i.test(name) || /git[_-]push/i.test(name);
}

function findClosingParen(input, start) {
  let depth = 1;
  let quote = null;
  for (let i = start; i < input.length; i += 1) {
    const char = input[i];
    if (quote) {
      if (char === quote && input[i - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return input.length;
}

function extractSubstitutions(input) {
  const subs = [];
  let text = "";
  let quote = null;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quote) {
      text += char;
      if (char === quote && input[i - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      text += char;
      continue;
    }
    if (char === "`") {
      const end = input.indexOf("`", i + 1);
      const close = end === -1 ? input.length : end;
      subs.push(input.slice(i + 1, close));
      text += " ";
      i = close;
      continue;
    }
    if (char === "$" && input[i + 1] === "(") {
      const close = findClosingParen(input, i + 2);
      subs.push(input.slice(i + 2, close));
      text += " ";
      i = close;
      continue;
    }
    text += char;
  }
  return { text, subs };
}

function splitSegments(input) {
  const parts = [];
  let current = "";
  let quote = null;
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quote) {
      current += char;
      if (char === quote && input[i - 1] !== "\\") quote = null;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      current += char;
      continue;
    }
    if (char === "\n" || char === ";") {
      parts.push(current);
      current = "";
      continue;
    }
    if ((char === "&" && input[i + 1] === "&") || (char === "|" && input[i + 1] === "|")) {
      parts.push(current);
      current = "";
      i += 1;
      continue;
    }
    if (char === "|") {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

function tokenize(segment) {
  const tokens = [];
  let current = "";
  let quote = null;
  for (let i = 0; i < segment.length; i += 1) {
    const char = segment[i];
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }
    if (/\s/.test(char)) {
      if (current) tokens.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current) tokens.push(current);
  return tokens;
}

function isEnvAssign(token) {
  return /^[A-Za-z_][A-Za-z0-9_]*=/.test(token);
}

function baseName(token) {
  const parts = token.split(/[/\\]/);
  return parts[parts.length - 1] ?? token;
}

function isGitWrite(segment) {
  const tokens = tokenize(segment);
  let index = 0;
  while (index < tokens.length && isEnvAssign(tokens[index])) index += 1;
  while (index < tokens.length && (tokens[index] === "command" || tokens[index] === "exec")) {
    index += 1;
  }
  if (index < tokens.length && tokens[index] === "env") {
    index += 1;
    while (index < tokens.length && (isEnvAssign(tokens[index]) || tokens[index].startsWith("-"))) {
      index += 1;
    }
  }
  if (index >= tokens.length || baseName(tokens[index]) !== "git") return false;
  index += 1;
  while (index < tokens.length) {
    const token = tokens[index];
    if (token === "--") {
      index += 1;
      break;
    }
    if (token === "-C" || token === "-c" || token === "--git-dir" || token === "--work-tree" || token === "--namespace") {
      index += 2;
      continue;
    }
    if (
      token.startsWith("--git-dir=") ||
      token.startsWith("--work-tree=") ||
      token.startsWith("--namespace=") ||
      token.startsWith("-c") ||
      token.startsWith("-")
    ) {
      index += 1;
      continue;
    }
    break;
  }
  return tokens[index] === "commit" || tokens[index] === "push";
}

function commandIsBlocked(command) {
  const { text, subs } = extractSubstitutions(command);
  if (subs.some((sub) => commandIsBlocked(sub))) return true;
  return splitSegments(text).some((segment) => isGitWrite(segment));
}

function shouldDeny(payload) {
  const tool = toolNameFrom(payload);
  const command = commandFrom(payload);
  if (tool && isBlockedTool(tool)) return true;
  if (command == null) {
    if (tool) return false;
    throw new Error("missing command");
  }
  return commandIsBlocked(command);
}

try {
  const raw = await readStdin();
  const payload = JSON.parse(raw);
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("payload");
  }
  if (shouldDeny(payload)) deny();
  else allow();
} catch {
  deny();
}
