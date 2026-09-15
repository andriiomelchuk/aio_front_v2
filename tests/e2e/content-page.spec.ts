import { expect, test } from "@playwright/test";

test("published content page renders responsively", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    const localized = (en: string) => ({ uk: "", en, de: "", ru: "" });
    localStorage.setItem("aio-content-pages", JSON.stringify([{
      id: "e2e-page",
      slug: "e2e-content",
      status: "published",
      defaultLocale: "en",
      title: localized("E2E content page"),
      blocks: [{
        id: "hero-1",
        type: "hero",
        isVisible: true,
        data: {
          title: localized("Responsive content page"),
          description: localized("Content created through the page builder."),
          imageAlt: localized(""),
          buttonLabel: localized(""),
        },
      }],
      seo: {
        title: localized("E2E content page"),
        description: localized("Content page test"),
        noIndex: true,
      },
      createdAt: "2026-09-15T00:00:00.000Z",
      updatedAt: "2026-09-15T00:00:00.000Z",
    }]));
  });

  await page.goto("/e2e-content", { waitUntil: "domcontentloaded" });

  await expect.poll(() => pageErrors, { message: pageErrors.join("\n") }).toEqual([]);
  await expect(page.getByRole("heading", { name: "Responsive content page" })).toBeVisible();
  await expect(page.getByText("Content created through the page builder.")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("draft content page is not publicly available", async ({ page }) => {
  await page.addInitScript(() => {
    const localized = (en: string) => ({ uk: "", en, de: "", ru: "" });
    localStorage.setItem("aio-content-pages", JSON.stringify([{
      id: "draft-page",
      slug: "draft-content",
      status: "draft",
      defaultLocale: "en",
      title: localized("Draft page"),
      blocks: [],
      seo: { title: localized(""), description: localized(""), noIndex: true },
      createdAt: "2026-09-15T00:00:00.000Z",
      updatedAt: "2026-09-15T00:00:00.000Z",
    }]));
  });

  await page.goto("/draft-content", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: /Page not found|Сторінку не знайдено/ })).toBeVisible();
});
