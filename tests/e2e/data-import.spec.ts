import { expect, test } from "@playwright/test";

test("developer previews a mapped product CSV before importing", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/imports");

  await page.locator('input[type="file"]').setInputFiles({
    name: "products.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("sku,title,slug,price,categoryId\nNEW-001,Imported product,imported-product,25.5,beauty"),
  });

  await expect(page.getByRole("heading", { name: "Column mapping" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Validation and preview" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "NEW-001" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run import" })).toBeEnabled();
});
