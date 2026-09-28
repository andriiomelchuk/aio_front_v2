import { expect, test, type Page } from "@playwright/test";

const login = async (page: Page, email: string, password: string) => {
  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
};

test("viewer can inspect operations but cannot open restricted modules", async ({ page }) => {
  await login(page, "viewer@aio.local", "Viewer123!");
  await page.goto("/admin/products");
  await expect(page.getByRole("main")).toBeVisible();
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  await page.goto("/admin/payroll");
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
});

test("manager can prepare payroll but cannot approve it or manage users", async ({ page }) => {
  await login(page, "manager@aio.local", "Manager123!");
  await page.goto("/admin/payroll");
  await expect(page.getByRole("heading", { level: 1, name: "Payroll" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rate plans", exact: true })).toBeVisible();
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
  await page.goto("/admin/developer-settings");
  await expect(page.getByRole("heading", { name: "Access denied" })).toBeVisible();
});

test("developer retains access to users and developer settings", async ({ page }) => {
  await login(page, "developer@aio.local", "Developer123!");
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  await page.goto("/admin/developer-settings");
  await expect(page.getByRole("heading", { level: 1, name: "Developer settings", exact: true })).toBeVisible();
});
