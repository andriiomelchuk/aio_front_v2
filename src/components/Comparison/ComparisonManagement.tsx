"use client";

import Link from "next/link";
import { useI18n } from "@/shared/i18n";
import { ComparisonItem } from "./ComparisonItem";
import { useCompare } from "@/features/comparison/model/useCompare";
import { ComparisonDetailTable } from "./ComparisonDetailTable";

const getProductFinalPrice = (price: number, discountPercentage?: number) => {
  return discountPercentage
    ? price - (price * discountPercentage) / 100
    : price;
};

export const ComparisonManagement = () => {
  const { t } = useI18n();

  const { products } = useCompare();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:mb-8">
        <p className="text-sm font-semibold uppercase text-accent">
          {t("comparison.eyebrow")}
        </p>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {t("comparison.title")}
        </h1>
        <p className="max-w-3xl text-sm text-muted">
          {t("comparison.description", {
            count: products.length,
          })}
        </p>
      </div>

      {products.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
          <h2 className="text-xl font-bold text-foreground">
            {t("comparison.emptyTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            {t("comparison.emptyDescription")}
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {t("comparison.backToProducts")}
          </Link>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              return (
                <ComparisonItem
                  key={product.id}
                  product={product}
                  priceCalc={getProductFinalPrice}
                />
              );
            })}
          </section>

          <section className="overflow-hidden rounded-lg border border-border bg-surface">
            <ComparisonDetailTable
              products={products}
              priceCalc={getProductFinalPrice}
            />
          </section>
        </div>
      )}
    </main>
  );
};
