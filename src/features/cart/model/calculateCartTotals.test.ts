import { describe, expect, it } from "vitest";
import type { T_Product } from "@/entities/product/model/types";
import { calculateCartTotals } from "./calculateCartTotals";

const product = {
  price: 100,
  discountPercentage: 15,
} as T_Product;

describe("calculateCartTotals", () => {
  it("calculates subtotal, discount, and final items total", () => {
    expect(calculateCartTotals([{ product, quantity: 2 }])).toEqual({
      subtotal: 200,
      discount: 30,
      itemsTotal: 170,
    });
  });

  it("returns zero totals for an empty cart", () => {
    expect(calculateCartTotals([])).toEqual({
      subtotal: 0,
      discount: 0,
      itemsTotal: 0,
    });
  });

  it("uses the selected variant price", () => {
    const productWithVariant = {
      ...product,
      variants: [{ id: "variant-1", sku: "V-1", title: "Variant", price: 80, discountPercentage: 25, stockQuantity: 5, stockStatus: "in_stock", attributes: [] }],
    } as T_Product;

    expect(calculateCartTotals([{ product: productWithVariant, variantId: "variant-1", quantity: 2 }])).toEqual({
      subtotal: 160,
      discount: 40,
      itemsTotal: 120,
    });
  });
});
