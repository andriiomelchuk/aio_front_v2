import type { T_Product } from "@/entities/product/model/types";
import type { T_CatalogParams } from "./types";

const getFinalPrice = (product: T_Product) =>
  product.price * (1 - (product.discountPercentage ?? 0) / 100);

export const catalogProducts = (
  products: T_Product[],
  params: T_CatalogParams,
  options: { showOutOfStockProducts?: boolean } = {},
) => {
  const normalizedSearch = params.search.trim().toLocaleLowerCase();
  const minPrice = params.minPrice === "" ? null : Number(params.minPrice);
  const maxPrice = params.maxPrice === "" ? null : Number(params.maxPrice);

  const filteredProducts = products.filter((product) => {
    const searchableValue = [product.title, product.brand, product.sku]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    const finalPrice = getFinalPrice(product);

    return (
      product.status === "active" &&
      (options.showOutOfStockProducts !== false || product.stockStatus !== "out_of_stock") &&
      (!normalizedSearch || searchableValue.includes(normalizedSearch)) &&
      (!params.category ||
        product.categoryId.toLocaleLowerCase() ===
          params.category.toLocaleLowerCase()) &&
      (minPrice === null || Number.isNaN(minPrice) || finalPrice >= minPrice) &&
      (maxPrice === null || Number.isNaN(maxPrice) || finalPrice <= maxPrice) &&
      (params.stock === "all" || product.stockStatus === params.stock) &&
      (!params.discountOnly || (product.discountPercentage ?? 0) > 0)
    );
  });

  return [...filteredProducts].sort((first, second) => {
    switch (params.sort) {
      case "name-desc":
        return second.title.localeCompare(first.title);
      case "price-asc":
        return getFinalPrice(first) - getFinalPrice(second);
      case "price-desc":
        return getFinalPrice(second) - getFinalPrice(first);
      default:
        return first.title.localeCompare(second.title);
    }
  });
};
