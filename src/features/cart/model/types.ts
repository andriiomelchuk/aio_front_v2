import type { T_Product } from "@/entities/product/model/types";

export type T_CartItem = {
  product: T_Product;
  quantity: number;
};

export type T_AddToCartButtonProps = {
  product: T_Product;
  disabled?: boolean;
};

export type T_CartState = {
  products: T_CartItem[];
};