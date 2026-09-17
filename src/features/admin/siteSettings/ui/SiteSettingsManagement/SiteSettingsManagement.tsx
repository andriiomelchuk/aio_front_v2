"use client";

import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import type { T_SiteCurrency, T_SiteLocale, T_SiteSettings } from "@/entities/siteSettings";
import { useAdminAccess } from "@/features/auth";
import { importSiteSettings, resetSiteSettings, SiteSettingsApiError, updateSiteSettings } from "@/shared/api/siteSettings";
import { useI18n } from "@/shared/i18n";
import { useSiteSettings } from "@/shared/siteSettings";
import { Button, ImagePicker, Input, Select, Switch, Textarea } from "@/shared/ui";
import { AdminCard, AdminPage } from "@/widgets/AdminWidgets";

const locales: T_SiteLocale[] = ["uk", "en", "de", "ru"];
const currencies: T_SiteCurrency[] = ["UAH", "USD", "EUR", "GBP"];
const timezones = ["Europe/Kyiv", "Europe/Berlin", "Europe/London", "America/New_York", "UTC"];

export const SiteSettingsManagement = () => {
  const { t } = useI18n();
  const { canManage, session } = useAdminAccess();
  const currentSettings = useSiteSettings();
  const importRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<T_SiteSettings>(currentSettings);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const patchSection = <K extends Exclude<keyof T_SiteSettings, "updatedAt">>(section: K, values: Partial<T_SiteSettings[K]>) =>
    setSettings((current) => ({ ...current, [section]: Object.assign({}, current[section], values) }));

  const run = async (action: () => Promise<T_SiteSettings>, successMessage: string) => {
    setIsBusy(true); setError(""); setMessage("");
    try {
      const saved = await action(); setSettings(saved); setMessage(successMessage);
    } catch (caughtError) {
      setError(caughtError instanceof SiteSettingsApiError && caughtError.code === "INVALID_SETTINGS" ? t("admin.settings.error.invalid") : t("admin.settings.error.save"));
    } finally { setIsBusy(false); }
  };

  const save = () => {
    const input = {
      general: settings.general, localization: settings.localization,
      contact: settings.contact, commerce: settings.commerce,
      seo: settings.seo, operations: settings.operations,
    };
    return run(() => updateSiteSettings(input, session?.displayName), t("admin.settings.success.saved"));
  };
  const reset = () => {
    if (window.confirm(t("admin.settings.resetConfirmation"))) void run(() => resetSiteSettings(session?.displayName), t("admin.settings.success.reset"));
  };
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "site-settings.json"; anchor.click(); URL.revokeObjectURL(url);
  };
  const importJson = async (file: File) => {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      await run(() => importSiteSettings(parsed, session?.displayName), t("admin.settings.success.imported"));
    }
    catch { setError(t("admin.settings.error.import")); }
    finally { if (importRef.current) importRef.current.value = ""; }
  };

  return <AdminPage title={t("admin.settings.title")} description={t("admin.settings.description")} actions={canManage ? <>
    <Button variant="secondary" className="inline-flex h-10 items-center justify-center gap-2" onClick={exportJson}><Download size={18} />{t("admin.settings.actions.export")}</Button>
    <Button variant="secondary" className="inline-flex h-10 items-center justify-center gap-2" onClick={() => importRef.current?.click()}><Upload size={18} />{t("admin.settings.actions.import")}</Button>
    <Button variant="secondary" className="inline-flex h-10 items-center justify-center gap-2" disabled={isBusy} onClick={reset}><RotateCcw size={18} />{t("admin.settings.actions.reset")}</Button>
    <Button className="h-10" disabled={isBusy} onClick={() => void save()}>{t("admin.actions.saveChanges")}</Button>
    <input ref={importRef} className="hidden" type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importJson(file); }} />
  </> : undefined}>
    <div className="space-y-4">
      {(error || message) && <p role={error ? "alert" : "status"} className={`rounded-md border p-3 text-sm ${error ? "border-danger bg-danger/10 text-danger" : "border-accent bg-accent/10 text-foreground"}`}>{error || message}</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        <AdminCard title={t("admin.settings.general.title")} description={t("admin.settings.general.description")}><div className="space-y-4">
          <Input type="text" label={t("admin.settings.fields.siteName")} value={settings.general.siteName} disabled={!canManage} onChange={(event) => patchSection("general", { siteName: event.target.value })} required />
          <Textarea label={t("admin.settings.fields.siteDescription")} value={settings.general.siteDescription} disabled={!canManage} onChange={(event) => patchSection("general", { siteDescription: event.target.value })} />
          <ImagePicker label={t("admin.settings.fields.logo")} value={settings.general.logoUrl} alt={settings.general.siteName} onChange={(logoUrl) => patchSection("general", { logoUrl })} />
        </div></AdminCard>
        <AdminCard title={t("admin.settings.localization.title")} description={t("admin.settings.localization.description")}><div className="grid gap-4 sm:grid-cols-2">
          <Select label={t("admin.settings.fields.defaultLocale")} value={settings.localization.defaultLocale} disabled={!canManage} onChange={(event) => patchSection("localization", { defaultLocale: event.target.value as T_SiteLocale })} options={locales.map((locale) => ({ value: locale, label: t(`language.${locale}`) }))} />
          <Select label={t("admin.settings.fields.currency")} value={settings.localization.currency} disabled={!canManage} onChange={(event) => patchSection("localization", { currency: event.target.value as T_SiteCurrency })} options={currencies.map((currency) => ({ value: currency, label: currency }))} />
          <Select label={t("admin.settings.fields.timezone")} value={settings.localization.timezone} disabled={!canManage} onChange={(event) => patchSection("localization", { timezone: event.target.value })} options={timezones.map((timezone) => ({ value: timezone, label: timezone }))} className="sm:col-span-2" />
        </div></AdminCard>
        <AdminCard title={t("admin.settings.contact.title")} description={t("admin.settings.contact.description")}><div className="grid gap-4 sm:grid-cols-2">
          <Input type="email" label={t("admin.settings.fields.email")} value={settings.contact.email} disabled={!canManage} onChange={(event) => patchSection("contact", { email: event.target.value })} />
          <Input type="tel" label={t("admin.settings.fields.phone")} value={settings.contact.phone} disabled={!canManage} onChange={(event) => patchSection("contact", { phone: event.target.value })} />
          <Input type="text" label={t("admin.settings.fields.address")} value={settings.contact.address} disabled={!canManage} onChange={(event) => patchSection("contact", { address: event.target.value })} />
          <Input type="url" label="Facebook" value={settings.contact.facebookUrl} disabled={!canManage} onChange={(event) => patchSection("contact", { facebookUrl: event.target.value })} />
          <Input type="url" label="Instagram" value={settings.contact.instagramUrl} disabled={!canManage} onChange={(event) => patchSection("contact", { instagramUrl: event.target.value })} />
        </div></AdminCard>
        <AdminCard title={t("admin.settings.commerce.title")} description={t("admin.settings.commerce.description")}><div className="grid gap-4 sm:grid-cols-2">
          <Input type="number" min={0} label={t("admin.settings.fields.lowStockThreshold")} value={settings.commerce.lowStockThreshold} disabled={!canManage} onChange={(event) => patchSection("commerce", { lowStockThreshold: Number(event.target.value) })} />
          <Input type="text" label={t("admin.settings.fields.orderPrefix")} value={settings.commerce.orderPrefix} disabled={!canManage} onChange={(event) => patchSection("commerce", { orderPrefix: event.target.value })} />
          <Switch label={t("admin.settings.fields.showOutOfStock")} checked={settings.commerce.showOutOfStockProducts} disabled={!canManage} onChange={(event) => patchSection("commerce", { showOutOfStockProducts: event.target.checked })} />
          <Switch label={t("admin.settings.fields.allowBackorders")} checked={settings.commerce.allowBackorders} disabled={!canManage} onChange={(event) => patchSection("commerce", { allowBackorders: event.target.checked })} />
        </div></AdminCard>
        <AdminCard title={t("admin.settings.seo.title")} description={t("admin.settings.seo.description")}><div className="space-y-4">
          <Input type="text" label={t("admin.settings.fields.defaultTitle")} value={settings.seo.defaultTitle} disabled={!canManage} onChange={(event) => patchSection("seo", { defaultTitle: event.target.value })} />
          <Textarea label={t("admin.settings.fields.defaultDescription")} value={settings.seo.defaultDescription} disabled={!canManage} onChange={(event) => patchSection("seo", { defaultDescription: event.target.value })} />
          <Input type="text" label={t("admin.settings.fields.keywords")} value={settings.seo.keywords} disabled={!canManage} onChange={(event) => patchSection("seo", { keywords: event.target.value })} />
          <ImagePicker label={t("admin.settings.fields.socialImage")} value={settings.seo.socialImageUrl} alt={settings.seo.defaultTitle} onChange={(socialImageUrl) => patchSection("seo", { socialImageUrl })} />
        </div></AdminCard>
        <AdminCard title={t("admin.settings.operations.title")} description={t("admin.settings.operations.description")}><div className="space-y-4">
          <Switch label={t("admin.settings.fields.maintenanceMode")} description={t("admin.settings.fields.maintenanceModeDescription")} checked={settings.operations.maintenanceMode} disabled={!canManage} onChange={(event) => patchSection("operations", { maintenanceMode: event.target.checked })} />
          <Switch label={t("admin.settings.fields.emailNotifications")} checked={settings.operations.emailNotifications} disabled={!canManage} onChange={(event) => patchSection("operations", { emailNotifications: event.target.checked })} />
          {settings.updatedAt && <p className="text-xs text-muted">{t("admin.settings.lastUpdated", { value: new Date(settings.updatedAt).toLocaleString() })}</p>}
          {settings.updatedBy && <p className="text-xs text-muted">{t("admin.settings.updatedBy", { value: settings.updatedBy })}</p>}
          {settings.changeLog.length > 0 && <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">{t("admin.settings.audit.title")}</p>
            <ul className="mt-2 space-y-2">
              {settings.changeLog.slice(0, 5).map((entry) => <li key={entry.id} className="text-xs text-muted">
                {t(`admin.settings.audit.${entry.action}`)} · {entry.updatedBy} · {new Date(entry.createdAt).toLocaleString()}
              </li>)}
            </ul>
          </div>}
        </div></AdminCard>
      </div>
    </div>
  </AdminPage>;
};
