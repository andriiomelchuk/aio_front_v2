"use client";

import { Button, useToast } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { CartIcon } from "@/components/Products/icons";
import { useCart } from "../../model/useCart";
import type { T_AddToCartButtonProps } from "../../model/types";

export const AddToCartButton = ({
  product,
  disabled = false,
}: T_AddToCartButtonProps) => {
  const { t } = useI18n();
  const { addToCart, getCartItemQuantity } = useCart();
  const { showToast } = useToast();
  const isCartLimitReached =
    getCartItemQuantity(product.id) >= product.stockQuantity;

  const handleAddToCart = () => {
    addToCart(product);
    showToast({ message: t("notifications.cart.added") });
  };

  return (
    <Button
      type="button"
      disabled={disabled || isCartLimitReached}
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center px-0"
      aria-label={t("products.addToCart")}
      onClick={handleAddToCart}
    >
      <CartIcon />
    </Button>
  );
};
