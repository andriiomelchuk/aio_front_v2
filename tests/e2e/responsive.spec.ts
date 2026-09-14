import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/products",
  "/categories",
  "/cart",
  "/wishlist",
  "/comparison",
  "/login",
  "/register",
  "/movies",
  "/battle",
  "/popular?language=all",
  "/admin/login",
];

for (const route of publicRoutes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );

    expect(overflow).toBeLessThanOrEqual(1);
  });
}
