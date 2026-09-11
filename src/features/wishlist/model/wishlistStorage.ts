import type { T_WishlistState } from "./types";

const WISHLIST_STORAGE_KEY = "wishlist";

export const saveWishlistToStorage = (wishlist: T_WishlistState) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
};

export const loadWishlistFromStorage = (): T_WishlistState | undefined => {
  if (typeof window === "undefined") return undefined;

  try {
    const rawWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);

    if (!rawWishlist) return undefined;

    const parsedWishlist: unknown = JSON.parse(rawWishlist);

    if (!isWishlistState(parsedWishlist)) {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);

      return undefined;
    }

    return parsedWishlist;
  } catch {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);

    return undefined;
  }
};

const isWishlistState = (value: unknown): value is T_WishlistState => {
  if (!value || typeof value !== "object" || !("productIds" in value)) {
    return false;
  }

  return (
    Array.isArray(value.productIds) &&
    value.productIds.every((productId) => typeof productId === "string")
  );
};
