import type { T_Product } from "@/entities/product/model/types";

export type T_ComparisonItemProps = {
  product: T_Product;
  priceCalc: (price: number, discountPercentage?: number) => number;
};

export type T_ComparisonTableProps = {
  products: T_Product[];
  priceCalc: (price: number, discountPercentage?: number) => number;
};