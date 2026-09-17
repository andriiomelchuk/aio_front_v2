import { describe, expect, it } from "vitest";
import type { T_Product } from "@/entities/product/model/types";
import { catalogProducts } from "./catalogProducts";
import type { T_CatalogParams } from "./types";
import { getProductStockStatus } from "./productAvailability";

const createProduct = (
  id: string,
  changes: Partial<T_Product> = {},
): T_Product => ({
  id,
  title: `Product ${id}`,
  slug: `product-${id}`,
  sku: `SKU-${id}`,
  description: "Description",
  price: 100,
  currency: "USD",
  stockQuantity: 5,
  stockStatus: "in_stock",
  categoryId: "phones",
  status: "active",
  thumbnail: "",
  images: [],
  attributes: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...changes,
});

const params: T_CatalogParams = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  stock: "all",
  discountOnly: false,
  sort: "name-asc",
  page: 1,
  pageSize: 12,
};

describe("catalogProducts", () => {
  it("searches without depending on letter case", () => {
    const products = [createProduct("1", { title: "Premium Phone" })];

    expect(catalogProducts(products, { ...params, search: "pReMiUm" })).toHaveLength(1);
  });

  it("filters by discounted price and stock", () => {
    const products = [
      createProduct("1", { price: 100, discountPercentage: 20 }),
      createProduct("2", { price: 70, stockStatus: "out_of_stock" }),
    ];

    const result = catalogProducts(products, {
      ...params,
      minPrice: "75",
      maxPrice: "85",
      stock: "in_stock",
      discountOnly: true,
    });

    expect(result.map(({ id }) => id)).toEqual(["1"]);
  });

  it("excludes products that are not active", () => {
    const products = [createProduct("1", { status: "draft" })];

    expect(catalogProducts(products, params)).toEqual([]);
  });

  it("hides out-of-stock products when the site setting is disabled", () => {
    const products = [createProduct("1", { stockStatus: "out_of_stock", stockQuantity: 0 })];

    expect(catalogProducts(products, params, { showOutOfStockProducts: false })).toEqual([]);
  });

  it("calculates low stock from the configured threshold", () => {
    expect(getProductStockStatus(0, 5)).toBe("out_of_stock");
    expect(getProductStockStatus(5, 5)).toBe("low_stock");
    expect(getProductStockStatus(6, 5)).toBe("in_stock");
  });
});
