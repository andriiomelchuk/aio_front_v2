import type { T_Product } from "@/entities/product/model/types";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { addCartItem, decreaseCartItemQuantity, increaseCartItemQuantity, removeAllCartItems, removeCartItem, restoreCart, setCartItemQuantity } from "./cartSlice";
import { loadCartFromStorage } from "./cartStorage";
import { useCallback } from "react";
import { useSiteSettings } from "@/shared/siteSettings";


export const useCart = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.cart.products);
  const settings = useSiteSettings();

  const getCartItemQuantity = (productId: string, variantId?: string) =>
    products.find((item) => item.product.id === productId && item.variantId === variantId)?.quantity ?? 0;

  const addToCart = (product: T_Product, quantity = 1, variantId?: string) => {
    dispatch(addCartItem({ product, variantId, quantity, allowBackorders: settings.commerce.allowBackorders }));

  };

  const removeFromCart = (product: T_Product, variantId?: string) => {
    dispatch(removeCartItem({ productId: product.id, variantId }));
  };

  const increaseQuantity = (product: T_Product, variantId?: string) => {
    dispatch(increaseCartItemQuantity({ productId: product.id, variantId, allowBackorders: settings.commerce.allowBackorders }));
  };

  const decreaseQuantity = (product: T_Product, variantId?: string) => {
    dispatch(decreaseCartItemQuantity({ productId: product.id, variantId }));
  };

  const setQuantity = (product: T_Product, quantity: number, variantId?: string) => {
    dispatch(setCartItemQuantity({ productId: product.id, variantId, quantity, allowBackorders: settings.commerce.allowBackorders }));
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
