"use client";

import { useState } from "react";
import type {
  T_ProductAttribute,
  T_ProductStockStatus,
  T_ProductVariant,
} from "@/entities/product/model/types";
import { useI18n } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { getProductsStockLabel } from "../../model";
import type { T_ProductVariantsManagerProps } from "./types";

const createVariantId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};

type T_ProductVariantItem = T_ProductVariant & {
  id: string;
};

const stockStatusOptions: T_ProductStockStatus[] = [
  "in_stock",
  "low_stock",
  "out_of_stock",
];

const getNumberValue = (value: number | undefined) => {
  return Number.isFinite(value) ? String(value) : "";
};

export const ProductVariantsManager = ({
  variants = [],
}: T_ProductVariantsManagerProps) => {
  const { t } = useI18n();
  const [variantItems, setVariantItems] = useState<T_ProductVariantItem[]>(
    variants.map((variant) => ({
      ...variant,
      id: variant.id || createVariantId(),
      attributes: variant.attributes ?? [],
    })),
  );

  const preparedVariants = variantItems
    .map((variant) => ({
      ...variant,
      title: variant.title.trim(),
      sku: variant.sku.trim(),
      attributes: variant.attributes
        .map((attribute) => ({
          name: attribute.name.trim(),
          value: attribute.value.trim(),
        }))
        .filter((attribute) => attribute.name || attribute.value),
    }))
    .filter((variant) => variant.title || variant.sku);

  const updateVariant = <T_Field extends keyof T_ProductVariant>(
    id: string,
    field: T_Field,
    value: T_ProductVariant[T_Field],
  ) => {
    setVariantItems((currentVariants) =>
      currentVariants.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant,
      ),
    );
  };

  const updateVariantAttribute = (
    variantId: string,
    attributeIndex: number,
    field: keyof T_ProductAttribute,
    value: string,
  ) => {
    setVariantItems((currentVariants) =>
      currentVariants.map((variant) => {
        if (variant.id !== variantId) {
          return variant;
        }

        return {
          ...variant,
          attributes: variant.attributes.map((attribute, index) =>
            index === attributeIndex
              ? { ...attribute, [field]: value }
              : attribute,
          ),
        };
      }),
    );
  };

  const addVariant = () => {
    setVariantItems((currentVariants) => [
      ...currentVariants,
      {
        id: createVariantId(),
        title: "",
        sku: "",
        price: 0,
        stockQuantity: 0,
        stockStatus: "in_stock",
        attributes: [],
      },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariantItems((currentVariants) =>
      currentVariants.filter((variant) => variant.id !== id),
    );
  };

  const addVariantAttribute = (variantId: string) => {
    setVariantItems((currentVariants) =>
      currentVariants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              attributes: [...variant.attributes, { name: "", value: "" }],
            }
          : variant,
      ),
    );
  };

  const removeVariantAttribute = (
    variantId: string,
    attributeIndex: number,
  ) => {
    setVariantItems((currentVariants) =>
      currentVariants.map((variant) =>
        variant.id === variantId
          ? {
              ...variant,
              attributes: variant.attributes.filter(
                (_, index) => index !== attributeIndex,
              ),
            }
          : variant,
      ),
    );
  };

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <input
        type="hidden"
        name="variants"
        value={JSON.stringify(preparedVariants)}
      />

      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-foreground">
          {t("admin.product.form.variantsLabel")}
        </p>

        <Button
          type="button"
          variant="secondary"
          className="h-8 px-3 text-xs"
          onClick={addVariant}
        >
          {t("admin.product.form.variantAdd")}
        </Button>
      </div>

      {variantItems.length > 0 ? (
        <div className="grid max-h-[620px] gap-3 overflow-y-auto pr-1">
          {variantItems.map((variant) => (
            <div
              key={variant.id}
              className="rounded-md border border-border bg-surface p-3"
            >
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                <input
                  value={variant.title}
                  placeholder={t(
                    "admin.product.form.variantTitlePlaceholder",
                  )}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  onChange={(event) =>
                    updateVariant(variant.id, "title", event.target.value)
                  }
                />

                <input
                  value={variant.sku}
                  placeholder={t("admin.product.form.variantSkuPlaceholder")}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  onChange={(event) =>
                    updateVariant(variant.id, "sku", event.target.value)
                  }
                />

                <input
                  type="number"
                  value={getNumberValue(variant.price)}
                  placeholder={t("admin.product.form.variantPricePlaceholder")}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  onChange={(event) =>
                    updateVariant(variant.id, "price", Number(event.target.value))
                  }
                />

                <input
                  type="number"
                  value={getNumberValue(variant.oldPrice)}
                  placeholder={t(
                    "admin.product.form.variantOldPricePlaceholder",
                  )}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  onChange={(event) =>
                    updateVariant(
                      variant.id,
                      "oldPrice",
                      event.target.value ? Number(event.target.value) : undefined,
                    )
                  }
                />

                <input
                  type="number"
                  value={getNumberValue(variant.discountPercentage)}
                  placeholder={t(
                    "admin.product.form.variantDiscountPlaceholder",
                  )}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  onChange={(event) =>
                    updateVariant(
                      variant.id,
                      "discountPercentage",
                      event.target.value ? Number(event.target.value) : undefined,
                    )
                  }
                />

                <input
                  type="number"
                  value={getNumberValue(variant.stockQuantity)}
                  placeholder={t("admin.product.form.variantStockPlaceholder")}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                  onChange={(event) =>
                    updateVariant(
                      variant.id,
                      "stockQuantity",
                      Number(event.target.value),
                    )
                  }
                />

                <select
                  value={variant.stockStatus}
                  aria-label={t("admin.product.form.variantStockStatusLabel")}
                  className="h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent"
                  onChange={(event) =>
                    updateVariant(
                      variant.id,
                      "stockStatus",
                      event.target.value as T_ProductStockStatus,
                    )
                  }
                >
                  {stockStatusOptions.map((stockStatus) => (
                    <option key={stockStatus} value={stockStatus}>
                      {getProductsStockLabel(stockStatus, t)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 grid gap-2">
                {variant.attributes.map((attribute, index) => (
                  <div
                    key={`${variant.id}-${index}`}
                    className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                  >
                    <input
                      value={attribute.name}
                      placeholder={t(
                        "admin.product.form.variantAttributeNamePlaceholder",
                      )}
                      className="h-8 rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                      onChange={(event) =>
                        updateVariantAttribute(
                          variant.id,
                          index,
                          "name",
                          event.target.value,
                        )
                      }
                    />

                    <input
                      value={attribute.value}
                      placeholder={t(
                        "admin.product.form.variantAttributeValuePlaceholder",
                      )}
                      className="h-8 rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none transition placeholder:text-muted focus:border-accent"
                      onChange={(event) =>
                        updateVariantAttribute(
                          variant.id,
                          index,
                          "value",
                          event.target.value,
                        )
                      }
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-2 text-xs"
                      onClick={() => removeVariantAttribute(variant.id, index)}
                    >
                      {t("admin.product.form.variantAttributeRemove")}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-8 px-3 text-xs"
                  onClick={() => addVariantAttribute(variant.id)}
                >
                  {t("admin.product.form.variantAttributeAdd")}
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  className="h-8 px-3 text-xs"
                  onClick={() => removeVariant(variant.id)}
                >
                  {t("admin.product.form.variantRemove")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted">
          {t("admin.product.form.variantsEmpty")}
        </div>
      )}
    </div>
  );
};
