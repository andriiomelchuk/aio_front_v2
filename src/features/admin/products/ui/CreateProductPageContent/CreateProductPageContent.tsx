"use client";

import { useRouter } from "next/navigation";
import { createProduct, ProductsApiError } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";
import { ProductForm } from "../ProductForm";

export const CreateProductPageContent = () => {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <ProductForm
      mode="create"
      onCancel={() => router.push("/admin/products")}
      onCreate={async (product) => {
        try {
          await createProduct(product);
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
