import { isAnyOf, type Middleware } from "@reduxjs/toolkit";
import { saveCartToStorage } from "./cartStorage";
import { addCartItem, decreaseCartItemQuantity, increaseCartItemQuantity, removeAllCartItems, removeCartItem, setCartItemQuantity } from "./cartSlice";


const isCartAction = isAnyOf(
  addCartItem,
  removeCartItem,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  setCartItemQuantity,
  removeAllCartItems,
);

export const cartMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if(isCartAction(action)) {
    saveCartToStorage(store.getState().cart);
  }
  return result;
}