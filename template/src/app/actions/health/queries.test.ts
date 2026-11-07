import { beforeEach, expect, test, vi } from "vitest";

vi.mock("@/repositories/health", () => ({
  readHealth: vi.fn(),
}));

import { readHealth } from "@/repositories/health";

import { healthQueryInput } from "./input";
import { getHealth } from "./queries";

beforeEach(() => {
  vi.mocked(readHealth).mockReset();
});

test("accepts a short echo", () => {
  expect(healthQueryInput.safeParse({ echo: "hi" }).success).toBe(true);
});

test("rejects an echo over 80 characters", () => {
  expect(healthQueryInput.safeParse({ echo: "a".repeat(81) }).success).toBe(false);
});

test("returns a validation error without calling the repository", async () => {
  const result = await getHealth({ echo: "a".repeat(81) });
  expect(result).toEqual({ ok: false, error: "Validation failed" });
  expect(readHealth).not.toHaveBeenCalled();
});
