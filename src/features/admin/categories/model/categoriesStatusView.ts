import { T_CategoriesStatus } from "@/entities/categories/model/types";
import type { T_I18nContext, T_I18nKey } from "@/shared/i18n";

export const categoriesStatusBadgeVariant: Record<
  T_CategoriesStatus,
  "success" | "neutral"
> = {
  active: "success",
  inactive: "neutral",

};

const categoriesCategoriesLabelKey: Record<T_CategoriesStatus, T_I18nKey> = {
  active: "admin.categories.status.active",
  inactive: "admin.categories.status.inactive",
};

export const getCategoriesStatusLabel = (
  status: T_CategoriesStatus,
  t: T_I18nContext["t"],
) => {
  return t(categoriesCategoriesLabelKey[status]);
};

