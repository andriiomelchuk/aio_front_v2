import { expect, test } from "@playwright/test";

test("analytics aggregates operations and filters the reporting period", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("aio-locale", "en"); });
  await page.reload(); await page.getByLabel("Email").fill("developer@aio.local"); await page.getByLabel("Password").fill("Developer123!"); await page.getByRole("button", { name: "Sign in" }).click();
  await page.evaluate(() => {
    const now = new Date(); const old = new Date(now.getTime() - 60 * 86_400_000);
    localStorage.setItem("orders", JSON.stringify([
      { id: "A-1", price: 120, status: "completed", currency: "EUR", createdAt: now.toISOString(), updatedAt: now.toISOString(), items: [{ productId: "p1", title: "Analytics product", sku: "A", thumbnail: "", quantity: 2, baseUnitPrice: 60, unitPrice: 60, currency: "EUR" }] },
      { id: "A-2", price: 80, status: "completed", currency: "EUR", createdAt: old.toISOString(), updatedAt: old.toISOString() },
    ]));
    localStorage.setItem("customers", JSON.stringify([{ id: "c1", type: "individual", status: "active", firstName: "Alex", lastName: "Test", email: "alex@example.com", addresses: [], marketingConsent: false, notes: [], createdAt: now.toISOString(), updatedAt: now.toISOString() }]));
    localStorage.setItem("aio-staff-users", JSON.stringify([]));
    localStorage.setItem("aio-warehouse-state", JSON.stringify({ warehouses: [], inventoryItems: [], movements: [], balances: [{ productId: "p1", warehouseId: "w1", locationId: "l1", condition: "sellable", physical: 4, reserved: 0, updatedAt: now.toISOString() }] }));
    localStorage.setItem("aio-warehouse-version", "3");
  });
  await page.goto("/admin/analytics");
  await expect(page.getByRole("paragraph").filter({ hasText: /^€120$/ }).first()).toBeVisible(); await expect(page.getByText("Analytics product")).toBeVisible();
  await page.getByLabel("Reporting period").selectOption("all");
  await expect(page.getByRole("paragraph").filter({ hasText: /^€200$/ }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
