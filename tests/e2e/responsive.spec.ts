import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/", "/products", "/products/essence-mascara-lash-princess",
  "/categories", "/categories/beauty", "/cart", "/wishlist", "/comparison",
  "/checkout", "/checkout/success", "/login", "/register", "/account",
  "/movies", "/battle", "/battle/result", "/popular?language=all", "/todos",
  "/services", "/services/personal-consultation",
];

const adminRoutes = [
  "/admin", "/admin/analytics", "/admin/products", "/admin/products/new",
  "/admin/categories", "/admin/orders", "/admin/customers", "/admin/pages",
  "/admin/pages/new", "/admin/menus", "/admin/menus/new", "/admin/translations",
  "/admin/warehouse", "/admin/imports", "/admin/services", "/admin/services/new", "/admin/services/service-consultation/edit", "/admin/services/schedules/provider/provider-anna", "/admin/users", "/admin/settings", "/admin/developer-settings",
];

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
  await expect(page).toHaveURL(/\/admin$/);
};

const expectDocumentToFit = async (page: Page, route: string) => {
  await expect(page.locator("body"), `${route} should render a visible document`).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `${route} should not cause document-level horizontal scrolling`).toBeLessThanOrEqual(1);
};

test.describe("responsive public routes", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  for (const route of publicRoutes) {
    test(`${route} fits the viewport`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await expectDocumentToFit(page, route);
    });
  }
});

test("all administrative routes fit the viewport", async ({ page }) => {
  await loginAsDeveloper(page);
  for (const route of adminRoutes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    await expectDocumentToFit(page, route);
  }
});

test("admin navigation and wide tables remain usable on a narrow phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The narrow viewport is exercised once");
  await page.setViewportSize({ width: 320, height: 720 });
  await loginAsDeveloper(page);

  await page.goto("/admin/orders");
  await expectDocumentToFit(page, "/admin/orders at 320px");
  await page.getByRole("button", { name: "Open admin menu" }).click();
  await expect(page.getByRole("navigation", { name: "Admin navigation" })).toBeVisible();
  await page.getByRole("link", { name: /Warehouse/ }).click();
  await expect(page).toHaveURL(/\/admin\/warehouse$/);
  await expect(page.getByRole("heading", { name: "Stock balances" })).toBeVisible();
  await expectDocumentToFit(page, "/admin/warehouse at 320px");

  const scrollContainers = page.locator(".overflow-x-auto");
  const count = await scrollContainers.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const box = await scrollContainers.nth(index).boundingBox();
    if (box) expect(box.x + box.width).toBeLessThanOrEqual(321);
  }
});
