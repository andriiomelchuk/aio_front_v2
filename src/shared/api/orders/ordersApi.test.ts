import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { T_Order } from "@/entities/order";
import { getOrders, updateOrder } from "./ordersApi";
import type { OrdersApiError } from "./types";

const createStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  };
};

const createOrder = (overrides: Partial<T_Order> = {}): T_Order => ({
  id: "AIO-1001",
  customerId: "customer-1",
  price: 20,
  status: "new",
  customer: {
    firstName: "Test",
    lastName: "Customer",
    email: "customer@example.com",
    phone: "+123456789",
  },
  items: [],
  createdAt: "2026-09-20T10:00:00.000Z",
  updatedAt: "2026-09-20T10:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  vi.stubGlobal("window", { localStorage: createStorage(), dispatchEvent: vi.fn() });
});

afterEach(() => vi.unstubAllGlobals());

describe("orders API", () => {
  it("finds both account and guest orders by customer email", async () => {
    const accountOrder = createOrder();
    const guestOrder = createOrder({ id: "AIO-1002", customerId: undefined });
    window.localStorage.setItem("orders", JSON.stringify([accountOrder, guestOrder]));

    const orders = await getOrders({
      customerId: "customer-1",
      customerEmail: "CUSTOMER@example.com",
    });

    expect(orders.map(({ id }) => id)).toEqual(["AIO-1001", "AIO-1002"]);
  });

  it("records status changes with the authenticated employee name", async () => {
    const order = createOrder();
    window.localStorage.setItem("orders", JSON.stringify([order]));

    const updatedOrder = await updateOrder(
      { ...order, status: "processing" },
      { updatedBy: "AIO Manager" },
    );

    expect(updatedOrder.statusHistory?.[0]).toMatchObject({
      from: "new",
      to: "processing",
      createdBy: "AIO Manager",
    });
  });

  it("does not reopen a finalized order", async () => {
    const order = createOrder({ status: "completed" });
    window.localStorage.setItem("orders", JSON.stringify([order]));

    await expect(updateOrder({ id: order.id, status: "processing" }))
      .rejects.toMatchObject<Partial<OrdersApiError>>({ code: "INVALID_STATE" });
  });

  it("supports patch updates and preserves immutable order data", async () => {
    const order = createOrder();
    window.localStorage.setItem("orders", JSON.stringify([order]));

    const updatedOrder = await updateOrder({ id: order.id, internalNote: "Call before delivery" });

    expect(updatedOrder).toMatchObject({
      id: order.id,
      customerId: order.customerId,
      createdAt: order.createdAt,
      internalNote: "Call before delivery",
    });
  });
});
