import { expect, test } from "@playwright/test";

test("admin saves product translations and storefront uses the active locale", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
    localStorage.setItem("admin-products-version", "3");
    localStorage.setItem("admin-products-overrides", JSON.stringify({
      "translated-product": {
        id: "translated-product",
        title: "Українська назва",
        slug: "translated-product",
        sku: "TR-1",
        shortDescription: "Короткий опис",
        description: "Повний український опис",
        price: 100,
        currency: "UAH",
        stockQuantity: 10,
        stockStatus: "in_stock",
        categoryId: "beauty",
        status: "active",
        thumbnail: "https://dummyjson.com/image/400x400",
        images: [{ id: "image-1", url: "https://dummyjson.com/image/400x400", alt: "Український alt", isMain: true }],
        attributes: [{ id: "attribute-color", name: "Колір", value: "Чорний" }],
        variants: [],
        seo: { title: "Український SEO", description: "SEO опис", keywords: [] },
        shipping: {},
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        defaultLocale: "uk",
        translations: {},
      },
    }));
  });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/products/translated-product/edit");

  const titleLanguage = page.getByLabel("Title Language", { exact: true });
  await expect(titleLanguage).toHaveValue("uk");
  await titleLanguage.selectOption("en");
  await page.getByLabel("Title", { exact: true }).fill("English product title");
  await page.getByLabel("Description Language", { exact: true }).selectOption("en");
  await page.getByLabel("Description", { exact: true }).fill("English product description");
  await page.getByLabel("Category").selectOption({ label: "Beauty" });
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect.poll(() => page.evaluate(() => {
    const products = JSON.parse(localStorage.getItem("admin-products-overrides") ?? "{}");
    return products["translated-product"]?.translations?.en?.title;
  })).toBe("English product title");

  await page.evaluate(() => localStorage.setItem("aio-locale", "en"));
  await page.goto("/products/translated-product");
  await expect(page.getByRole("heading", { name: "English product title" })).toBeVisible();
  await expect(page.getByText("English product description")).toBeVisible();
});
