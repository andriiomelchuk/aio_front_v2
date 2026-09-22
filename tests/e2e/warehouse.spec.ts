import { expect, test } from "@playwright/test";

test("developer creates a warehouse and an additional storage location", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/warehouse");

  await page.getByLabel("Warehouse name").fill("Main warehouse");
  await page.getByLabel("Warehouse code").fill("main");
  await page.getByLabel("Address").fill("Test street");
  await page.getByLabel("Location name").first().fill("Shelf A");
  await page.getByLabel("Location code").first().fill("a-01");
  await page.getByRole("button", { name: "Create warehouse" }).click();
  await expect(page.getByText("Warehouse created.")).toBeVisible();

  await page.getByLabel("Warehouse / location").first().selectOption({ label: "Main warehouse (MAIN)" });
  await page.getByLabel("Location name").nth(1).fill("Shelf B");
  await page.getByLabel("Location code").nth(1).fill("b-01");
  await page.getByRole("button", { name: "Add location" }).click();
  await expect(page.getByText("Storage location created.")).toBeVisible();
  await expect(page.getByText(/Shelf A \(A-01\), Shelf B \(B-01\)/)).toBeVisible();

  await page.getByLabel("Item name").fill("Hair dye");
  await page.getByLabel("SKU", { exact: true }).fill("dye-black");
  await page.getByLabel("Unit").selectOption("ml");
  await page.getByLabel("Low-stock threshold").fill("100");
  await page.getByRole("button", { name: "Create consumable" }).click();
  await expect(page.getByText("Consumable created.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hair dye" })).toBeVisible();

  await page.getByLabel("Stock item").selectOption({ label: "Consumable: Hair dye (DYE-BLACK)" });
  await page.getByLabel("Destination location").selectOption({ label: "Main warehouse / Shelf A (A-01)" });
  await page.getByLabel("Quantity").fill("500");
  await page.getByLabel("Reason").fill("Supplier delivery");
  await page.getByRole("button", { name: "Record movement" }).click();
  await expect(page.getByText("Inventory movement recorded.")).toBeVisible();

  await page.getByLabel("Operation").selectOption("service_usage");
  await page.getByLabel("Source location").selectOption({ label: "Main warehouse / Shelf A (A-01)" });
  await page.getByLabel("Quantity").fill("62.5");
  await page.getByLabel("Reason").fill("Hair coloring");
  await page.getByLabel("Reference").fill("appointment-1");
  await page.getByRole("button", { name: "Record movement" }).click();
  await expect(page.getByRole("cell", { name: "Used for service" }).first()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
