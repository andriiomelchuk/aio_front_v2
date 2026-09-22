"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useI18n } from "@/shared/i18n";
import type { T_ProductDetailProps } from "./types";
import { AddToCartControl } from "@/features/cart/ui/AddToCartControls";
import { AddToWishlistButton } from "@/features/wishlist/ui/AddToWishlistButton";
import { CompareToggleButton } from "@/features/comparison/ui/CompareToggleButton";
import { usePriceFormatter, useSiteSettings } from "@/shared/siteSettings";
import { canPurchaseProduct, getProductStockStatus, useLocalizedProduct } from "@/features/catalog";


export const ProductDetail = ({ product }: T_ProductDetailProps) => {
  const { t } = useI18n();
  const formatPrice = usePriceFormatter();
  const settings = useSiteSettings();
  const localizedProduct = useLocalizedProduct(product);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0]?.id,
  );
  const selectedVariant = product.variants?.find(
    (variant) => variant.id === selectedVariantId,
  );
  const localizedVariant = localizedProduct.variants?.find(
    (variant) => variant.id === selectedVariantId,
  );

  const images = useMemo(() => {
    const galleryImages = product.images.length
      ? product.images
      : [
          {
            id: product.id,
            url: product.thumbnail,
            alt: localizedProduct.title,
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
  }, [localizedProduct.title, product]);

  const [selectedImageUrl, setSelectedImageUrl] = useState(
    images[0]?.url ?? product.thumbnail,
  );

  const stockQuantity = selectedVariant?.stockQuantity ?? product.stockQuantity;
  const price = selectedVariant?.price ?? product.price;
  const oldPriceValue = selectedVariant?.oldPrice ?? product.oldPrice;
  const discountPercentage = selectedVariant?.discountPercentage ?? product.discountPercentage;
  const stockStatus = getProductStockStatus(stockQuantity, settings.commerce.lowStockThreshold);
  const isAvailable = canPurchaseProduct(
    { ...product, stockQuantity },
    settings.commerce.allowBackorders,
  );
  const hasDiscount = Boolean(discountPercentage || oldPriceValue);
  const oldPrice =
    oldPriceValue ?? (discountPercentage ? price : undefined);
  const finalPrice = discountPercentage
    ? price - (price * discountPercentage) / 100
    : price;

  const stockLabel = {
    in_stock: t("products.stock.inStock"),
    low_stock: t("products.stock.lowStock"),
    out_of_stock: t("products.stock.outOfStock"),
  }[stockStatus];

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
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface-muted">
            {selectedImageUrl ? (
              <Image
                src={selectedImageUrl}
                alt={t("products.imageAlt", { title: localizedProduct.title })}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 55vw"
                className="object-cover"
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
                    aria-label={image.alt ?? localizedProduct.title}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt ?? localizedProduct.title}
                      width={160}
                      height={160}
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
            {localizedProduct.title}
          </h1>

          {localizedProduct.shortDescription && (
            <p className="mt-3 text-base leading-7 text-muted">
              {localizedProduct.shortDescription}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-bold text-foreground">
              {formatPrice(finalPrice, product.currency)}
            </span>

            {hasDiscount && oldPrice && (
              <span className="pb-1 text-base text-muted line-through">
                {formatPrice(oldPrice, product.currency)}
              </span>
            )}

            {discountPercentage && (
              <span className="mb-1 rounded-full bg-accent-soft px-2.5 py-1 text-sm font-semibold text-accent">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {localizedProduct.variants && localizedProduct.variants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-sm font-semibold text-foreground">
                {t("products.detail.selectVariant")}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {localizedProduct.variants.map((variant) => {
                  const sourceVariant = product.variants?.find(
                    (entry) => entry.id === variant.id,
                  );
                  const isSelected = variant.id === selectedVariantId;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={[
                        "min-h-11 rounded-md border px-4 py-2 text-left text-sm transition",
                        isSelected
                          ? "border-accent bg-accent-soft text-foreground"
                          : "border-border text-foreground hover:border-accent",
                      ].join(" ")}
                    >
                      <span className="block font-semibold">{variant.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {formatPrice(sourceVariant?.price ?? product.price, product.currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-5 grid gap-3 rounded-lg border border-border bg-surface-muted p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted">{t("products.detail.availability")}</p>
              <p className="mt-1 font-semibold text-foreground">{stockLabel}</p>
            </div>

            <div>
              <p className="text-muted">{t("products.detail.sku")}</p>
              <p className="mt-1 font-semibold text-foreground">
                {selectedVariant?.sku ?? product.sku}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartControl
              key={selectedVariant?.id ?? "base"}
              product={product}
              variantId={selectedVariant?.id}
              maxQuantity={stockQuantity}
              disabled={!isAvailable}
            />

            <AddToWishlistButton product={product} />

            <CompareToggleButton product={product} />
          </div>

          <div className="mt-8 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground">
                {t("products.detail.description")}
              </h2>
              <p className="mt-3 leading-7 text-muted">{localizedProduct.description}</p>
            </section>

            {localizedProduct.attributes.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("products.detail.attributes")}
                </h2>
                <dl className="mt-3 divide-y divide-border rounded-lg border border-border">
                  {localizedProduct.attributes.map((attribute) => (
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

            {localizedVariant && localizedVariant.attributes.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("products.detail.variantAttributes")}
                </h2>
                <dl className="mt-3 divide-y divide-border rounded-lg border border-border">
                  {localizedVariant.attributes.map((attribute) => (
                    <div
                      key={`${attribute.name}-${attribute.value}`}
                      className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-2"
                    >
                      <dt className="text-muted">{attribute.name}</dt>
                      <dd className="font-medium text-foreground">{attribute.value}</dd>
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
