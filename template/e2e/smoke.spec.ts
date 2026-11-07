import { expect, test } from "@playwright/test";

test("home page responds", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBe(true);
});

test("health endpoint responds", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toMatchObject({ status: "ok" });
});
