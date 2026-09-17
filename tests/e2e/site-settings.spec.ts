import { expect, test } from "@playwright/test";

test("developer updates settings that apply to the public site", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/settings");

  await page.getByLabel("Site name").fill("AIO Configured");
  await page.getByLabel("Currency").selectOption("UAH");
  await page.getByText("Maintenance mode", { exact: true }).click();
  await expect(page.getByLabel(/Maintenance mode/)).toBeChecked();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Site settings saved.")).toBeVisible();

  await page.goto("/admin/products/new");
  await expect(page.getByLabel("Currency")).toHaveValue("UAH");

  await page.goto("/");
  await expect(page.getByText("AIO Configured", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("status")).toContainText("maintenance mode");
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
