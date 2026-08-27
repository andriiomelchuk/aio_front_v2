import type { T_I18nContext } from "@/shared/i18n";

export const getCategoriesColumns = (t: T_I18nContext["t"]) =>
  [
    { key: "id", label: t("admin.categories.table.id") },
    // { key: "slug", label: t("admin.categories.table.slug"), align: "center" },
    { key: "name", label: t("admin.categories.table.name"), align: "center" },
    { key: "status", label: t("admin.categories.table.status"), align: "center" },
    { key: "action", label: t("admin.categories.table.action"), align: "center" },
  ] as const;
