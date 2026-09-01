import type { T_I18nContext } from "@/shared/i18n";

export const getAdminNavigation = (t: T_I18nContext["t"]) => [
  {
    href: "/admin",
    label: t("admin.navigation.dashboard.label"),
    title: t("admin.navigation.dashboard.title"),
    description: t("admin.navigation.dashboard.description"),
  },
  {
    module: "users",
    href: "/admin/users",
    label: t("admin.navigation.users.label"),
    title: t("admin.navigation.users.title"),
    description: t("admin.navigation.users.description"),
  },
  {
    module: "orders",
    href: "/admin/orders",
    label: t("admin.navigation.orders.label"),
    title: t("admin.navigation.orders.title"),
    description: t("admin.navigation.orders.description"),
  },
  {
    module: "products",
    href: "/admin/products",
    label: t("admin.navigation.products.label"),
    title: t("admin.navigation.products.title"),
    description: t("admin.navigation.products.description"),
  },
  {
    module: "categories",
    href: "/admin/categories",
    label: t("admin.navigation.categories.label"),
    title: t("admin.navigation.categories.title"),
    description: t("admin.navigation.categories.description"),
  },
  {
    module: "analytics",
    href: "/admin/analytics",
    label: t("admin.navigation.analytics.label"),
    title: t("admin.navigation.analytics.title"),
    description: t("admin.navigation.analytics.description"),
  },
  {
    href: "/admin/settings",
    label: t("admin.navigation.settings.label"),
    title: t("admin.navigation.settings.title"),
    description: t("admin.navigation.settings.description"),
  },
] as const;
