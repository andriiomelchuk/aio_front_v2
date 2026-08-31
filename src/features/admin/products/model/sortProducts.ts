import type { T_Product } from "@/entities/product/model/types";
import type { T_ProductsSort } from "./types";


export const sortProducts = (
  products: T_Product[],
  sort: T_ProductsSort,
): T_Product[] => {
  const sortedProducts = [...products];

  switch (sort) {
    case "name-asc":
      return sortedProducts.sort((a, b) => a.title.localeCompare(b.title));

    case "name-desc":
      return sortedProducts.sort((a, b) => b.title.localeCompare(a.title));

    case "status-asc":
      return sortedProducts.sort((a, b) => a.status.localeCompare(b.status));

    default:
      return sortedProducts;
  }
};
