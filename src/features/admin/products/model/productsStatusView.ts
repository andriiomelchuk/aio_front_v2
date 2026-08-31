import type {
  T_ProductStockStatus,
  T_ProductStatus,
} from "@/entities/product/model/types";
import type { T_I18nContext } from "@/shared/i18n";
import type { T_ProductStockFilter } from "./types";

export const productsStatusBadgeVariant: Record<
  T_ProductStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  draft: "neutral",
  active: "success",
  archived: "danger",
};

export const productsStockBadgeVariant: Record<
  T_ProductStockFilter,
  "success" | "warning" | "danger" | "neutral"
> = {
  all: "neutral",
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
};

export const getProductsStatusLabel = (
  status: T_ProductStatus,
  t: T_I18nContext["t"],
) => {
  const labels: Record<T_ProductStatus, ReturnType<typeof t>> = {
    draft: t("admin.products.status.draft"),
    active: t("admin.products.status.active"),
    archived: t("admin.products.status.archived"),
  };

  return labels[status];
};

export const getProductsStockLabel = (
  status: T_ProductStockStatus,
  t: T_I18nContext["t"],
) => {
  const labels: Record<T_ProductStockStatus, ReturnType<typeof t>> = {
    in_stock: t("admin.products.stock.inStock"),
    low_stock: t("admin.products.stock.lowStock"),
    out_of_stock: t("admin.products.stock.outOfStock"),
  };

  return labels[status];
};
