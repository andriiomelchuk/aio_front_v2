export const getOrderColumns = (t: (key: string) => string) =>
  [
    { key: "id", label: t("admin.ecommerce.table.orderId") },
    { key: "price", label: t("admin.ecommerce.table.price"), align: "center" },
    { key: "createdAt", label: t("admin.ecommerce.table.createdAt"), align: "center"},
    { key: "updatedAt", label: t("admin.ecommerce.table.updatedAt"), align: "center" },
    { key: "status", label: t("admin.ecommerce.table.status"), align: "center" },
    { key: "action", label: t("admin.ecommerce.table.action"), align: "center" },
  ] as const;