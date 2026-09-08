import type { T_CartState } from "./types";

export const saveCartToStorage = (cart: T_CartState) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("cart", JSON.stringify(cart));
};

export const loadCartFromStorage = (): T_CartState | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    const rawCart = localStorage.getItem("cart");

    if (!rawCart) return undefined;

    const parsedCart: unknown = JSON.parse(rawCart);

    if (!isCartState(parsedCart)) {
      localStorage.removeItem("cart");

      return undefined;
    }

    return parsedCart;
  } catch {
    localStorage.removeItem("cart");

    return undefined;
  }
};

const isCartState = (value: unknown): value is T_CartState => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    "products" in value &&
    Array.isArray(value.products)
  );
}