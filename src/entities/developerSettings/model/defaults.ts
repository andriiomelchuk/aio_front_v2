import { adminModules } from "@/shared/config/adminModules";
import type { T_DeveloperSettings } from "./types";

export const defaultDeveloperSettings: T_DeveloperSettings = {
  modules: { ...adminModules },
  diagnostics: {
    enabled: false,
    showStorageUsage: true,
  },
  updatedAt: "",
  updatedBy: "",
  changeLog: [],
};
