import type { T_CreateProductDto } from "@/entities/product/model/types";
import type { T_I18nContext } from "@/shared/i18n";
import type { T_ProductFormErrors } from "../types";

const isEmpty = (value: string | undefined) => {
  return !value || value.trim().length === 0;
};

const isNegative = (value: number | undefined) => {
  return typeof value === "number" && value < 0;
};

export const validateProductFormValues = (
  product: T_CreateProductDto,
  t: T_I18nContext["t"],
) => {
  const errors: T_ProductFormErrors = {};

  if (isEmpty(product.title)) {
    errors.title = t("admin.validation.required");
  }

  if (isEmpty(product.slug)) {
    errors.slug = t("admin.validation.required");
  }

  if (isEmpty(product.sku)) {
    errors.sku = t("admin.validation.required");
  }

  if (isEmpty(product.categoryId)) {
    errors.categoryId = t("admin.validation.required");
  }

  if (isNegative(product.price)) {
    errors.price = t("admin.validation.mustBePositive");
  }

  if (isNegative(product.oldPrice)) {
    errors.oldPrice = t("admin.validation.mustBePositive");
  }

  if (
    typeof product.discountPercentage === "number" &&
    (product.discountPercentage < 0 || product.discountPercentage > 100)
  ) {
    errors.discountPercentage = t("admin.validation.discountRange");
  }

  if (isNegative(product.stockQuantity)) {
    errors.stockQuantity = t("admin.validation.mustBePositive");
  }

  product.variants?.forEach((variant) => {
    if (isEmpty(variant.title)) {
      errors.variantTitle = t("admin.validation.variantTitleRequired");
    }

    if (isEmpty(variant.sku)) {
      errors.variantSku = t("admin.validation.variantSkuRequired");
    }

    if (variant.price < 0) {
      errors.variantPrice = t("admin.validation.mustBePositive");
    }

    if (variant.stockQuantity < 0) {
      errors.variantStockQuantity = t("admin.validation.mustBePositive");
    }
  });

  return errors;
};

export const hasProductFormErrors = (errors: T_ProductFormErrors) => {
  return Object.keys(errors).length > 0;
};
