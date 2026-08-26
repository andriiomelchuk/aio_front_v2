import type { T_Order, T_OrderStatus } from "@/entities/order";

export const ordersFilter = (orders: T_Order[], params: {status: T_OrderStatus | "all"; search: string}): T_Order[] => {
    const normalizedSearch = params.search.trim();

  return orders.filter((order) => {
    const matchesStatus =
      params.status === "all" || order.status === params.status;

    const matchesSearch =
      normalizedSearch === "" ||
      order.id.toString().includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });
}
