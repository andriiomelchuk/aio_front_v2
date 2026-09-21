import type {
  T_CreateOrderDto,
  T_Order,
  T_UpdateOrderDto,
} from "@/entities/order";
import { mockOrders } from "@/entities/order";
import type { T_GetOrdersParams } from "./types";
import { readSiteSettings } from "@/shared/api/siteSettings";
import { finalizeOrderStock, reserveOrderStock } from "@/shared/api/warehouse";

const ORDERS_STORAGE_KEY = "orders";

const createOrderNumber = (orders: T_Order[]) => {
  const prefix = readSiteSettings().commerce.orderPrefix.trim().toUpperCase();
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedPrefix}-(\\d+)$`);
  const nextSequence = orders.reduce((largest, order) => {
    const match = String(order.id).match(pattern);
    return match ? Math.max(largest, Number(match[1])) : largest;
  }, 0) + 1;

  return `${prefix}-${String(nextSequence).padStart(6, "0")}`;
};

export const createOrder = async (
  order: T_CreateOrderDto,
): Promise<T_Order> => {
  const timestamp = new Date().toISOString();
  const storedOrders = loadStoredOrders();
  const createdOrder: T_Order = {
    ...order,
    id: createOrderNumber(storedOrders),
    status: "new",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  reserveOrderStock(String(createdOrder.id), createdOrder.items ?? [], "Checkout");

  localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify([...storedOrders, createdOrder]),
  );

  return createdOrder;
};

export const getOrders = async (
  params: T_GetOrdersParams = {},
): Promise<T_Order[]> => {
  return loadStoredOrders()
    .filter(
      (order) =>
        (!params.customerId || order.customerId === params.customerId) &&
        (!params.status || order.status === params.status),
    )
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );
};

export const getOrderById = async (
  id: string | number,
): Promise<T_Order> => {
  const order = loadStoredOrders().find((item) => String(item.id) === String(id));

  if (!order) throw new Error("Order not found");
  return order;
};

export const updateOrder = async (order: T_UpdateOrderDto) => {
  const updatedOrder: T_Order = {
    ...order,
    updatedAt: new Date().toISOString(),
  };
  const orders = loadStoredOrders();
  const previousOrder = orders.find((item) => String(item.id) === String(order.id));
  if (previousOrder?.status !== order.status) {
    if (order.status === "completed") finalizeOrderStock(String(order.id), "sale", order.internalNote || "Admin");
    if (order.status === "cancelled") finalizeOrderStock(String(order.id), "release", order.internalNote || "Admin");
  }
  const exists = orders.some((item) => String(item.id) === String(order.id));
  const nextOrders = exists
    ? orders.map((item) => String(item.id) === String(order.id) ? updatedOrder : item)
    : [...orders, updatedOrder];

  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
  return updatedOrder;
};

const loadStoredOrders = (): T_Order[] => {
  const rawOrders = localStorage.getItem(ORDERS_STORAGE_KEY);

  if (!rawOrders) return mockOrders;

  try {
    const orders: unknown = JSON.parse(rawOrders);

    return Array.isArray(orders) ? (orders as T_Order[]) : mockOrders;
  } catch {
    return mockOrders;
  }
};
