import type { T_Product } from "@/entities/product/model/types";

export const useCart = () => {
  const addToCart = (product: T_Product, quantity = 1) => {
    console.log("Add to cart:", product, "Quantity:", quantity);
  };

  const removeFromCart = (product: T_Product) => {
    console.log("Delete from cart:", product);
  };

  const increaseQuantity = (product: T_Product, quantity: number) => {
    console.log("Increase cart item quantity:", product, "Quantity:", quantity);
  };

  const decreaseQuantity = (product: T_Product, quantity: number) => {
    console.log("Decrease cart item quantity:", product, "Quantity:", quantity);
  };

  const setQuantity = (product: T_Product, quantity: number) => {
    console.log("Set cart item quantity:", product, "Quantity:", quantity);
  };

  const clearCart = () => {
    console.log("Clear cart");
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

