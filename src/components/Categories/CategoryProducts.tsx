"use client";

import Link from "next/link";
import { useI18n } from "@/shared/i18n";
import { ProductCard } from "@/components/Products/ProductCard";
import type { T_CategoryProductsProps } from "./types";

export const CategoryProducts = ({
  category,
  products,
}: T_CategoryProductsProps) => {
  const { t } = useI18n();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/categories"
        className="inline-flex text-sm font-medium text-muted transition hover:text-accent"
      >
        {t("categories.backToCategories")}
      </Link>

      <div className="mb-6 mt-5 sm:mb-8">
        <p className="text-sm font-semibold uppercase text-accent">
          {t("categories.categoryEyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {category.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t("categories.productCount", { count: products.length })}
        </p>
      </div>

      {products.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
          <h2 className="text-xl font-bold text-foreground">
            {t("categories.noProductsTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            {t("categories.noProductsDescription")}
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {t("categories.browseProducts")}
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </main>
  );
};
