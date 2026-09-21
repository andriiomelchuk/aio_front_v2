"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useAdminAccess } from "@/features/auth";
import { useDeveloperSettings } from "@/shared/developerSettings";
import { useI18n } from "@/shared/i18n";
import { DEVELOPER_SETTINGS_CHANGE_EVENT } from "@/shared/api/developerSettings";

const getStorageSize = () => {
  let bytes = 0;
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index) ?? "";
    bytes += key.length + (localStorage.getItem(key)?.length ?? 0);
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const subscribeToStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(DEVELOPER_SETTINGS_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DEVELOPER_SETTINGS_CHANGE_EVENT, callback);
  };
};

export const DeveloperDiagnostics = () => {
  const { t, locale } = useI18n();
  const { role } = useAdminAccess();
  const settings = useDeveloperSettings();
  const pathname = usePathname();
  const storageSize = useSyncExternalStore(subscribeToStorage, getStorageSize, () => "0.0 KB");

  if (role !== "developer" || !settings.diagnostics.enabled) return null;

  return <aside className="mb-4 border border-accent/40 bg-accent/5 px-4 py-3 text-xs text-muted" aria-label={t("admin.developerSettings.diagnostics.panel")}><div className="flex flex-wrap gap-x-6 gap-y-2">
    <span><strong className="text-foreground">{t("admin.developerSettings.diagnostics.environment")}:</strong> {process.env.NODE_ENV}</span>
    <span><strong className="text-foreground">{t("admin.developerSettings.diagnostics.route")}:</strong> {pathname}</span>
    <span><strong className="text-foreground">{t("admin.developerSettings.diagnostics.locale")}:</strong> {locale}</span>
    {settings.diagnostics.showStorageUsage && <span><strong className="text-foreground">localStorage:</strong> {storageSize}</span>}
  </div></aside>;
};
