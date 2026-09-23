import { describe, expect, it } from "vitest";
import type { T_Order } from "@/entities/order";
import { calculateOrderMetrics } from "./calculateOrderMetrics";

const order = (changes: Partial<T_Order>): T_Order => ({
  id: "AIO-1", price: 100, currency: "EUR", status: "new",
  createdAt: "2026-09-21T10:00:00.000Z", updatedAt: "2026-09-21T10:00:00.000Z",
  ...changes,
});

describe("calculateOrderMetrics", () => {
  it("calculates operational counts and keeps revenue currencies separate", () => {
    const metrics = calculateOrderMetrics([
      order({ status: "new" }),
      order({ id: "AIO-2", status: "processing" }),
      order({ id: "AIO-3", status: "completed", totals: { subtotal: 120, discount: 20, delivery: 0, total: 100 } }),
      order({ id: "AIO-4", status: "completed", currency: "USD", price: 50 }),
      order({ id: "AIO-5", status: "cancelled", price: 999 }),
    ], new Date("2026-09-23T12:00:00.000Z"));

    expect(metrics).toEqual({
      activeOrders: 2,
      ordersThisWeek: 5,
      revenueByCurrency: { EUR: 100, USD: 50 },
    });
  });
});
