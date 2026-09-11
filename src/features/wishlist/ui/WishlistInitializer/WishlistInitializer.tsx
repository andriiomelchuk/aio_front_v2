"use client";

import { useEffect } from "react";
import { useWishlist } from "../../model/useWishlist";

export const WishlistInitializer = () => {
  const { restoreWishlistFromStorage } = useWishlist();

  useEffect(() => {
    restoreWishlistFromStorage();
  }, [restoreWishlistFromStorage]);

  return null;
};
