"use client";

import { Button } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { CartIcon } from "@/components/Products/icons";
import { useCart } from "../../model/useCart";
import type { T_AddToCartButtonProps } from "../../model/types";

export const AddToCartButton = ({
  product,
  disabled = false,
}: T_AddToCartButtonProps) => {
  const { t } = useI18n();
  const { addToCart } = useCart();

  return (
    <Button
      type="button"
      disabled={disabled}
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center px-0"
      aria-label={t("products.addToCart")}
      onClick={() => addToCart(product)}
    >
      <CartIcon />
    </Button>
  );
};