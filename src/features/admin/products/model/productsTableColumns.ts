import type { T_I18nContext } from "@/shared/i18n";

export const getProductsColumns = (t: T_I18nContext["t"]) =>
  [
    { key: "id", label: t("admin.products.table.id") },
    { key: "title", label: t("admin.products.table.title"), align: "center" },
    { key: "sku", label: t("admin.products.table.sku"), align: "center" },
    { key: "category", label: t("admin.products.table.category"), align: "center" },
    { key: "price", label: t("admin.products.table.price"), align: "center" },
    { key: "old_price", label: t("admin.products.table.oldPrice"), align: "center" },
    { key: "discount", label: t("admin.products.table.discount"), align: "center" },
    { key: "stock", label: t("admin.products.table.stock"), align: "center" },
    { key: "status", label: t("admin.products.table.status"), align: "center" },
    { key: "action", label: t("admin.products.table.action"), align: "center" },
  ] as const;
