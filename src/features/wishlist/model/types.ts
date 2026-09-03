import type { T_Product } from "@/entities/product/model/types";

export type T_WishlistItem = {
  product: T_Product;
};

export type T_WishlistState = {
  productIds: string[];
};