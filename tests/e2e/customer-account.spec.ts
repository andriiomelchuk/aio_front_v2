import { expect, test } from "@playwright/test";

test("customer registers, updates the profile and signs in again", async ({ page }) => {
  await page.goto("/register");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("aio-locale", "en");
  });
  await page.reload();
  await page.getByLabel("First name").fill("Jane");
  await page.getByLabel("Last name").fill("Doe");
  await page.getByLabel("Email", { exact: true }).fill("jane@example.com");
  await page.getByLabel("Password", { exact: true }).fill("StrongPassword123!");
  await page.getByLabel("Confirm password").fill("DifferentPassword123!");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByText("Passwords do not match.", { exact: true })).toBeVisible();

  await page.getByLabel("Confirm password").fill("StrongPassword123!");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/products$/);

  await page.goto("/account");
  await expect(page.getByRole("heading", { level: 1, name: "My account" })).toBeVisible();
  await page.getByLabel("First name").fill("Janet");
  await page.getByLabel("Phone").fill("+49 123 456789");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toContainText("Profile updated");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("customers") ?? "[]")[0]?.firstName)).toBe("Janet");

  await page.reload();
  await expect(page.getByLabel("First name")).toHaveValue("Janet");
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByText("Sign out", { exact: true }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=(%2F|\/)account$/);
  await page.getByLabel("Email", { exact: true }).fill("jane@example.com");
  await page.getByLabel("Password", { exact: true }).fill("StrongPassword123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByLabel("First name")).toHaveValue("Janet");
});
