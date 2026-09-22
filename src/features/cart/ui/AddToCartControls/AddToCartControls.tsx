"use client";

import { useState } from "react";
import { Button, useToast } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { useCart } from "../../model/useCart";
import type { T_AddToCartControlProps } from "./types";
import { useSiteSettings } from "@/shared/siteSettings";

export const AddToCartControl = ({
  product,
  disabled = false,
  maxQuantity,
  variantId,
}: T_AddToCartControlProps) => {
  const { t } = useI18n();
  const { addToCart, getCartItemQuantity } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const settings = useSiteSettings();
  const quantityInCart = getCartItemQuantity(product.id, variantId);
  const stockQuantity = maxQuantity ?? product.stockQuantity;
  const availableQuantity = settings.commerce.allowBackorders
    ? Math.max(0, (maxQuantity ?? 99) - quantityInCart)
    : Math.max(0, stockQuantity - quantityInCart);

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(availableQuantity, current + 1));
  };

  const handleAddToCart = () => {
    const quantityToAdd = Math.min(quantity, availableQuantity);

    if (quantityToAdd <= 0) return;

    addToCart(product, quantityToAdd, variantId);
    showToast({
      message: t("notifications.cart.addedWithQuantity", {
        count: quantityToAdd,
      }),
    });
  };

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div>
        <div className="flex h-12 overflow-hidden rounded-md border border-border">
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-12 rounded-none px-0"
            disabled={disabled || quantity <= 1}
            onClick={decreaseQuantity}
            aria-label={t("products.quantityDecrease")}
          >
            -
          </Button>

          <span className="flex h-12 min-w-14 items-center justify-center border-x border-border px-4 font-semibold text-foreground">
            {quantity}
          </span>

          <Button
            type="button"
            variant="ghost"
            className="h-12 w-12 rounded-none px-0"
            disabled={disabled || quantity >= availableQuantity}
            onClick={increaseQuantity}
            aria-label={t("products.quantityIncrease")}
          >
            +
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          {t("cart.item.maxAvailable", {
            count: availableQuantity,
          })}
        </p>
      </div>

      <Button
        type="button"
        disabled={disabled || availableQuantity === 0}
        className="h-12 flex-1 px-5 sm:flex-none"
        onClick={handleAddToCart}
      >
        {t("products.addToCart")}
      </Button>
    </div>
  );
};
