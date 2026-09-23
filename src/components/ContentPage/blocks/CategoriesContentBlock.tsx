"use client";

import { useEffect, useState } from "react";
import { getLocalizedText, type T_CategoriesBlock, type T_ContentPageLocale } from "@/entities/contentPage";
import type { T_Categories } from "@/entities/categories/model/types";
import type { T_Product } from "@/entities/product/model/types";
import { getCategories } from "@/shared/api/categories";
import { getProducts } from "@/shared/api/products";
import { CategoryCard } from "@/components/Categories/CategoryCard";
import { DataState } from "@/shared/ui";

export const CategoriesContentBlock = ({ block, preview = false, locale, defaultLocale }: { block: T_CategoriesBlock; preview?: boolean; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const [categories, setCategories] = useState<T_Categories[]>([]);
  const [products, setProducts] = useState<T_Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const title = getLocalizedText(block.data.title, locale, defaultLocale);

  useEffect(() => {
    void Promise.all([getCategories(), getProducts()]).then(([categoryItems, productItems]) => {
      setCategories(categoryItems.filter((item) => block.data.categorySlugs.includes(item.slug)));
      setProducts(productItems);
    }).catch(() => setHasError(true)).finally(() => setIsLoading(false));
  }, [block.data.categorySlugs, reloadKey]);

  return (
    <section className="bg-surface">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${preview ? "py-8" : "py-10 sm:py-14"}`}>
        {title && <h2 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>}
        {isLoading ? <DataState compact variant="loading" /> : hasError ? <DataState compact variant="error" onAction={() => { setIsLoading(true); setHasError(false); setReloadKey((value) => value + 1); }} /> : categories.length === 0 ? <DataState compact variant="empty" /> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const categoryProducts = products.filter((product) => product.categoryId === category.id || product.categoryId === category.slug);
            return <CategoryCard key={category.id} category={category} productCount={categoryProducts.length} coverImage={categoryProducts[0]?.thumbnail} />;
          })}
        </div>}
      </div>
    </section>
  );
};
