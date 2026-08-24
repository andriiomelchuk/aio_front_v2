import { T_I18nContext } from "@/shared/i18n";

export const getUserColumns = (t: T_I18nContext["t"]) => [
  { key: "name", label: t("admin.user.table.name") },
  { key: "login", label: t("admin.user.table.login") },
  { key: "email", label: t("admin.user.table.email") },
  { key: "password", label: t("admin.user.table.password") },
  { key: "role", label: t("admin.user.table.role") },
  { key: "status", label: t("admin.user.table.status") },
  { key: "action", label: t("admin.user.table.action") },
] as const;