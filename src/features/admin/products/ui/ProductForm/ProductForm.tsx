"use client";

import { useState } from "react";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { ProductPreview } from "../ProductPreview";
import type { T_Product } from "@/entities/product/model/types";
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
  ProductVariantsSection,
} from "./sections";
import type { T_ProductForm, T_ProductFormErrors } from "./types";
import { getProductFormValues } from "./model/getProductFormValues";
import {
  hasProductFormErrors,
  validateProductFormValues,
} from "./model/validateProductFormValues";

type T_ProductFormSectionKey =
  | "main"
  | "description"
  | "pricing"
  | "stock"
  | "media"
  | "attributes"
  | "variants"
  | "seo"
  | "shipping"
  | "system";

const productFormSectionKeys: T_ProductFormSectionKey[] = [
  "main",
  "description",
  "pricing",
  "stock",
  "media",
  "attributes",
  "variants",
  "seo",
  "shipping",
  "system",
];

const createSectionState = (isOpen: boolean) => {
  return productFormSectionKeys.reduce(
    (sections, sectionKey) => ({
      ...sections,
      [sectionKey]: isOpen,
    }),
    {} as Record<T_ProductFormSectionKey, boolean>,
  );
};

export const ProductForm = ({
  mode,
  product,
  onCancel,
  onCreate,
  onUpdate,
}: T_ProductForm) => {
  const { t } = useI18n();
  const isEditMode = mode === "edit";
  const [errors, setErrors] = useState<T_ProductFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [openSections, setOpenSections] = useState(() =>
    createSectionState(true),
  );
  const [previewProduct, setPreviewProduct] = useState<T_Product | undefined>(
    product,
  );
  const errorMessages = Object.values(errors);

  const getSectionControl = (sectionKey: T_ProductFormSectionKey) => ({
    isOpen: openSections[sectionKey],
    onOpenChange: (isOpen: boolean) => {
      setOpenSections((currentSections) => ({
        ...currentSections,
        [sectionKey]: isOpen,
      }));
    },
  });

  return (
    <form
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6"
      onInput={(event) => {
        const productValues = getProductFormValues(event.currentTarget);
        const now = new Date().toISOString();

        setPreviewProduct({
          id: product?.id ?? "preview",
          createdAt: product?.createdAt ?? now,
          updatedAt: product?.updatedAt ?? now,
          updatedBy: product?.updatedBy,
          ...productValues,
        });
      }}
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitError("");

        const productValues = getProductFormValues(event.currentTarget);
        const validationErrors = validateProductFormValues(productValues, t);

        setErrors(validationErrors);

        if (hasProductFormErrors(validationErrors)) {
          return;
        }

        try {
          if (isEditMode && product) {
            await onUpdate?.({
              id: product.id,
              ...productValues,
            });

            return;
          }

          await onCreate?.(productValues);
        } catch (caughtError) {
          setSubmitError(
            caughtError instanceof Error
              ? caughtError.message
              : t("admin.product.error.saveFailed"),
          );
        }
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

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          onClick={() => setOpenSections(createSectionState(true))}
        >
          {t("admin.product.form.expandAllSections")}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          onClick={() => setOpenSections(createSectionState(false))}
        >
          {t("admin.product.form.collapseAllSections")}
        </Button>
      </div>

      {(errorMessages.length > 0 || submitError) && (
        <div className="rounded-md border border-danger bg-danger/10 px-4 py-3 text-sm text-danger">
          <p className="font-semibold">{t("admin.validation.formErrorTitle")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {submitError && <li>{submitError}</li>}
            {errorMessages.map((error, index) => (
              <li key={`${error}-${index}`}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-4">
          <ProductMainSection
            product={product}
            isEditMode={isEditMode}
            errors={errors}
            sectionControl={getSectionControl("main")}
          />
          <ProductDescriptionSection
            product={product}
            sectionControl={getSectionControl("description")}
          />
          <ProductPricingSection
            product={product}
            errors={errors}
            sectionControl={getSectionControl("pricing")}
          />
          <ProductStockSection
            product={product}
            errors={errors}
            sectionControl={getSectionControl("stock")}
          />
          <ProductMediaSection
            product={product}
            sectionControl={getSectionControl("media")}
          />
          <ProductAttributesSection
            product={product}
            sectionControl={getSectionControl("attributes")}
          />
          <ProductVariantsSection
            product={product}
            sectionControl={getSectionControl("variants")}
          />
          <ProductSeoSection
            product={product}
            sectionControl={getSectionControl("seo")}
          />
          <ProductShippingSection
            product={product}
            sectionControl={getSectionControl("shipping")}
          />

          {isEditMode && (
            <ProductSystemSection
              product={product}
              sectionControl={getSectionControl("system")}
            />
          )}
        </div>

        <ProductPreview product={previewProduct} />
      </div>
    </form>
  );
};
