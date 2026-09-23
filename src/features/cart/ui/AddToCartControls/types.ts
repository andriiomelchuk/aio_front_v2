import type { T_Product } from "@/entities/product/model/types";

export type T_AddToCartControlProps = {
  product: T_Product;
  disabled?: boolean;
  maxQuantity?: number;
  variantId?: string;
};
