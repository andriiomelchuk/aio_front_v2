"use client";

import { useState } from "react";
import { Button } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { useCart } from "../../model/useCart";
import type { T_AddToCartControlProps } from "./types";

export const AddToCartControl = ({
  product,
  disabled = false,
  maxQuantity = product.stockQuantity,
}: T_AddToCartControlProps) => {
  const { t } = useI18n();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(maxQuantity, current + 1));
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
            disabled={disabled || quantity >= maxQuantity}
            onClick={increaseQuantity}
            aria-label={t("products.quantityIncrease")}
          >
            +
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted">
          {t("cart.item.maxAvailable", {
            count: maxQuantity,
          })}
        </p>
      </div>

      <Button
        type="button"
        disabled={disabled}
        className="h-12 flex-1 px-5 sm:flex-none"
        onClick={() => addToCart(product, quantity)}
      >
        {t("products.addToCart")}
      </Button>
    </div>
  );
};
