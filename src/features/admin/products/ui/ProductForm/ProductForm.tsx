"use client";

import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import {
  ProductAttributesSection,
  ProductDescriptionSection,
  ProductMainSection,
  ProductMediaSection,
  ProductPricingSection,
  ProductSeoSection,
  ProductShippingSection,
  ProductStockSection,
  ProductSystemSection,
} from "./sections";
import type { T_ProductForm } from "./types";
import { getProductFormValues } from "./model/getProductFormValues";

export const ProductForm = ({
  mode,
  product,
  onCancel,
  onCreate,
  onUpdate,
}: T_ProductForm) => {
  const { t } = useI18n();
  const isEditMode = mode === "edit";

  return (
    <form
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();

        const productValues = getProductFormValues(event.currentTarget);

        if (isEditMode && product) {
          onUpdate?.({
            id: product.id,
            ...productValues,
          });

          return;
        }

        onCreate?.(productValues);
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditMode
              ? t("admin.product.form.editTitle")
              : t("admin.product.form.createTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isEditMode
              ? t("admin.product.form.editDescription")
              : t("admin.product.form.createDescription")}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full sm:w-auto"
            onClick={onCancel}
          >
            {t("admin.actions.cancel")}
          </Button>
          <Button type="submit" className="h-10 w-full sm:w-auto">
            {isEditMode
              ? t("admin.actions.saveChanges")
              : t("admin.actions.createProduct")}
          </Button>
        </div>
      </div>

      <ProductMainSection product={product} isEditMode={isEditMode} />
      <ProductDescriptionSection product={product} />
      <ProductPricingSection product={product} />
      <ProductStockSection product={product} />
      <ProductMediaSection product={product} />
      <ProductAttributesSection product={product} />
      <ProductSeoSection product={product} />
      <ProductShippingSection product={product} />

      {isEditMode && <ProductSystemSection product={product} />}
    </form>
  );
};
