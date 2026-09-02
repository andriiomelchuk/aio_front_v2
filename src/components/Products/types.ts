import type { T_Product } from "@/entities/product/model/types";

export type T_ProductCardProps = {
  product: T_Product;
  onAddToCart?: (product: T_Product) => void;
  onAddToWishlist?: (product: T_Product) => void;
  onAddToCompare?: (product: T_Product) => void;
};

export type T_ProductDetailProps = {
  product: T_Product;
};


