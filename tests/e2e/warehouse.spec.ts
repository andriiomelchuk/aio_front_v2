import { expect, test } from "@playwright/test";

test("developer creates a warehouse and an additional storage location", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/warehouse");

  await page.getByLabel("Warehouse name").fill("Main warehouse");
  await page.getByLabel("Warehouse code").fill("main");
  await page.getByLabel("Address").fill("Test street");
  await page.getByLabel("Location name").first().fill("Shelf A");
  await page.getByLabel("Location code").first().fill("a-01");
  await page.getByRole("button", { name: "Create warehouse" }).click();
  await expect(page.getByText("Warehouse created.")).toBeVisible();

  await page.getByLabel("Warehouse / location").first().selectOption({ label: "Main warehouse (MAIN)" });
  await page.getByLabel("Location name").nth(1).fill("Shelf B");
  await page.getByLabel("Location code").nth(1).fill("b-01");
  await page.getByRole("button", { name: "Add location" }).click();
  await expect(page.getByText("Storage location created.")).toBeVisible();
  await expect(page.getByText(/Shelf A \(A-01\), Shelf B \(B-01\)/)).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
