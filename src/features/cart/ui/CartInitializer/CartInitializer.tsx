"use client";

import { useEffect } from "react";
import { useCart } from "../../model/useCart";

export const CartInitializer = () => {
  const { restoreCartFromStorage } = useCart();

  useEffect(() => {
    restoreCartFromStorage();
  }, [restoreCartFromStorage]);

  return null;
};