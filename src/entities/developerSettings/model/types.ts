import type { T_AdminModule } from "@/shared/config/adminModules";

export type T_DeveloperSettingsAuditEntry = {
  id: string;
  action: "update" | "import" | "reset";
  createdAt: string;
  updatedBy: string;
};

export type T_DeveloperSettings = {
  modules: Record<T_AdminModule, boolean>;
  diagnostics: {
    enabled: boolean;
    showStorageUsage: boolean;
  };
  updatedAt: string;
  updatedBy: string;
  changeLog: T_DeveloperSettingsAuditEntry[];
};

export type T_UpdateDeveloperSettingsDto = Omit<
  T_DeveloperSettings,
  "updatedAt" | "updatedBy" | "changeLog"
>;
