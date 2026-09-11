import { isAnyOf, type Middleware } from "@reduxjs/toolkit";
import { clearWishlist, toggleWishlist } from "./wishlistSlice";
import { saveWishlistToStorage } from "./wishlistStorage";

const isWishlistAction = isAnyOf(clearWishlist, toggleWishlist);

export const wishlistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (isWishlistAction(action)) {
    saveWishlistToStorage(store.getState().wishlist);
  }

  return result;
};
