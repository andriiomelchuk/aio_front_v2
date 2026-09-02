"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";

import { CompareIcon } from "./icons";
import type { T_ProductDetailProps } from "./types";
import { AddToCartControl } from "@/features/cart/ui/AddToCartControls";
import { AddToWishlistButton } from "@/features/wishlist/ui/AddToWishlistButton";


export const ProductDetail = ({ product }: T_ProductDetailProps) => {
  const { t } = useI18n();

  const images = useMemo(() => {
    const galleryImages = product.images.length
      ? product.images
      : [
          {
            id: product.id,
            url: product.thumbnail,
            alt: product.title,
            isMain: true,
          },
        ];

    return [...galleryImages].sort((firstImage, secondImage) => {
      if (firstImage.isMain) {
        return -1;
      }

      if (secondImage.isMain) {
        return 1;
      }

      return (firstImage.sortOrder ?? 0) - (secondImage.sortOrder ?? 0);
    });
  }, [product]);

  const [selectedImageUrl, setSelectedImageUrl] = useState(
    images[0]?.url ?? product.thumbnail,
  );

  const isAvailable = product.stockStatus !== "out_of_stock";
  const hasDiscount = Boolean(product.discountPercentage || product.oldPrice);
  const oldPrice =
    product.oldPrice ??
    (product.discountPercentage ? product.price : undefined);
  const finalPrice = product.discountPercentage
    ? product.price - (product.price * product.discountPercentage) / 100
    : product.price;

  const stockLabel = {
    in_stock: t("products.stock.inStock"),
    low_stock: t("products.stock.lowStock"),
    out_of_stock: t("products.stock.outOfStock"),
  }[product.stockStatus];

  const actionButtonClass =
    "inline-flex h-12 w-12 shrink-0 items-center justify-center px-0";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/products"
        className="mb-6 inline-flex text-sm font-medium text-muted transition hover:text-accent"
      >
        {t("products.detail.backToProducts")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-border bg-surface-muted">
            {selectedImageUrl ? (
              <img
                src={selectedImageUrl}
                alt={t("products.imageAlt", { title: product.title })}
                className="aspect-square h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center px-4 text-center text-sm text-muted">
                {t("products.noImage")}
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5">
              {images.map((image) => {
                const isSelected = image.url === selectedImageUrl;

                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageUrl(image.url)}
                    className={[
                      "overflow-hidden rounded-md border bg-surface-muted transition",
                      isSelected
                        ? "border-accent"
                        : "border-border hover:border-accent",
                    ].join(" ")}
                    aria-label={image.alt ?? product.title}
                  >
                    <img
                      src={image.url}
                      alt={image.alt ?? product.title}
                      className="aspect-square h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {product.brand && <span>{product.brand}</span>}
            {product.brand && <span aria-hidden="true">/</span>}
            <span>{product.categoryId}</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {product.title}
          </h1>

          {product.shortDescription && (
            <p className="mt-3 text-base leading-7 text-muted">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-bold text-foreground">
              {finalPrice.toFixed(2)} {product.currency}
            </span>

            {hasDiscount && oldPrice && (
              <span className="pb-1 text-base text-muted line-through">
                {oldPrice.toFixed(2)} {product.currency}
              </span>
            )}

            {product.discountPercentage && (
              <span className="mb-1 rounded-full bg-accent-soft px-2.5 py-1 text-sm font-semibold text-accent">
                -{product.discountPercentage}%
              </span>
            )}
          </div>

          <div className="mt-5 grid gap-3 rounded-lg border border-border bg-surface-muted p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted">{t("products.detail.availability")}</p>
              <p className="mt-1 font-semibold text-foreground">{stockLabel}</p>
            </div>

            <div>
              <p className="text-muted">{t("products.detail.sku")}</p>
              <p className="mt-1 font-semibold text-foreground">
                {product.sku}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartControl product={product} />

            {/* <Button
              type="button"
              variant="secondary"
              className={actionButtonClass}
              aria-label={t("products.addToWishlist")}
            >
              <HeartIcon />
            </Button> */}
            <AddToWishlistButton product={product} />

            <Button
              type="button"
              variant="secondary"
              className={actionButtonClass}
              aria-label={t("products.forComparison")}
            >
              <CompareIcon />
            </Button>
          </div>

          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                {t("products.detail.description")}
              </h2>
              <p className="mt-3 leading-7 text-muted">{product.description}</p>
            </section>

            {product.attributes.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("products.detail.attributes")}
                </h2>
                <dl className="mt-3 divide-y divide-border rounded-lg border border-border">
                  {product.attributes.map((attribute) => (
                    <div
                      key={`${attribute.name}-${attribute.value}`}
                      className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-2"
                    >
                      <dt className="text-muted">{attribute.name}</dt>
                      <dd className="font-medium text-foreground">
                        {attribute.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {product.shipping && (
              <section>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("products.detail.shipping")}
                </h2>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {product.shipping.weight && (
                    <div className="rounded-lg border border-border p-3">
                      <dt className="text-muted">
                        {t("products.detail.weight")}
                      </dt>
                      <dd className="mt-1 font-medium text-foreground">
                        {product.shipping.weight}
                      </dd>
                    </div>
                  )}

                  {(product.shipping.width ||
                    product.shipping.height ||
                    product.shipping.depth) && (
                    <div className="rounded-lg border border-border p-3">
                      <dt className="text-muted">
                        {t("products.detail.dimensions")}
                      </dt>
                      <dd className="mt-1 font-medium text-foreground">
                        {[
                          product.shipping.width,
                          product.shipping.height,
                          product.shipping.depth,
                        ]
                          .filter(Boolean)
                          .join(" x ")}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
