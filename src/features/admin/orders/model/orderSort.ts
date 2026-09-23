import type { T_Order } from "@/entities/order";
import type { T_OrderSort } from "./types";

export const orderSort = (orders: T_Order[], sort: T_OrderSort): T_Order[] => {
    const sortedOrders = [...orders];

    switch (sort) {
        case "price-asc":
            return sortedOrders.sort((a, b) => a.price - b.price);

        case "price-desc":
            return sortedOrders.sort((a, b) => b.price - a.price);

        case "id-asc":
            return sortedOrders.sort((a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

        case "id-desc":
            return sortedOrders.sort((a, b) => String(b.id).localeCompare(String(a.id), undefined, { numeric: true }));

        default:
            return sortedOrders;
    }
}
