import type { T_Product, T_ProductStockStatus } from "@/entities/product/model/types";

export const getProductStockStatus = (
  stockQuantity: number,
  lowStockThreshold: number,
): T_ProductStockStatus => {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= lowStockThreshold) return "low_stock";
  return "in_stock";
};

export const withCalculatedStockStatus = (
  product: T_Product,
  lowStockThreshold: number,
): T_Product => ({
  ...product,
  stockStatus: getProductStockStatus(product.stockQuantity, lowStockThreshold),
});

export const canPurchaseProduct = (
  product: T_Product,
  allowBackorders: boolean,
) => product.stockQuantity > 0 || allowBackorders;
