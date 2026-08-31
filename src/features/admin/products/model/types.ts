import type { T_ProductStockStatus } from "@/entities/product/model/types";

export type T_ProductSearchField =
  | "title"
  | "sku"
  | "category"
  | "price"
  | "stock";

export type T_ProductStockFilter = T_ProductStockStatus | "all";

export type T_ProductsSort =
  | "default"
  | "name-asc"
  | "name-desc"
  | "status-asc";
