import { expect, test } from "@playwright/test";

test("guest checkout creates an order that is visible to a manager", async ({ page }) => {
  await page.goto("/products");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  await expect(page.getByRole("status")).toContainText("added");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cart") ?? '{"products":[]}').products.length)).toBe(1);

  await page.goto("/checkout");
  await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
  await page.getByLabel("First name").fill("Guest");
  await page.getByLabel("Last name").fill("Customer");
  await page.getByLabel("Email", { exact: true }).fill("guest@example.com");
  await page.getByLabel("Phone").fill("+49 123 456789");
  await page.getByLabel("Country").fill("Germany");
  await page.getByLabel("City").fill("Berlin");
  await page.getByLabel("Postal code").fill("10115");
  await page.getByLabel("Street address").fill("Main Street 1");
  await page.getByLabel("I confirm the order details").check();
  await page.getByRole("button", { name: "Confirm checkout details" }).click();

  await expect(page).toHaveURL(/\/checkout\/success\?orderId=AIO-\d+$/);
  await expect(page.getByRole("heading", { name: "Thank you for your order" })).toBeVisible();
  const orderId = new URL(page.url()).searchParams.get("orderId");
  expect(orderId).toBeTruthy();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("cart") ?? '{"products":[]}').products.length)).toBe(0);

  await page.goto("/admin/login");
  await page.getByLabel("Work email").fill("manager@aio.local");
  await page.getByLabel("Password", { exact: true }).fill("Manager123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/orders");
  const orderRow = page.getByRole("row", { name: new RegExp(`#${orderId}`) });
  await expect(orderRow).toBeVisible();
  await orderRow.getByRole("link", { name: "View" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("guest@example.com");
});
