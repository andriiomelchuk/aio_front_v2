"use client";

import { useEffect, useState } from "react";
import type { T_Product } from "@/entities/product";
import { AssignedMenuLayout } from "@/components/Menu";
import { getProducts } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";
import { ProductDetail } from "./ProductDetail";

export const ProductDetailLoader = ({ slug }: { slug: string }) => {
  const { t } = useI18n();
  const [product, setProduct] = useState<T_Product | null>();

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
      .catch(() => active && setProduct(null));
    return () => { active = false; };
  }, [slug]);

  if (product === undefined) {
    return <div className="mx-auto min-h-64 w-full max-w-7xl animate-pulse px-4 py-8" />;
  }

  if (product === null) {
    return <main className="mx-auto w-full max-w-7xl px-4 py-12 text-center"><h1 className="text-2xl font-bold text-foreground">{t("catalog.emptyTitle")}</h1></main>;
  }

  return <AssignedMenuLayout target={{ type: "product", entityId: product.id }}><ProductDetail product={product} /></AssignedMenuLayout>;
};
