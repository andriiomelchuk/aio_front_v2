"use client";
import Link from "next/link";
import { useI18n } from "@/shared/i18n";
import type { T_ProductCardProps } from "./types";
import { Button } from "@/shared/ui";
import { HeartIcon } from "./icons";
import { AddToCartButton } from "@/features/cart";
import { AddToWishlistButton } from "@/features/wishlist/ui/AddToWishlistButton";
import { CompareToggleButton } from "@/features/comparison/ui/CompareToggleButton";

export const ProductCard = ({ product }: T_ProductCardProps) => {
  const { t } = useI18n();

  const isAvailable = product.stockStatus !== "out_of_stock";
  const actionButtonClass =
    "inline-flex h-12 w-12 shrink-0 items-center justify-center px-0";

  const mainImage =
    product.images.find((image) => image.isMain)?.url ?? product.thumbnail;

  const hasDiscount = Boolean(product.discountPercentage || product.oldPrice);

  const finalPrice = product.discountPercentage
    ? product.price - (product.price * product.discountPercentage) / 100
    : product.price;

  const stockLabel = {
    in_stock: t("products.stock.inStock"),
    low_stock: t("products.stock.lowStock"),
    out_of_stock: t("products.stock.outOfStock"),
  }[product.stockStatus];

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-accent">
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-surface-muted">
          {mainImage ? (
            <img
              src={mainImage}
              alt={t("products.imageAlt", { title: product.title })}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-3 text-center text-sm text-muted">
              {t("products.noImage")}
            </div>
          )}
        </div>

        <div className="p-4">
          <h2 className="line-clamp-2 h-12 text-base font-semibold leading-6 text-foreground">
            {product.title}
          </h2>

          {product.brand && (
            <p className="mt-1 truncate text-sm text-muted">{product.brand}</p>
          )}

          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <div className="text-lg font-bold text-foreground">
                {finalPrice.toFixed(2)} {product.currency}
              </div>

              {hasDiscount && (
                <div className="mt-1 flex items-center gap-2 text-sm">
                  {product.oldPrice && (
                    <span className="text-muted line-through">
                      {product.oldPrice.toFixed(2)} {product.currency}
                    </span>
                  )}

                  {product.discountPercentage && (
                    <span className="font-semibold text-accent">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </div>
              )}
            </div>

            <span className="shrink-0 rounded-full border border-border px-2 py-1 text-xs text-muted">
              {stockLabel}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex gap-2 border-t border-border p-4 pt-3">
        {isAvailable ? (
          <AddToCartButton product={product} />
        ) : (
          <Button
            type="button"
            variant="secondary"
            aria-label={t("products.addToWishlist")}
            className={actionButtonClass}
          >
            <HeartIcon />
          </Button>
        )}

        <CompareToggleButton product={product} />

        <AddToWishlistButton product={product} />
      </div>
    </article>
  );
};
