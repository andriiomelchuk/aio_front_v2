import { expect, test } from "@playwright/test";

test("staff creates and edits a localized service with variants and add-ons", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear(); localStorage.setItem("aio-locale", "en"); localStorage.setItem("aio-warehouse-version", "3");
    localStorage.setItem("aio-warehouse-state", JSON.stringify({
      warehouses: [{ id: "warehouse-test", name: "Main warehouse", code: "MAIN", address: "", status: "active", locations: [{ id: "location-test", name: "Shelf A", code: "A-01" }], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      inventoryItems: [{ id: "consumable-test", type: "consumable", name: "Care lotion", sku: "LOTION", unit: "ml", lowStockThreshold: 10, status: "active", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      balances: [{ itemType: "consumable", productId: "consumable-test", warehouseId: "warehouse-test", locationId: "location-test", condition: "sellable", physical: 100, reserved: 0, updatedAt: new Date().toISOString() }], movements: [],
    }));
  });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/services/new");

  await page.getByLabel("Title").first().fill("Express care");
  await page.getByLabel("Slug").fill("express-care");
  await page.getByLabel("Category").selectOption("service-category-consultations");
  await page.getByLabel("Status").selectOption("active");
  await page.getByLabel("Short description").first().fill("Fast professional care");
  await page.getByLabel("Description").first().fill("A complete express service for busy customers.");
  await page.getByLabel("Price", { exact: true }).first().fill("75");

  await page.getByRole("button", { name: "Add variant" }).click();
  await page.getByLabel("Title").nth(1).fill("Premium");
  await page.getByRole("button", { name: "Add add-on" }).click();
  await page.getByLabel("Title").nth(2).fill("Extra finish");
  await page.getByRole("button", { name: "Add material" }).click();
  await page.getByLabel("Material", { exact: true }).selectOption("consumable-test");
  await page.getByLabel("Quantity").last().fill("5");
  await page.getByLabel("Warehouse", { exact: true }).selectOption("warehouse-test");
  await page.getByLabel("Stock location").selectOption("location-test");
  await page.getByLabel("SEO title").first().fill("Express care appointment");
  await page.getByLabel("Title").nth(3).fill("Express Care EN");

  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/admin\/services$/);
  await expect(page.getByRole("link", { name: "Express care" })).toBeVisible();
  await page.getByRole("link", { name: "Express care" }).click();
  await expect(page.getByLabel("Title").nth(1)).toHaveValue("Premium");
  await expect(page.getByText("Extra finish")).toBeVisible();
  await expect(page.getByLabel("Material", { exact: true })).toHaveValue("consumable-test");
});
