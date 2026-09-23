import type { T_CartItem } from "./types";
import { getCartItemPricing } from "./cartItem";

export const calculateCartTotals = (items: T_CartItem[]) => {
  const subtotal = items.reduce((sum, item) => {
    const pricing = getCartItemPricing(item);
    const basePrice = pricing.oldPrice ?? pricing.price;

    return sum + basePrice * item.quantity;
  }, 0);

  const itemsTotal = items.reduce((sum, item) => {
    const pricing = getCartItemPricing(item);
    const discountPercentage = pricing.discountPercentage ?? 0;
    const finalPrice = pricing.price * (1 - discountPercentage / 100);

    return sum + finalPrice * item.quantity;
  }, 0);

  return {
    subtotal,
    discount: Math.max(0, subtotal - itemsTotal),
    itemsTotal,
  };
};
