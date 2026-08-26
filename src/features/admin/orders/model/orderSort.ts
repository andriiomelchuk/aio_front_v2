import type { T_Order, T_OrderSort } from "@/entities/order";

export const orderSort = (orders: T_Order[], sort: T_OrderSort): T_Order[] => {
    const sortedOrders = [...orders];

    switch (sort) {
        case "price-asc":
            return sortedOrders.sort((a, b) => a.price - b.price);

        case "price-desc":
            return sortedOrders.sort((a, b) => b.price - a.price);

        case "id-asc":
            return sortedOrders.sort((a, b) => Number(a.id) - Number(b.id));

        case "id-desc":
            return sortedOrders.sort((a, b) => Number(b.id) - Number(a.id));

        default:
            return sortedOrders;
    }
}
