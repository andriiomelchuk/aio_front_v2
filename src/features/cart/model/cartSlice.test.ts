import { describe, expect, it } from "vitest";
import type { T_Product } from "@/entities/product/model/types";
import reducer, {
  addCartItem,
  decreaseCartItemQuantity,
  increaseCartItemQuantity,
  setCartItemQuantity,
} from "./cartSlice";

const createProduct = (stockQuantity = 10): T_Product => ({
  id: "product-1",
  title: "Test product",
  slug: "test-product",
  sku: "TEST-1",
  description: "Test product",
  price: 100,
  discountPercentage: 20,
  currency: "USD",
  stockQuantity,
  stockStatus: "in_stock",
  categoryId: "test",
  status: "active",
  thumbnail: "",
  images: [],
  attributes: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("cartSlice", () => {
  it("adds repeated quantities and limits them by available stock", () => {
    const product = createProduct(5);
    const firstState = reducer(undefined, addCartItem({ product, quantity: 3 }));
    const nextState = reducer(firstState, addCartItem({ product, quantity: 4 }));

    expect(nextState.products[0].quantity).toBe(5);
  });

  it("updates quantity from the supplied value", () => {
    const product = createProduct();
    const initialState = reducer(undefined, addCartItem({ product, quantity: 2 }));
    const nextState = reducer(
      initialState,
      setCartItemQuantity({ productId: product.id, quantity: 7 }),
    );

    expect(nextState.products[0].quantity).toBe(7);
  });

  it("removes an item when its quantity is set to zero", () => {
    const product = createProduct();
    const initialState = reducer(undefined, addCartItem({ product, quantity: 1 }));
    const nextState = reducer(
      initialState,
      setCartItemQuantity({ productId: product.id, quantity: 0 }),
    );

    expect(nextState.products).toHaveLength(0);
  });

  it("does not increase quantity above stock and removes at the lower boundary", () => {
    const product = createProduct(1);
    const initialState = reducer(undefined, addCartItem({ product, quantity: 1 }));
    const limitedState = reducer(initialState, increaseCartItemQuantity({ productId: product.id }));
    const emptyState = reducer(limitedState, decreaseCartItemQuantity(product.id));

    expect(limitedState.products[0].quantity).toBe(1);
    expect(emptyState.products).toHaveLength(0);
  });

  it("allows quantities above stock when backorders are enabled", () => {
    const product = createProduct(0);
    const state = reducer(undefined, addCartItem({ product, quantity: 3, allowBackorders: true }));

    expect(state.products[0].quantity).toBe(3);
  });
});
