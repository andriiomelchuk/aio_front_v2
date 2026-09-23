"use client";

import { useEffect, useState } from "react";
import { getLocalizedText, type T_ContentPageLocale, type T_ProductsBlock } from "@/entities/contentPage";
import type { T_Product } from "@/entities/product/model/types";
import { getProducts } from "@/shared/api/products";
import { ProductCard } from "@/components/Products/ProductCard";
import { DataState } from "@/shared/ui";

export const ProductsContentBlock = ({ block, preview = false, locale, defaultLocale }: { block: T_ProductsBlock; preview?: boolean; locale: T_ContentPageLocale; defaultLocale: T_ContentPageLocale }) => {
  const [products, setProducts] = useState<T_Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const title = getLocalizedText(block.data.title, locale, defaultLocale);

  useEffect(() => {
    void getProducts().then((items) => setProducts(items.filter((item) => block.data.productIds.includes(item.id)))).catch(() => setHasError(true)).finally(() => setIsLoading(false));
  }, [block.data.productIds, reloadKey]);

  return (
    <section className="bg-background">
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${preview ? "py-8" : "py-10 sm:py-14"}`}>
        {title && <h2 className="mb-6 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>}
        {isLoading ? <DataState compact variant="loading" /> : hasError ? <DataState compact variant="error" onAction={() => { setIsLoading(true); setHasError(false); setReloadKey((value) => value + 1); }} /> : products.length === 0 ? <DataState compact variant="empty" /> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>}
      </div>
    </section>
  );
};
