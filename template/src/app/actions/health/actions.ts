"use server";

import { readHealth } from "@/repositories/health";

import { healthQueryInput } from "./input";

export async function recordHealth(input: unknown) {
  const parsed = healthQueryInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Validation failed" as const };
  }
  const record = await readHealth(parsed.data);
  return { ok: true as const, status: record.status, echo: record.echo };
}
