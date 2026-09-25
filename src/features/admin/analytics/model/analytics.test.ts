import { describe, expect, it } from "vitest";
import { calculateAnalytics } from "./analytics";

describe("calculateAnalytics", () => {
  it("calculates period metrics and product ranking", () => {
    const result = calculateAnalytics({ period: "30", now: new Date("2026-09-25T12:00:00Z"), customers: [], users: [], warehouse: { warehouses: [], inventoryItems: [], balances: [], movements: [] }, services: { categories: [], services: [], providers: [], locations: [], appointments: [] }, orders: [{ id: "1", status: "completed", price: 50, currency: "EUR", createdAt: "2026-09-20T10:00:00Z", updatedAt: "2026-09-20T10:00:00Z", items: [{ productId: "p1", title: "Product", sku: "P1", thumbnail: "", quantity: 2, baseUnitPrice: 25, unitPrice: 25, currency: "EUR" }] }] });
    expect(result).toMatchObject({ revenue: 50, orders: 1, averageOrder: 50 }); expect(result.topProducts[0]).toMatchObject({ title: "Product", quantity: 2 });
  });
});
