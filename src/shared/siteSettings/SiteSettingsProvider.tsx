"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { T_SiteSettings } from "@/entities/siteSettings";
import {
  getSiteSettingsStorageSnapshot,
  readSiteSettings,
  SITE_SETTINGS_CHANGE_EVENT,
} from "@/shared/api/siteSettings";

const SiteSettingsContext = createContext<T_SiteSettings | null>(null);

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(SITE_SETTINGS_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SITE_SETTINGS_CHANGE_EVENT, callback);
  };
};

export const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSiteSettingsStorageSnapshot,
    () => "",
  );
  const settings = useMemo(() => {
    void snapshot;
    return readSiteSettings();
  }, [snapshot]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return context;
};
