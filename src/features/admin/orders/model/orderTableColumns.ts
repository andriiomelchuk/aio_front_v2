import type { T_I18nContext } from "@/shared/i18n";

export const getOrderColumns = (t: T_I18nContext["t"]) =>
  [
    { key: "orderId", label: t("admin.orders.table.orderId") },
    { key: "price", label: t("admin.orders.table.price"), align: "center" },
    { key: "createdAt", label: t("admin.orders.table.createdAt"), align: "center"},
    { key: "updatedAt", label: t("admin.orders.table.updatedAt"), align: "center" },
    { key: "status", label: t("admin.orders.table.status"), align: "center" },
    { key: "action", label: t("admin.orders.table.action"), align: "center" },
  ] as const;
