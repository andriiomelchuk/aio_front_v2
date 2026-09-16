import { expect, test } from "@playwright/test";

test("saves a draft, publishes it and previews the selected language", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Translation administration flow is covered once on desktop");

  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.goto("/admin/translations");
  await page.locator("#translation-search").fill("nav.home");
  await page.getByLabel("Translation language").selectOption("de");
  const translation = page.getByLabel("Translation (DE): nav.home");
  await expect(translation).toBeVisible();
  await translation.fill("Startseite E2E");

  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved.", { exact: true })).toBeVisible();
  const publishedBefore = await page.evaluate(() => {
    const documents = JSON.parse(localStorage.getItem("aio-translations") ?? "[]") as Array<{
      locale: string;
      namespace: string;
      published: Record<string, string>;
    }>;
    return documents.find((item) => item.locale === "de" && item.namespace === "common")?.published["nav.home"];
  });
  expect(publishedBefore).toBeUndefined();

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByText("Translations published.", { exact: true })).toBeVisible();
  await page.locator("#translation-preview-locale").selectOption("de");
  await page.getByRole("button", { name: "Preview language" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Startseite E2E", exact: true })).toBeVisible();
});
