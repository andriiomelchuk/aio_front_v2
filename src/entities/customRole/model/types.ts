import type { T_Locale } from "@/shared/i18n";
import type { T_AdminModule } from "@/shared/config/adminModules";

export const customRoleActions = ["view", "create", "edit", "delete", "approve", "export", "manage"] as const;
export type T_CustomRoleAction = (typeof customRoleActions)[number];
export type T_CustomRoleId = `custom:${string}`;
export type T_CustomRoleStatus = "active" | "archived";

export type T_CustomRoleRestriction = {
  branches: string[];
  warehouses: string[];
  serviceCategories: string[];
  ownRecordsOnly: boolean;
};

export type T_CustomRole = {
  id: T_CustomRoleId;
  key: string;
  status: T_CustomRoleStatus;
  translations: Record<T_Locale, { name: string; description: string }>;
  permissions: Partial<Record<T_AdminModule, T_CustomRoleAction[]>>;
  restrictions: T_CustomRoleRestriction;
  createdAt: string;
  updatedAt: string;
};

export type T_SaveCustomRoleDto = Omit<T_CustomRole, "id" | "createdAt" | "updatedAt"> & {
  id?: T_CustomRoleId;
};

export type T_CustomRoleAuditAction = "create" | "update" | "duplicate" | "archive" | "restore" | "assign";
export type T_CustomRoleAuditEntry = {
  id: string;
  roleId: T_CustomRoleId;
  action: T_CustomRoleAuditAction;
  actorRole: string;
  subjectId?: string;
  createdAt: string;
};
