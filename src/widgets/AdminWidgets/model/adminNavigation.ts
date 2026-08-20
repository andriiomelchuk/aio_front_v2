export const getAdminNavigation = (t: (key: string) => string) => [
  {
    href: "/admin",
    label: t("admin.navigation.dashboard.label"),
    title: t("admin.navigation.dashboard.title"),
    description: t("admin.navigation.dashboard.description"),
  },
  {
    href: "/admin/users",
    label: t("admin.navigation.users.label"),
    title: t("admin.navigation.users.title"),
    description: t("admin.navigation.users.description"),
  },
  {
    href: "/admin/ecommerce",
    label: t("admin.navigation.ecommerce.label"),
    title: t("admin.navigation.ecommerce.title"),
    description: t("admin.navigation.ecommerce.description"),
  },
  {
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