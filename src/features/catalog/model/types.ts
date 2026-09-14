import type { T_ProductStockStatus } from "@/entities/product/model/types";

export type T_CatalogSort =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc";

export type T_CatalogStock = T_ProductStockStatus | "all";

export type T_CatalogParams = {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  stock: T_CatalogStock;
  discountOnly: boolean;
  sort: T_CatalogSort;
  page: number;
  pageSize: number;
};
