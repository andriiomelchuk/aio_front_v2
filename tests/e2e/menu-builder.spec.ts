import { expect, test, type Page } from "@playwright/test";

const seedPublishedMenu = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem("aio-locale", "en");
    localStorage.setItem("aio-menus", JSON.stringify([{
      id: "responsive-menu",
      name: "Responsive menu",
      key: "responsive-menu",
      status: "published",
      defaultLocale: "en",
      items: [{
        id: "catalog",
        label: { uk: "Каталог", en: "Catalog", de: "Katalog", ru: "Каталог" },
        href: "/products",
        openInNewTab: false,
        isVisible: true,
        children: [{
          id: "categories",
          label: { uk: "Категорії", en: "Categories", de: "Kategorien", ru: "Категории" },
          href: "/categories",
          openInNewTab: false,
          isVisible: true,
          children: [],
        }],
      }],
      createdAt: "2026-09-15T00:00:00.000Z",
      updatedAt: "2026-09-15T00:00:00.000Z",
    }]));
    localStorage.setItem("aio-menu-assignments", JSON.stringify([{
      id: "responsive-header",
      menuId: "responsive-menu",
      target: { type: "global" },
      region: "header",
      order: 0,
      isVisible: true,
    }]));
  });
};

test("creates, publishes and assigns a nested header menu", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Admin creation flow is covered once on desktop");
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

  await page.goto("/admin/menus/new");
  await page.getByLabel("Internal name").fill("E2E navigation");
  await page.getByLabel("Unique key").fill("e2e-navigation");
  await page.getByLabel("Status").selectOption("published");
  await page.getByRole("button", { name: "Add menu item" }).click();
  const rootItem = page.getByRole("heading", { name: "Untitled menu item" }).locator("..").locator("..");
  await rootItem.getByLabel("URL").fill("/products");
  await rootItem.getByLabel("Label (EN)").fill("Shop");
  await page.getByRole("heading", { name: "Shop" }).locator("..").locator("..").getByRole("button", { name: "Add child item" }).click();
  const childItem = page.getByRole("heading", { name: "Untitled menu item" }).locator("..").locator("..");
  await childItem.getByLabel("URL").fill("/categories");
  await childItem.getByLabel("Label (EN)").fill("Categories");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/admin\/menus\/[^/]+\/edit$/);

  await page.getByRole("button", { name: "Add assignment" }).click();
  await expect(page.getByText("Entire site · Header", { exact: true })).toBeVisible();
  await page.goto("/products");
  const shopLink = page.getByRole("link", { name: "Shop" });
  await expect(shopLink).toBeVisible();
  await shopLink.hover();
  await expect(page.getByRole("link", { name: "Categories" })).toBeVisible();
});

test("nested menu remains usable without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Responsive matrix is covered once with explicit viewport sizes");
  await seedPublishedMenu(page);
  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "tablet", width: 820, height: 1180 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/products");
    if (viewport.width < 1024) {
      await page.getByRole("button", { name: "Open menu" }).click();
    } else {
      await page.getByRole("link", { name: "Catalog" }).hover();
    }
    await expect(page.getByRole("link", { name: "Categories" })).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`menu-${viewport.name}.png`), fullPage: true });
  }
});
