export const getUserColumns = (t: (key: string) => string) => [
  { key: "name", label: t("admin.user.table.name")},
  { key: "email", label: t("admin.user.table.email")},
  { key: "role", label: t("admin.user.table.role")},
  { key: "status", label: t("admin.user.table.status")},
  { key: "action", label: t("admin.user.table.action")},
] as const;