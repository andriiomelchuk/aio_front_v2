import { expect, test, type Page } from "@playwright/test";

const login = async (page: Page) => {
  await page.goto("/admin/login"); await page.evaluate(() => { localStorage.clear(); localStorage.setItem("aio-locale", "en"); }); await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local"); await page.getByLabel("Password").fill("Developer123!"); await page.getByRole("button", { name: "Sign in" }).click(); await expect(page).toHaveURL(/\/admin$/);
};

const createEmployee = async (page: Page) => {
  await page.goto("/admin/staff"); await page.getByLabel("First name").fill("Payroll"); await page.getByLabel("Last name").fill("Worker"); await page.getByLabel("Email").fill("developer@aio.local"); await page.getByRole("button", { name: "Save employee" }).click(); await expect(page.getByRole("status")).toContainText("Employee profile saved");
};

test("payroll period can be calculated, approved, paid and exported", async ({ page }) => {
  await login(page); await createEmployee(page); await page.goto("/admin/payroll");
  await page.getByLabel("Rate key").fill("developer-hourly"); await page.getByLabel("Rate name").fill("Developer hourly rate"); await page.getByLabel("Amount").fill("20"); await page.getByLabel("Payroll Worker").check(); await page.getByRole("button", { name: "Save" }).click(); await expect(page.getByRole("status")).toContainText("Rate plan saved");

  await page.getByRole("tab", { name: "Timesheets" }).click(); await page.getByLabel("Employee").selectOption({ label: "Payroll Worker" }); await page.getByRole("button", { name: "Save" }).click(); await expect(page.getByRole("status")).toContainText("Timesheet saved");

  await page.getByRole("tab", { name: "Payroll periods" }).click(); await page.getByLabel("Period name").fill("Current payroll"); await page.getByRole("button", { name: "Calculate payroll" }).click(); await expect(page.getByRole("status")).toContainText("Payroll period updated"); await expect(page.getByText("Net total: 160.00 EUR", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Submit for review" }).click(); await page.getByRole("button", { name: "Approve" }).click(); await page.getByRole("button", { name: "Mark as paid" }).click(); await expect(page.getByText("Paid", { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent("download"); await page.getByRole("button", { name: "Export CSV" }).click(); const download = await downloadPromise; expect(download.suggestedFilename()).toMatch(/^payroll-.*\.csv$/);
});

test("payroll page fits a 320px viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The narrow viewport is exercised once"); await page.setViewportSize({ width: 320, height: 720 }); await login(page); await page.goto("/admin/payroll"); await expect(page.getByRole("heading", { name: "Pay rates and payroll", level: 1 })).toBeVisible(); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); expect(overflow).toBeLessThanOrEqual(1);
});
