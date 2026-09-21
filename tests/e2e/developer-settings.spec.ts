import { expect, test } from "@playwright/test";

const login = async (page: import("@playwright/test").Page, email: string, password: string) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
};

test("developer controls module access without locking themselves out", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("aio-locale", "en"); });
  await login(page, "developer@aio.local", "Developer123!");
  await page.goto("/admin/developer-settings");

  await page.locator("label").filter({ hasText: "Analytics" }).click();
  await expect(page.getByLabel("Analytics")).not.toBeChecked();
  await page.locator("label").filter({ hasText: "Enable diagnostics panel" }).click();
  await expect(page.getByLabel("Enable diagnostics panel")).toBeChecked();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Developer settings saved.")).toBeVisible();
  await expect(page.getByLabel("Developer diagnostics")).toBeVisible();
  await expect(page.getByRole("link", { name: "Analytics" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await login(page, "owner@aio.local", "Owner123!");
  await expect(page.getByRole("link", { name: "Analytics" })).toHaveCount(0);
  await page.goto("/admin/analytics");
  await expect(page.getByText("Access denied")).toBeVisible();
  await page.goto("/admin/developer-settings");
  await expect(page.getByText("Access denied")).toBeVisible();
});
