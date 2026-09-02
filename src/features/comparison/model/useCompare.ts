import type { T_Product } from "@/entities/product/model/types";

const compareProductIds = new Set<string>();

export const useCompare = () => {
  const addToCompare = (product: T_Product) => {
    compareProductIds.add(product.id);
    console.log("Add to compare:", product.id);
  };

  const removeFromCompare = (product: T_Product) => {
    compareProductIds.delete(product.id);
    console.log("Remove from compare:", product.id);
  };

  const isInCompare = (productId: string) => {
    return compareProductIds.has(productId);
  };

  return {
    addToCompare,
    removeFromCompare,
    isInCompare,
  };
};