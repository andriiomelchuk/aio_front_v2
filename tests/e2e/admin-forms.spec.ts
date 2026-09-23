import { expect, test, type Page } from "@playwright/test";

const loginAsDeveloper = async (page: Page) => {
  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
};

test("primary admin forms share responsive actions and do not overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Explicit desktop and mobile viewports are covered in one run");
  await loginAsDeveloper(page);

  const routes = ["/admin/products/new", "/admin/pages/new", "/admin/menus/new"];
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route);
      await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
      await expect(page.getByRole("button", { name: /Create product|Save changes/ })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
    }
  }
});

test("category modal uses the standard form actions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Modal behavior is covered once");
  await loginAsDeveloper(page);
  await page.goto("/admin/categories");
  await page.getByRole("button", { name: /Add category/i }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Cancel" })).toBeVisible();
  await expect(page.getByRole("dialog").getByRole("button", { name: /Create category/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
