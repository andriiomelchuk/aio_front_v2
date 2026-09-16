import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

const expectPermanentLowercaseRedirect = async (
  request: APIRequestContext,
  source: string,
  expectedPath: string,
) => {
  const response = await request.get(source, { maxRedirects: 0 });

  expect(response.status()).toBe(308);
  expect(
    new URL(response.headers().location ?? "", "http://localhost:3000").pathname,
  ).toBe(expectedPath);
};

const expectCanonicalLink = async (page: Page, expectedPath: string) => {
  const canonicalLink = page.locator('link[rel="canonical"]');

  await expect(canonicalLink).toHaveCount(1);
  await expect(canonicalLink).toHaveAttribute(
    "href",
    `http://localhost:3000${expectedPath}`,
  );
};

test("redirects mixed-case pages to lowercase while preserving the query", async ({ page, request }) => {
  const response = await request.get("/WiShLiSt?Ref=CampaignABC", { maxRedirects: 0 });

  expect(response.status()).toBe(308);
  expect(response.headers().location).toMatch(/\/wishlist\?Ref=CampaignABC$/);

  await page.goto("/WiShLiSt?Ref=CampaignABC");
  await expect(page).toHaveURL(/\/wishlist\?Ref=CampaignABC$/);
});

test("canonicalizes a product URL and renders the product", async ({ page, request }) => {
  await expectPermanentLowercaseRedirect(
    request,
    "/PRODUCTS/Red-Lipstick",
    "/products/red-lipstick",
  );

  await page.goto("/PRODUCTS/Red-Lipstick");

  await expect(page).toHaveURL(/\/products\/red-lipstick$/);
  await expect(page.getByRole("heading", { name: "Red Lipstick" })).toBeVisible();
  await expectCanonicalLink(page, "/products/red-lipstick");
});

test("canonicalizes a category URL and renders the category", async ({ page, request }) => {
  await expectPermanentLowercaseRedirect(
    request,
    "/CATEGORIES/Beauty",
    "/categories/beauty",
  );

  await page.goto("/CATEGORIES/Beauty");

  await expect(page).toHaveURL(/\/categories\/beauty$/);
  await expect(page.getByRole("heading", { name: "Beauty" })).toBeVisible();
  await expectCanonicalLink(page, "/categories/beauty");
});

test("canonicalizes and renders a published content page", async ({ page, request }) => {
  await page.addInitScript(() => {
    const localized = (en: string) => ({ uk: "", en, de: "", ru: "" });
    localStorage.setItem("aio-content-pages", JSON.stringify([{
      id: "canonical-page",
      slug: "canonical-page",
      status: "published",
      defaultLocale: "en",
      title: localized("Canonical page"),
      blocks: [{
        id: "text-1",
        type: "text",
        isVisible: true,
        data: {
          title: localized("Canonical content heading"),
          content: localized("Canonical content body"),
          alignment: "left",
        },
      }],
      seo: {
        title: localized("Canonical page"),
        description: localized("Canonical page test"),
        noIndex: true,
      },
      createdAt: "2026-09-16T00:00:00.000Z",
      updatedAt: "2026-09-16T00:00:00.000Z",
    }]));
  });

  await expectPermanentLowercaseRedirect(
    request,
    "/Canonical-Page",
    "/canonical-page",
  );

  await page.goto("/Canonical-Page");

  await expect(page).toHaveURL(/\/canonical-page$/);
  await expect(page.getByRole("heading", { name: "Canonical content heading" })).toBeVisible();
  await expect(page.getByText("Canonical content body")).toBeVisible();
  await expectCanonicalLink(page, "/canonical-page");
});

test("adds canonical metadata to a static catalog page", async ({ page }) => {
  await page.goto("/products");

  await expectCanonicalLink(page, "/products");
});

test("does not redirect an already canonical URL", async ({ request }) => {
  const response = await request.get("/wishlist", { maxRedirects: 0 });

  expect(response.status()).toBe(200);
  expect(response.headers().location).toBeUndefined();
});
