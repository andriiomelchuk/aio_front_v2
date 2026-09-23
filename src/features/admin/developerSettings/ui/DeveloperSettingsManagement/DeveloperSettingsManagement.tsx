"use client";

import { useRef, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import type { T_DeveloperSettings } from "@/entities/developerSettings";
import { useAdminAccess } from "@/features/auth";
import { DeveloperSettingsApiError, importDeveloperSettings, resetDeveloperSettings, updateDeveloperSettings } from "@/shared/api/developerSettings";
import { adminModules, type T_AdminModule } from "@/shared/config/adminModules";
import { useDeveloperSettings } from "@/shared/developerSettings";
import { useI18n } from "@/shared/i18n";
import { Button, Switch } from "@/shared/ui";
import { AdminCard, AdminFormAlert, AdminPage } from "@/widgets/AdminWidgets";
import { useUnsavedChanges } from "@/shared/hooks";

const configurableModules = Object.keys(adminModules).filter(
  (module): module is T_AdminModule => module !== "developerSettings" && module !== "dashboard",
);

export const DeveloperSettingsManagement = () => {
  const { t } = useI18n();
  const { role, session } = useAdminAccess();
  const currentSettings = useDeveloperSettings();
  const [settings, setSettings] = useState<T_DeveloperSettings>(currentSettings);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(currentSettings));
  const importRef = useRef<HTMLInputElement>(null);
  const canManage = role === "developer";
  const isDirty = JSON.stringify(settings) !== savedSnapshot;
  useUnsavedChanges(isDirty && !isBusy);

  const run = async (action: () => Promise<T_DeveloperSettings>, success: string) => {
    setIsBusy(true); setError(""); setMessage("");
    try { const saved = await action(); setSettings(saved); setSavedSnapshot(JSON.stringify(saved)); setMessage(success); }
    catch (caughtError) { setError(caughtError instanceof DeveloperSettingsApiError ? caughtError.message : t("admin.developerSettings.error.save")); }
    finally { setIsBusy(false); }
  };

  const save = () => run(
    () => updateDeveloperSettings({ modules: settings.modules, diagnostics: settings.diagnostics }, session?.displayName),
    t("admin.developerSettings.success.saved"),
  );
  const reset = () => { if (window.confirm(t("admin.developerSettings.resetConfirmation"))) void run(() => resetDeveloperSettings(session?.displayName), t("admin.developerSettings.success.reset")); };
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "developer-settings.json"; anchor.click(); URL.revokeObjectURL(url);
  };
  const importJson = async (file: File) => {
    try { const parsed: unknown = JSON.parse(await file.text()); await run(() => importDeveloperSettings(parsed, session?.displayName), t("admin.developerSettings.success.imported")); }
    catch (caughtError) { setError(caughtError instanceof DeveloperSettingsApiError ? caughtError.message : t("admin.developerSettings.error.import")); }
    finally { if (importRef.current) importRef.current.value = ""; }
  };

  return <AdminPage title={t("admin.developerSettings.title")} description={t("admin.developerSettings.description")} actions={<>
    <Button variant="secondary" className="inline-flex h-10 items-center gap-2" onClick={exportJson}><Download size={18} />{t("admin.settings.actions.export")}</Button>
    <Button variant="secondary" className="inline-flex h-10 items-center gap-2" onClick={() => importRef.current?.click()}><Upload size={18} />{t("admin.settings.actions.import")}</Button>
    <Button variant="secondary" className="inline-flex h-10 items-center gap-2" disabled={isBusy} onClick={reset}><RotateCcw size={18} />{t("admin.settings.actions.reset")}</Button>
    <Button className="h-10" disabled={isBusy} aria-busy={isBusy} onClick={() => void save()}>{isBusy ? t("admin.form.saving") : t("admin.actions.saveChanges")}</Button>
    <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importJson(file); }} />
  </>}>
    <div className="space-y-4">
      <AdminFormAlert message={error} />
      {message && <p role="status" className="rounded-md border border-accent bg-accent/10 p-3 text-sm text-foreground">{message}</p>}
      <div className="grid gap-4 xl:grid-cols-2">
        <AdminCard title={t("admin.developerSettings.modules.title")} description={t("admin.developerSettings.modules.description")}><div className="grid gap-3 sm:grid-cols-2">
          {configurableModules.map((module) => <Switch key={module} label={t(`admin.navigation.${module}.label`)} checked={settings.modules[module]} disabled={!canManage} onChange={(event) => setSettings((current) => ({ ...current, modules: { ...current.modules, [module]: event.target.checked } }))} />)}
        </div><p className="mt-4 border-t border-border pt-3 text-xs text-muted">{t("admin.developerSettings.modules.protected")}</p></AdminCard>
        <AdminCard title={t("admin.developerSettings.diagnostics.title")} description={t("admin.developerSettings.diagnostics.description")}><div className="space-y-3">
          <Switch label={t("admin.developerSettings.diagnostics.enabled")} checked={settings.diagnostics.enabled} disabled={!canManage} onChange={(event) => setSettings((current) => ({ ...current, diagnostics: { ...current.diagnostics, enabled: event.target.checked } }))} />
          <Switch label={t("admin.developerSettings.diagnostics.storage")} checked={settings.diagnostics.showStorageUsage} disabled={!canManage || !settings.diagnostics.enabled} onChange={(event) => setSettings((current) => ({ ...current, diagnostics: { ...current.diagnostics, showStorageUsage: event.target.checked } }))} />
        </div></AdminCard>
        <AdminCard title={t("admin.developerSettings.audit.title")} description={t("admin.developerSettings.audit.description")}>
          {settings.changeLog.length ? <ul className="space-y-2">{settings.changeLog.slice(0, 10).map((entry) => <li key={entry.id} className="text-sm text-muted">{t(`admin.developerSettings.audit.${entry.action}`)} | {entry.updatedBy} | {new Date(entry.createdAt).toLocaleString()}</li>)}</ul> : <p className="text-sm text-muted">{t("admin.developerSettings.audit.empty")}</p>}
        </AdminCard>
      </div>
    </div>
  </AdminPage>;
};
