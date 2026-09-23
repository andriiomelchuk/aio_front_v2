import type { T_Order } from "@/entities/order";

const validDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const startOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const calculateOrderMetrics = (orders: T_Order[], now = new Date()) => {
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const revenueByCurrency: Record<string, number> = {};

  let ordersThisWeek = 0;
  orders.forEach((order) => {
    const createdAt = validDate(order.createdAt);
    if (createdAt && createdAt >= weekStart && createdAt <= now) ordersThisWeek += 1;
    if (order.status !== "completed" || !createdAt || createdAt < monthStart || createdAt >= nextMonthStart) return;
    const currency = order.currency ?? "USD";
    revenueByCurrency[currency] = (revenueByCurrency[currency] ?? 0) + (order.totals?.total ?? order.price);
  });

  return {
    activeOrders: orders.filter(({ status }) => status === "new" || status === "processing").length,
    ordersThisWeek,
    revenueByCurrency,
  };
};
