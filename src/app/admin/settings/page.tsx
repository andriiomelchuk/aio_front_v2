"use client";

import { useI18n } from "@/shared/i18n";
import { Checkbox, Select, Switch, Textarea } from "@/shared/ui";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";


export default function SettingsPage() {
  const { t } = useI18n();

  return (
    <AdminPage
      title={t("admin.navigation.settings.title")}
      description={t("admin.navigation.settings.description")}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard
          title={t("admin.settings.general.title")}
          description={t("admin.settings.general.description")}
        >
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-foreground">
                {t("admin.settings.siteName")}
              </span>
              <input
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent"
                defaultValue="AIO Front"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">
                {t("admin.settings.enableNotifications")}
              </span>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </AdminCard>

        <AdminCard
          title={t("admin.settings.security.title")}
          description={t("admin.settings.security.description")}
        >
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">
                {t("admin.settings.twoFactorAuthentication")}
              </span>
              <input type="checkbox" />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2">
              <span className="text-sm text-foreground">
                {t("admin.settings.adminApprovalRequired")}
              </span>
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </AdminCard>
        <AdminCard
          title={t("admin.settings.appearance.title")}
          description={t("admin.settings.appearance.description")}
        >
          <div className="space-y-3">
            <Select
              name="status"
              defaultValue="all"
              aria-label={t("admin.settings.filterOrdersByStatus")}
              options={[
                { value: "all", label: t("admin.settings.status.all") },
                { value: "paid", label: t("admin.settings.status.paid") },
                { value: "pending", label: t("admin.settings.status.pending") },
                { value: "failed", label: t("admin.settings.status.failed") },
              ]}
            />
          </div>
        </AdminCard>
        <AdminCard
          title={t("admin.settings.productDescription.title")}
          description={t("admin.settings.productDescription.description")}
        >
          <Textarea
            label={t("admin.settings.productDescription.label")}
            name="description"
            placeholder={t("admin.settings.productDescription.placeholder")}
            defaultValue={t("admin.settings.productDescription.defaultValue")}
          />
        </AdminCard>
      </div>
      <AdminCard
        title={t("admin.settings.preferences.title")}
        description={t("admin.settings.preferences.description")}
      >
        <div className="space-y-3">
          <Switch
            name="maintenanceMode"
            label={t("admin.settings.maintenanceMode.label")}
            description={t("admin.settings.maintenanceMode.description")}
          />

          <Switch
            name="emailAlerts"
            label={t("admin.settings.emailAlerts.label")}
            description={t("admin.settings.emailAlerts.description")}
            defaultChecked
          />

          <Checkbox
            name="showAdvanced"
            label={t("admin.settings.showAdvanced.label")}
            description={t("admin.settings.showAdvanced.description")}
          />
        </div>
      </AdminCard>
    </AdminPage>
  );
}
