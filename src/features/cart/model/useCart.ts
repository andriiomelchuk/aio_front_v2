import type { T_Product } from "@/entities/product/model/types";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { addCartItem, decreaseCartItemQuantity, increaseCartItemQuantity, removeAllCartItems, removeCartItem, restoreCart, setCartItemQuantity } from "./cartSlice";
import { loadCartFromStorage } from "./cartStorage";
import { useCallback } from "react";


export const useCart = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.cart.products);

  const getCartItemQuantity = (productId: string) =>
    products.find((item) => item.product.id === productId)?.quantity ?? 0;

  const addToCart = (product: T_Product, quantity = 1) => {
    dispatch(addCartItem({ product, quantity }));

  };

  const removeFromCart = (product: T_Product) => {
    dispatch(removeCartItem(product.id));
  };

  const increaseQuantity = (product: T_Product) => {
    dispatch(increaseCartItemQuantity(product.id));
  };

  const decreaseQuantity = (product: T_Product) => {
    dispatch(decreaseCartItemQuantity(product.id));
  };

  const setQuantity = (product: T_Product, quantity: number) => {
    dispatch(setCartItemQuantity({ productId: product.id, quantity }));
  };

  const clearCart = () => {
    dispatch(removeAllCartItems());
  };

  const restoreCartFromStorage = useCallback(() => {
    const savedCart = loadCartFromStorage();

    if (!savedCart) return;

    dispatch(restoreCart(savedCart));
  }, [dispatch]);


  return {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    clearCart,
    getCartItemQuantity,
    restoreCartFromStorage
  };
};
