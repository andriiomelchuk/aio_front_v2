import type { T_CartItem } from "./types";

export const calculateCartTotals = (items: T_CartItem[]) => {
  const subtotal = items.reduce((sum, item) => {
    const basePrice = item.product.oldPrice ?? item.product.price;

    return sum + basePrice * item.quantity;
  }, 0);

  const itemsTotal = items.reduce((sum, item) => {
    const discountPercentage = item.product.discountPercentage ?? 0;
    const finalPrice = item.product.price * (1 - discountPercentage / 100);

    return sum + finalPrice * item.quantity;
  }, 0);

  return {
    subtotal,
    discount: Math.max(0, subtotal - itemsTotal),
    itemsTotal,
  };
};
