import { expect, test, type Page } from "@playwright/test";

const loginAsDeveloper = async (page: Page) => {
  await page.goto("/admin/login");
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("aio-locale", "en"); });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
};

test("staff work can be recorded, completed and approved", async ({ page }) => {
  await loginAsDeveloper(page);
  await page.goto("/admin/staff");

  await page.getByLabel("First name").fill("AIO Developer");
  await page.getByLabel("Last name").fill("Worker");
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByRole("button", { name: "Save employee" }).click();
  await expect(page.getByRole("status")).toContainText("Employee profile saved");

  await page.getByRole("tab", { name: "Performed work" }).click();
  await page.getByLabel("Service").selectOption("service-consultation");
  await page.getByLabel("AIO Developer Worker").check();
  await page.getByRole("button", { name: "Record work" }).click();
  await expect(page.getByRole("status")).toContainText("Performed work recorded");
  await expect(page.getByRole("heading", { name: "Personal consultation" })).toBeVisible();

  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByText("In progress / 60 min / 1")).toBeVisible();
  await page.getByRole("button", { name: "Complete" }).click();
  await expect(page.getByText("Completed / 60 min / 1")).toBeVisible();
  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Approved / 60 min / 1")).toBeVisible();

  await page.getByRole("tab", { name: "Reports" }).click();
  const row = page.getByRole("row", { name: /AIO Developer Worker/ });
  await expect(row).toContainText("1");
  await expect(row).toContainText("50.00");
});

test("staff page remains usable on a narrow phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The narrow viewport is exercised once");
  await page.setViewportSize({ width: 320, height: 720 });
  await loginAsDeveloper(page);
  await page.goto("/admin/staff");
  await expect(page.getByRole("heading", { name: "Staff and work", level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
