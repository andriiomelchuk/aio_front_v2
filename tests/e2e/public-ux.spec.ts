import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/products",
  "/categories",
  "/cart",
  "/wishlist",
  "/comparison",
  "/movies",
  "/popular?language=all",
  "/battle",
  "/login",
  "/register",
];

test.describe("public pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  for (const route of publicRoutes) {
    test(`${route} fits the viewport`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("banner")).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );

      expect(hasHorizontalOverflow).toBe(false);
    });
  }

  test("empty cart offers a route back to the catalog", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("main a[href='/products']")).toBeVisible();
    await expect(page.getByRole("link", { name: /checkout|оформ|kasse/i })).toHaveCount(0);
  });

  test("brand links back to the home page", async ({ page }) => {
    await page.goto("/products");
    const brand = page.locator("header a[href='/']").first();
    await expect(brand).toBeVisible();
  });
});
