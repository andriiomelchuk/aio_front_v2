import type { T_Product } from "@/entities/product/model/types";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { addCartItem, decreaseCartItemQuantity, increaseCartItemQuantity, removeAllCartItems, removeCartItem, setCartItemQuantity } from "./cartSlice";


export const useCart = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.cart.products);

  const addToCart = (product: T_Product, quantity = 1) => {
    dispatch(addCartItem({ product, quantity }));
    console.log("Add to cart:", product, "Quantity:", quantity);
    console.log("Current cart products:", products);
  };

  const removeFromCart = (product: T_Product) => {
    dispatch(removeCartItem(product.id));
    console.log("Delete from cart:", product);
  };

  const increaseQuantity = (product: T_Product, quantity: number) => {
    dispatch(increaseCartItemQuantity(product.id));
    console.log("Increase cart item quantity:", product, "Quantity:", quantity);
  };

  const decreaseQuantity = (product: T_Product, quantity: number) => {
    dispatch(decreaseCartItemQuantity(product.id));
    console.log("Decrease cart item quantity:", product, "Quantity:", quantity);
  };

  const setQuantity = (product: T_Product, quantity: number) => {
    dispatch(setCartItemQuantity({ productId: product.id, quantity }));
    console.log("Set cart item quantity:", product, "Quantity:", quantity);
  };

  const clearCart = () => {
    dispatch(removeAllCartItems());
  };

  return {
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    setQuantity,
    clearCart,
  };
};

