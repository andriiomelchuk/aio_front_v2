"use client";

import Link from "next/link";
import { catalogProducts, useCatalogControls } from "@/features/catalog";
import { useI18n } from "@/shared/i18n";
import { Pagination } from "@/shared/ui";
import { CatalogFilters } from "./CatalogFilters";
import { ProductCard } from "./ProductCard";
import type { T_ProductCatalogProps } from "./types";

export const ProductCatalog = ({
  products,
  categories,
  fixedCategory = "",
  categoryTitle,
}: T_ProductCatalogProps) => {
  const { t } = useI18n();
  const { params, updateParams, resetParams } =
    useCatalogControls(fixedCategory);
  const filteredProducts = catalogProducts(products, params);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / params.pageSize),
  );
  const currentPage = Math.min(params.page, totalPages);
  const firstProductIndex = (currentPage - 1) * params.pageSize;
  const visibleProducts = filteredProducts.slice(
    firstProductIndex,
    firstProductIndex + params.pageSize,
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {fixedCategory && (
        <Link
          href="/categories"
          className="text-sm font-medium text-muted transition hover:text-accent"
        >
          {t("categories.backToCategories")}
        </Link>
      )}

      <header className={fixedCategory ? "mb-6 mt-5" : "mb-6"}>
        <p className="text-sm font-semibold uppercase text-accent">
          {fixedCategory
            ? t("categories.categoryEyebrow")
            : t("catalog.eyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          {categoryTitle ?? t("catalog.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          {fixedCategory
            ? t("categories.productCount", { count: filteredProducts.length })
            : t("catalog.description")}
        </p>
      </header>

      <CatalogFilters
        key={`${params.search}-${params.minPrice}-${params.maxPrice}`}
        params={params}
        categories={categories}
        fixedCategory={fixedCategory}
        onUpdate={updateParams}
        onReset={resetParams}
      />

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {t("catalog.results", { count: filteredProducts.length })}
        </p>
      </div>

      {visibleProducts.length > 0 ? (
        <>
          <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
          <div className="mt-6">
            <Pagination
              page={currentPage}
              pageSize={params.pageSize}
              pageSizeOptions={[8, 12, 24]}
              pageSizeLabel={t("catalog.productsPerPage")}
              ariaLabel={t("catalog.paginationLabel")}
              totalItems={filteredProducts.length}
              onPageChange={(page) =>
                updateParams({ page }, { preservePage: true })
              }
              onPageSizeChange={(pageSize) => updateParams({ pageSize })}
            />
          </div>
        </>
      ) : (
        <section className="mt-5 rounded-lg border border-border bg-surface p-6 text-center sm:p-10">
          <h2 className="text-xl font-bold text-foreground">
            {t("catalog.emptyTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            {t("catalog.emptyDescription")}
          </p>
          <button
            type="button"
            className="mt-5 text-sm font-semibold text-accent hover:underline"
            onClick={resetParams}
          >
            {t("catalog.reset")}
          </button>
        </section>
      )}
    </main>
  );
};
