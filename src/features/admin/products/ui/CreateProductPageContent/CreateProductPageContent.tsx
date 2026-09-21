"use client";

import { useRouter } from "next/navigation";
import { createProduct, deleteProduct, ProductsApiError } from "@/shared/api/products";
import { useI18n } from "@/shared/i18n";
import { ProductForm } from "../ProductForm";
import { recordInventoryMovement } from "@/shared/api/warehouse";
import { useAdminAccess } from "@/features/auth";

export const CreateProductPageContent = () => {
  const router = useRouter();
  const { t } = useI18n();
  const { session } = useAdminAccess();

  return (
    <ProductForm
      mode="create"
      onCancel={() => router.push("/admin/products")}
      onCreate={async (product, initialPlacement) => {
        try {
          const createdProduct = await createProduct(product);
          if (initialPlacement) {
            try {
              await recordInventoryMovement({
                type: "receipt",
                productId: createdProduct.id,
                variantId: initialPlacement.variantId,
                toWarehouseId: initialPlacement.warehouseId,
                toLocationId: initialPlacement.locationId,
                quantity: initialPlacement.quantity,
                condition: initialPlacement.condition,
                reason: "Initial product stock",
                reference: createdProduct.sku,
                createdBy: session?.displayName ?? "Admin",
              });
            } catch (error) {
              await deleteProduct(createdProduct.id);
              throw error;
            }
          }
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
