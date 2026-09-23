import type { T_Order, T_OrderStatus } from "@/entities/order";

export const ordersFilter = (orders: T_Order[], params: {status: T_OrderStatus | "all"; search: string}): T_Order[] => {
    const normalizedSearch = params.search.trim().toLocaleLowerCase();

  return orders.filter((order) => {
    const matchesStatus =
      params.status === "all" || order.status === params.status;

    const matchesSearch =
      normalizedSearch === "" ||
      [
        order.id,
        order.customer?.firstName,
        order.customer?.lastName,
        order.customer?.email,
        ...(order.items?.flatMap((item) => [item.title, item.sku]) ?? []),
      ].filter(Boolean).join(" ").toLocaleLowerCase().includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });
}
