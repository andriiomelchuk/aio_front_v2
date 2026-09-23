import type {
  T_CreateOrderDto,
  T_Order,
  T_UpdateOrderDto,
  T_UpdateOrderOptions,
} from "@/entities/order";
import { mockOrders } from "@/entities/order";
import { OrdersApiError, type T_GetOrdersParams, type T_OrdersApiContract } from "./types";
import { readSiteSettings } from "@/shared/api/siteSettings";
import { finalizeOrderStock, replaceOrderStockReservation, reserveOrderStock } from "@/shared/api/warehouse";

const ORDERS_STORAGE_KEY = "orders";
const createId = () => typeof crypto !== "undefined" && "randomUUID" in crypto
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random()}`;
const getStorage = () => typeof window === "undefined" ? undefined : window.localStorage;

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
  if (!order.items.length || !order.customer.email.trim() || !Number.isFinite(order.totals.total)) {
    throw new OrdersApiError("INVALID_INPUT", "Order customer, items and totals are required");
  }
  const timestamp = new Date().toISOString();
  const storedOrders = loadStoredOrders();
  const createdOrder: T_Order = {
    ...order,
    id: createOrderNumber(storedOrders),
    status: "new",
    statusHistory: [{ id: createId(), to: "new", createdAt: timestamp, createdBy: "Checkout" }],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  reserveOrderStock(String(createdOrder.id), createdOrder.items ?? [], "Checkout");

  try {
    getStorage()?.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify([...storedOrders, createdOrder]),
    );
  } catch (error) {
    throw new OrdersApiError("STORAGE_WRITE_FAILED", "Could not save order", { cause: error });
  }

  return createdOrder;
};

export const getOrders = async (
  params: T_GetOrdersParams = {},
): Promise<T_Order[]> => {
  const normalizedEmail = params.customerEmail?.trim().toLocaleLowerCase();
  return loadStoredOrders()
    .filter(
      (order) =>
        ((!params.customerId && !normalizedEmail) ||
          order.customerId === params.customerId ||
          order.customer?.email.trim().toLocaleLowerCase() === normalizedEmail) &&
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

  if (!order) throw new OrdersApiError("NOT_FOUND", "Order not found");
  return order;
};

export const updateOrder = async (order: T_UpdateOrderDto, options: T_UpdateOrderOptions = {}): Promise<T_Order> => {
  const orders = loadStoredOrders();
  const previousOrder = orders.find((item) => String(item.id) === String(order.id));
  if (!previousOrder) throw new OrdersApiError("NOT_FOUND", "Order not found");
  const timestamp = new Date().toISOString();
  const nextStatus = order.status ?? previousOrder.status;
  const statusChanged = previousOrder.status !== nextStatus;
  if (statusChanged && (previousOrder.status === "completed" || previousOrder.status === "cancelled")) {
    throw new OrdersApiError("INVALID_STATE", "A finalized order cannot return to an active workflow");
  }
  const nextItems = order.items ?? previousOrder.items ?? [];
  const itemsChanged = JSON.stringify(previousOrder.items ?? []) !== JSON.stringify(nextItems);
  const updatedOrder: T_Order = {
    ...previousOrder,
    ...order,
    id: previousOrder.id,
    createdAt: previousOrder.createdAt,
    statusHistory: statusChanged
      ? [{
          id: createId(),
          from: previousOrder.status,
          to: nextStatus,
          createdAt: timestamp,
          createdBy: options.updatedBy?.trim() || "Administrator",
        }, ...(previousOrder.statusHistory ?? [])]
      : previousOrder.statusHistory ?? [],
    updatedAt: timestamp,
  };
  if (itemsChanged && (previousOrder.status === "new" || previousOrder.status === "processing")) {
    replaceOrderStockReservation(String(order.id), nextItems, options.updatedBy);
  }
  if (statusChanged) {
    const actor = options.updatedBy?.trim() || "Administrator";
    if (nextStatus === "completed") finalizeOrderStock(String(order.id), "sale", actor);
    if (nextStatus === "cancelled") finalizeOrderStock(String(order.id), "release", actor);
  }
  const nextOrders = orders.map((item) => String(item.id) === String(order.id) ? updatedOrder : item);

  try {
    getStorage()?.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
  } catch (error) {
    throw new OrdersApiError("STORAGE_WRITE_FAILED", "Could not save order", { cause: error });
  }
  return updatedOrder;
};

const loadStoredOrders = (): T_Order[] => {
  const rawOrders = getStorage()?.getItem(ORDERS_STORAGE_KEY);

  if (!rawOrders) return mockOrders;

  try {
    const orders: unknown = JSON.parse(rawOrders);

    return Array.isArray(orders) ? (orders as T_Order[]).map((order) => ({
      ...order,
      statusHistory: order.statusHistory ?? [],
    })) : mockOrders;
  } catch {
    return mockOrders;
  }
};

export const ordersApi = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
} satisfies T_OrdersApiContract;
