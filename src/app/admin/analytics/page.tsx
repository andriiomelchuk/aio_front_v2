"use client";

import { useI18n } from "@/shared/i18n";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";


export default function AnalyticsPage() {
  const { t } = useI18n();

  return (
    <AdminPage
      title={t("admin.analytics.title")}
      description={t("admin.analytics.description")}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminCard title={t("admin.analytics.visitors.title")}>
          <p className="text-2xl font-semibold text-foreground">24.8k</p>
          <p className="mt-1 text-sm text-muted">{t("admin.analytics.visitors.description")}</p>
        </AdminCard>

        <AdminCard title={t("admin.analytics.conversion.title")}>
          <p className="text-2xl font-semibold text-foreground">6.4%</p>
          <p className="mt-1 text-sm text-muted">{t("admin.analytics.conversion.description")}</p>
        </AdminCard>

        <AdminCard title={t("admin.analytics.bounceRate.title")}>
          <p className="text-2xl font-semibold text-foreground">38%</p>
          <p className="mt-1 text-sm text-muted">{t("admin.analytics.bounceRate.description")}</p>
        </AdminCard>

        <AdminCard title={t("admin.analytics.avgSession.title")}>
          <p className="text-2xl font-semibold text-foreground">3m 42s</p>
          <p className="mt-1 text-sm text-muted">{t("admin.analytics.avgSession.description")}</p>
        </AdminCard>
      </div>

      <div className="mt-4">
        <AdminCard
          title={t("admin.analytics.trafficOverview.title")}
          description={t("admin.analytics.trafficOverview.description")}
        >
          <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-border bg-background text-sm text-muted">
            {t("admin.analytics.chartPlaceholder")}
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
