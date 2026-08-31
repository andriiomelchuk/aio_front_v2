import type {
  T_Product,
  T_ProductStatus,
} from "@/entities/product/model/types";
import type {
  T_ProductSearchField,
  T_ProductStockFilter,
} from "./types";


export const filterProducts = (products: T_Product[], params: {
  status: T_ProductStatus | "all";
  search: string,
  stock?: T_ProductStockFilter,
  searchField: T_ProductSearchField;
}): T_Product[] => {
  const normalizedSearch = params.search.trim().toLowerCase();

  return products.filter((product) => {
    const matchesStatus =
      params.status === "all" || product.status === params.status;

    const matchesStockStatus =
      !params.stock ||
      params.stock === "all" ||
      product.stockStatus === params.stock;

    const matchesSearch =
      normalizedSearch === "" ||
      (() => {
        switch (params.searchField) {
          case "title":
            return product.title.toLowerCase().includes(normalizedSearch);

          case "sku":
            return product.sku.toLowerCase().includes(normalizedSearch);

          case "category":
            return product.categoryId.toLowerCase().includes(normalizedSearch);

          case "price":
            return String(product.price).includes(normalizedSearch);

          case "stock":
            return String(product.stockQuantity).includes(normalizedSearch);

          default:
            return true;
        }
      })();

    return matchesStatus && matchesSearch && matchesStockStatus;
  });
}
