"use client";

import { useEffect, useState } from "react";
import type { T_Product } from "@/entities/product";
import { AssignedMenuLayout } from "@/components/Menu";
import { getProducts } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";
import { DataState } from "@/shared/ui";
import { ProductDetail } from "./ProductDetail";

export const ProductDetailLoader = ({ slug }: { slug: string }) => {
  const { t } = useI18n();
  const [product, setProduct] = useState<T_Product | null>();
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getProducts()
      .then((products) => {
        if (active) {
          setProduct(
            products.find((item) => item.slug.toLowerCase() === slug.toLowerCase()) ?? null,
          );
        }
      })
      .catch(() => { if (active) setHasError(true); });
    return () => { active = false; };
  }, [slug, reloadKey]);

  if (product === undefined) {
    if (hasError) {
      return <main className="mx-auto w-full max-w-7xl px-4 py-12"><DataState variant="error" onAction={() => { setProduct(undefined); setHasError(false); setReloadKey((value) => value + 1); }} /></main>;
    }
    return <main className="mx-auto w-full max-w-7xl px-4 py-12"><DataState variant="loading" /></main>;
  }

  if (product === null) {
    return <main className="mx-auto w-full max-w-7xl px-4 py-12"><DataState variant="empty" title={t("catalog.emptyTitle")} /></main>;
  }

  return <AssignedMenuLayout target={{ type: "product", entityId: product.id }}><ProductDetail product={product} /></AssignedMenuLayout>;
};
