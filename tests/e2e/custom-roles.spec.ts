import { expect, test } from "@playwright/test";

test("owner creates, archives and restores a custom role", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("aio-locale", "en"); });
  await page.reload();
  await page.getByLabel("Email").fill("owner@aio.local");
  await page.getByLabel("Password").fill("Owner123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/roles");

  await expect(page.getByRole("heading", { level: 1, name: "Roles and permissions" })).toBeVisible();
  await page.getByLabel("Unique key").fill("warehouse-worker");
  await page.getByLabel("Role name").fill("Warehouse worker");
  await page.getByLabel("dashboard view").check();
  await page.getByLabel("warehouse view").check();
  await page.getByLabel("warehouse manage").check();
  await page.getByRole("button", { name: "Save role" }).click();

  await expect(page.getByRole("status")).toContainText("Role saved");
  await expect(page.getByRole("button", { name: /Warehouse worker/ })).toBeVisible();
  await page.getByRole("button", { name: "Archive" }).click();
  await expect(page.getByRole("button", { name: "Restore" })).toBeVisible();
  await page.getByRole("button", { name: "Restore" }).click();
  await expect(page.getByRole("button", { name: "Archive" })).toBeVisible();

  await page.goto("/admin/users");
  await page.getByRole("button", { name: "Add user" }).click();
  await page.getByLabel("Name").fill("Warehouse Employee");
  await page.getByLabel("Login").fill("warehouse.employee");
  await page.getByLabel("Email").fill("warehouse@aio.local");
  await page.getByLabel("Password").fill("Warehouse123!");
  await page.getByLabel("Role").selectOption({ label: "Warehouse worker" });
  await page.getByLabel("Status").selectOption("active");
  await page.getByRole("button", { name: "Create user" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();

  await page.getByLabel("Email").fill("warehouse@aio.local");
  await page.getByLabel("Password").fill("Warehouse123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("link", { name: "Warehouse" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Orders" })).toHaveCount(0);
  await page.goto("/admin/orders");
  await expect(page.getByText("Access denied")).toBeVisible();
  await page.goto("/admin/warehouse");
  await expect(page.getByRole("heading", { name: "Warehouse management" })).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
