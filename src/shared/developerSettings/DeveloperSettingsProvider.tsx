"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { T_DeveloperSettings } from "@/entities/developerSettings";
import {
  DEVELOPER_SETTINGS_CHANGE_EVENT,
  getDeveloperSettingsStorageSnapshot,
  readDeveloperSettings,
} from "@/shared/api/developerSettings";
import type { T_AdminModule } from "@/shared/config/adminModules";

const DeveloperSettingsContext = createContext<T_DeveloperSettings | null>(null);

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(DEVELOPER_SETTINGS_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DEVELOPER_SETTINGS_CHANGE_EVENT, callback);
  };
};

export const DeveloperSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const snapshot = useSyncExternalStore(subscribe, getDeveloperSettingsStorageSnapshot, () => "");
  const settings = useMemo(() => {
    void snapshot;
    return readDeveloperSettings();
  }, [snapshot]);

  return <DeveloperSettingsContext.Provider value={settings}>{children}</DeveloperSettingsContext.Provider>;
};

export const useDeveloperSettings = () => {
  const settings = useContext(DeveloperSettingsContext);
  if (!settings) throw new Error("useDeveloperSettings must be used within DeveloperSettingsProvider");
  return settings;
};

export const useIsAdminModuleEnabled = (module: T_AdminModule) => {
  const settings = useDeveloperSettings();
  return settings.modules[module];
};
