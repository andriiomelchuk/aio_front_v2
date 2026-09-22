"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { T_Product } from "@/entities/product/model/types";
import { useWishlist } from "@/features/wishlist/model/useWishlist";
import { getProducts } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { ProductCard } from "../Products/ProductCard";

export const WishlistManagement = () => {
  const { t } = useI18n();
  const { productIds, clearAllWishlist } = useWishlist();
  const [products, setProducts] = useState<T_Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        const loadedProducts = await getProducts();
        if (isMounted) setProducts(loadedProducts);
      } catch {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const wishlistProducts = products.filter((product) =>
    productIds.includes(product.id),
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-accent">
            {t("wishlist.eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
            {t("wishlist.title")}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            {t("wishlist.description", { count: productIds.length })}
          </p>
        </div>

        {productIds.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            className="h-11 self-start px-4 text-sm sm:self-auto"
            onClick={clearAllWishlist}
          >
            {t("wishlist.clear")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-border bg-surface px-6 text-sm text-muted">
          {t("wishlist.loading")}
        </div>
      ) : hasError ? (
        <section role="alert" className="rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
          <h2 className="text-xl font-bold text-foreground">{t("wishlist.errorTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">{t("wishlist.errorDescription")}</p>
          <Button type="button" className="mt-5 h-11 px-5" onClick={() => setReloadKey((key) => key + 1)}>
            {t("wishlist.retry")}
          </Button>
        </section>
      ) : wishlistProducts.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
          <h2 className="text-xl font-bold text-foreground">
            {t("wishlist.emptyTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            {t("wishlist.emptyDescription")}
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {t("wishlist.backToProducts")}
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </main>
  );
};
