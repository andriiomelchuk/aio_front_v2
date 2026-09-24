import { expect, test } from "@playwright/test";

const nextWeekday = (daysAhead = 1) => {
  const date = new Date(Date.now() + daysAhead * 86_400_000);
  while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

test("visitor books a service and staff sees the appointment", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("aio-locale", "en"); });
  await page.goto("/services/personal-consultation");
  await page.getByLabel("Location").selectOption("location-central");
  await page.getByLabel("Specialist").selectOption("provider-anna");
  await page.getByLabel("Date").fill(nextWeekday());
  await expect.poll(async () => page.getByLabel("Time").locator("option").count()).toBeGreaterThan(1);
  await page.getByLabel("Time").selectOption({ index: 1 });
  await page.getByLabel("Your name").fill("Alex Customer");
  await page.getByLabel("Email").fill("alex@example.com");
  await page.getByRole("button", { name: "Book", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Appointment created");

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/services");
  await page.getByRole("tab", { name: /Appointments/ }).click();
  await page.getByRole("link", { name: "Alex Customer" }).click();
  await expect(page).toHaveURL(/\/admin\/services\/appointments\//);

  await page.getByLabel("Date").fill(nextWeekday(4));
  await expect.poll(async () => page.getByLabel("Time").locator("option").count()).toBeGreaterThan(0);
  await page.getByLabel("Time").selectOption({ index: 0 });
  await page.getByLabel("Internal note").fill("Customer requested a later date");
  await page.getByRole("button", { name: "Save changes" }).click();

  await page.getByLabel("Status").selectOption("cancelled");
  await page.getByLabel("Cancellation reason").fill("Customer request");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("paragraph").filter({ hasText: /^Customer request$/ })).toBeVisible();
});

test("staff configures weekly schedule and blocked time", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem("aio-locale", "en"); });
  await page.reload();
  await page.getByLabel("Email").fill("developer@aio.local");
  await page.getByLabel("Password").fill("Developer123!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.goto("/admin/services/schedules/provider/provider-anna");

  const start = `${nextWeekday(8)}T10:00`;
  const end = `${nextWeekday(8)}T12:00`;
  await page.getByLabel("Start", { exact: true }).fill(start);
  await page.getByLabel("End", { exact: true }).fill(end);
  await page.getByLabel("Reason").fill("Training");
  await page.getByRole("button", { name: "Block time" }).click();
  await expect(page.getByText("Training")).toBeVisible();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/admin\/services$/);

  await page.goto("/admin/services/schedules/provider/provider-anna");
  await expect(page.getByText("Training")).toBeVisible();
});
