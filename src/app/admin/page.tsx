"use client";

import { useI18n } from "@/shared/i18n";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";


export default function AdminPanel() {
  const { t } = useI18n();

  return (
    <AdminPage
      title={t("admin.dashboard.title")}
      description={t("admin.dashboard.description")}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminCard title={t("admin.dashboard.users.title")}>
          <p className="text-2xl font-semibold text-foreground">1,248</p>
          <p className="mt-1 text-sm text-muted">{t("admin.dashboard.users.description")}</p>
        </AdminCard>

        <AdminCard title={t("admin.dashboard.orders.title")}>
          <p className="text-2xl font-semibold text-foreground">342</p>
          <p className="mt-1 text-sm text-muted">{t("admin.dashboard.orders.description")}</p>
        </AdminCard>

        <AdminCard title={t("admin.dashboard.revenue.title")}>
          <p className="text-2xl font-semibold text-foreground">$18.2k</p>
          <p className="mt-1 text-sm text-muted">{t("admin.dashboard.revenue.description")}</p>
        </AdminCard>

        <AdminCard title={t("admin.dashboard.errors.title")}>
          <p className="text-2xl font-semibold text-danger">7</p>
          <p className="mt-1 text-sm text-muted">{t("admin.dashboard.errors.description")}</p>
        </AdminCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <AdminCard
          title={t("admin.dashboard.activity.title")}
          description={t("admin.dashboard.activity.description")}
        >
          <div className="space-y-3">
            <p className="text-sm text-foreground">{t("admin.dashboard.activity.newUser")}</p>
            <p className="text-sm text-foreground">{t("admin.dashboard.activity.orderCompleted")}</p>
            <p className="text-sm text-foreground">{t("admin.dashboard.activity.settingsUpdated")}</p>
          </div>
        </AdminCard>

        <AdminCard
          title={t("admin.dashboard.status.title")}
          description={t("admin.dashboard.status.description")}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">{t("admin.dashboard.status.api")}</span>
              <span className="text-accent">{t("admin.dashboard.status.online")}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted">{t("admin.dashboard.status.database")}</span>
              <span className="text-accent">{t("admin.dashboard.status.online")}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted">{t("admin.dashboard.status.storage")}</span>
              <span className="text-danger">{t("admin.dashboard.status.warning")}</span>
            </div>
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
