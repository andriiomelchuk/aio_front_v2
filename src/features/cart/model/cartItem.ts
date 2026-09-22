import type { T_ProductVariant } from "@/entities/product";
import type { T_CartItem, T_CartLineReference } from "./types";

export const isSameCartLine = (
  item: T_CartItem,
  reference: T_CartLineReference,
) =>
  item.product.id === reference.productId &&
  item.variantId === reference.variantId;

export const getCartItemVariant = (
  item: T_CartItem,
): T_ProductVariant | undefined =>
  item.product.variants?.find((variant) => variant.id === item.variantId);

export const getCartItemStockQuantity = (item: T_CartItem) =>
  getCartItemVariant(item)?.stockQuantity ?? item.product.stockQuantity;

export const getCartItemPricing = (item: T_CartItem) => {
  const variant = getCartItemVariant(item);

  return {
    price: variant?.price ?? item.product.price,
    oldPrice: variant?.oldPrice ?? item.product.oldPrice,
    discountPercentage:
      variant?.discountPercentage ?? item.product.discountPercentage,
  };
};

export const getCartLineKey = (item: T_CartItem) =>
  `${item.product.id}:${item.variantId ?? "base"}`;
