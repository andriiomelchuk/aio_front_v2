import type { T_Customer } from "@/entities/customer";
import type { T_Order, T_OrderStatus } from "@/entities/order";
import type { T_ServicesState } from "@/entities/service";
import type { T_User } from "@/entities/user";
import type { T_WarehouseState } from "@/entities/warehouse";

export type T_AnalyticsPeriod = "7" | "30" | "90" | "all";
export type T_AnalyticsInput = { orders: T_Order[]; customers: T_Customer[]; users: T_User[]; warehouse: T_WarehouseState; services: T_ServicesState; period: T_AnalyticsPeriod; now?: Date };

const valueOfOrder = (order: T_Order) => order.totals?.total ?? order.price;
const toTime = (value: string) => { const legacy = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value); return legacy ? new Date(Number(legacy[3]), Number(legacy[2]) - 1, Number(legacy[1])).getTime() : new Date(value).getTime(); };
const dayKey = (value: string) => { const time = toTime(value); return Number.isNaN(time) ? "" : new Date(time).toISOString().slice(0, 10); };
const inRange = (value: string, start?: number, end?: number) => { const time = toTime(value); return !Number.isNaN(time) && (!start || time >= start) && (!end || time < end); };
const delta = (current: number, previous: number) => previous ? ((current - previous) / previous) * 100 : current ? 100 : 0;

export const calculateAnalytics = ({ orders, customers, users, warehouse, services, period, now = new Date() }: T_AnalyticsInput) => {
  const days = period === "all" ? undefined : Number(period); const end = now.getTime(); const start = days ? end - days * 86_400_000 : undefined; const previousStart = days && start ? start - days * 86_400_000 : undefined;
  const currentOrders = orders.filter((item) => inRange(item.createdAt, start, end)); const previousOrders = orders.filter((item) => inRange(item.createdAt, previousStart, start));
  const completed = currentOrders.filter((item) => item.status === "completed"); const previousCompleted = previousOrders.filter((item) => item.status === "completed");
  const revenue = completed.reduce((sum, item) => sum + valueOfOrder(item), 0); const previousRevenue = previousCompleted.reduce((sum, item) => sum + valueOfOrder(item), 0);
  const currentCustomers = customers.filter((item) => inRange(item.createdAt, start, end)); const appointments = services.appointments.filter((item) => inRange(item.createdAt, start, end));
  const lowStock = warehouse.balances.filter((item) => item.condition === "sellable" && item.physical - item.reserved <= 5).length;
  const statusCounts = (["new", "processing", "completed", "cancelled"] as T_OrderStatus[]).map((status) => ({ status, count: currentOrders.filter((item) => item.status === status).length }));
  const productTotals = new Map<string, { title: string; quantity: number; revenue: number }>(); completed.flatMap((item) => item.items ?? []).forEach((item) => { const current = productTotals.get(item.productId) ?? { title: item.title, quantity: 0, revenue: 0 }; current.quantity += item.quantity; current.revenue += item.unitPrice * item.quantity; productTotals.set(item.productId, current); });
  const trendDays = days ? Math.min(days, 30) : 30; const trend = Array.from({ length: trendDays }, (_, index) => { const date = new Date(end - (trendDays - index - 1) * 86_400_000); const key = date.toISOString().slice(0, 10); const daily = completed.filter((item) => dayKey(item.createdAt) === key); return { date: key, revenue: daily.reduce((sum, item) => sum + valueOfOrder(item), 0), orders: daily.length }; });
  const staff = users.map((user) => ({ id: user.id, name: user.name, role: user.role, actions: [...orders.flatMap((item) => item.statusHistory ?? []), ...services.appointments.flatMap((item) => item.statusHistory)].filter((entry) => entry.createdBy === user.name && inRange(entry.createdAt, start, end)).length })).sort((a, b) => b.actions - a.actions).slice(0, 6);
  return {
    currency: currentOrders[0]?.currency ?? orders[0]?.currency ?? "USD", revenue, revenueDelta: delta(revenue, previousRevenue), orders: currentOrders.length, ordersDelta: delta(currentOrders.length, previousOrders.length), averageOrder: completed.length ? revenue / completed.length : 0,
    customers: currentCustomers.length, totalCustomers: customers.length, activeOrders: currentOrders.filter((item) => item.status === "new" || item.status === "processing").length,
    appointments: appointments.length, completedAppointments: appointments.filter((item) => item.status === "completed").length, lowStock, availableStock: warehouse.balances.reduce((sum, item) => sum + Math.max(0, item.physical - item.reserved), 0),
    statusCounts, trend, topProducts: [...productTotals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5), staff,
  };
};
