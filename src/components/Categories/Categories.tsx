"use client";

import { useI18n } from "@/shared/i18n";
import { CategoryCard } from "./CategoryCard";
import type { T_CategoriesProps } from "./types";

export const Categories = ({ categories, products }: T_CategoriesProps) => {
  const { t } = useI18n();
  const activeCategories = categories.filter(
    (category) => category.status === "active",
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <p className="text-sm font-semibold uppercase text-accent">
          {t("categories.eyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {t("categories.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          {t("categories.description")}
        </p>
      </div>

      {activeCategories.length === 0 ? (
        <section className="rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
          <h2 className="text-xl font-bold text-foreground">
            {t("categories.emptyTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            {t("categories.emptyDescription")}
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeCategories.map((category) => {
            const categoryProducts = products.filter(
              (product) => product.categoryId === category.slug,
            );
            const coverProduct = categoryProducts[0];
            const coverImage =
              coverProduct?.images.find((image) => image.isMain)?.url ??
              coverProduct?.thumbnail;

            return (
              <CategoryCard
                key={category.id}
                category={category}
                productCount={categoryProducts.length}
                coverImage={coverImage}
              />
            );
          })}
        </section>
      )}
    </main>
  );
};
