"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { T_Product } from "@/entities/product/model/types";
import { ProductForm } from "../ProductForm";
import { getProductById, ProductsApiError, updateProduct } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";

export const EditProductPageContent = () => {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<T_Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const loadedProduct = await getProductById(params.id);
        setProduct(loadedProduct);
      } catch {
        setError(t("admin.product.edit.notFound"));
      }
    };

    loadProduct();
  }, [params.id, t]);

  if (error) {
    return <div className="p-4 text-danger">{error}</div>;
  }

  if (!product) {
    return <div className="p-4 text-muted">{t("admin.product.edit.loading")}</div>;
  }

  return (
    <ProductForm
      mode="edit"
      product={product}
      onCancel={() => router.push("/admin/products")}
      onUpdate={async (updatedProduct) => {
        try {
          await updateProduct(updatedProduct);
          router.push("/admin/products");
        } catch (caughtError) {
          if (caughtError instanceof ProductsApiError && caughtError.code === "DUPLICATE_SLUG") {
            throw new Error(t("admin.product.error.duplicateSlug"));
          }

          throw new Error(t("admin.product.error.saveFailed"));
        }
      }}
    />
  );
};
