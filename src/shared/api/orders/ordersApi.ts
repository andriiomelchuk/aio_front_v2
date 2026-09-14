import type {
  T_CreateOrderDto,
  T_Order,
  T_UpdateOrderDto,
} from "@/entities/order";
import { mockOrders } from "@/entities/order";
import type { T_GetOrdersParams } from "./types";

const ORDERS_STORAGE_KEY = "orders";

export const createOrder = async (
  order: T_CreateOrderDto,
): Promise<T_Order> => {
  const timestamp = new Date().toISOString();
  const createdOrder: T_Order = {
    ...order,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const storedOrders = loadStoredOrders();
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
