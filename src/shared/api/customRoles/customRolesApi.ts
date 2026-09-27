import { customRoleActions, type T_CustomRole, type T_CustomRoleAuditAction, type T_CustomRoleAuditEntry, type T_CustomRoleId, type T_SaveCustomRoleDto } from "@/entities/customRole";
import { locales } from "@/shared/i18n";
import { adminModules, type T_AdminModule } from "@/shared/config/adminModules";
import { hasAdminPermission } from "@/shared/config/adminPermissions";
import type { T_StaffRole } from "@/shared/config/adminRoles";

export const CUSTOM_ROLES_STORAGE_KEY = "aio-custom-roles-v1";
const AUDIT_STORAGE_KEY = "aio-custom-role-audit-v1";
export const CUSTOM_ROLES_CHANGE_EVENT = "aio-custom-roles-change";

export class CustomRolesApiError extends Error {}

const storage = () => typeof window === "undefined" ? undefined : window.localStorage;
const createId = () => crypto.randomUUID();
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((item) => typeof item === "string");

export const isCustomRole = (value: unknown): value is T_CustomRole => {
  if (!value || typeof value !== "object") return false;
  const role = value as Partial<T_CustomRole>;
  if (typeof role.id !== "string" || !role.id.startsWith("custom:") || typeof role.key !== "string" || !["active", "archived"].includes(String(role.status))) return false;
  if (!role.translations || !locales.every((locale) => typeof role.translations?.[locale]?.name === "string" && typeof role.translations?.[locale]?.description === "string")) return false;
  if (!role.permissions || Object.entries(role.permissions).some(([module, actions]) => !(module in adminModules) || !Array.isArray(actions) || actions.some((action) => !customRoleActions.includes(action)))) return false;
  const restrictions = role.restrictions;
  return Boolean(restrictions && isStringArray(restrictions.branches) && isStringArray(restrictions.warehouses) && isStringArray(restrictions.serviceCategories) && typeof restrictions.ownRecordsOnly === "boolean" && typeof role.createdAt === "string" && typeof role.updatedAt === "string");
};

export const readCustomRolesSync = (): T_CustomRole[] => {
  try {
    const parsed: unknown = JSON.parse(storage()?.getItem(CUSTOM_ROLES_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isCustomRole) : [];
  } catch { return []; }
};

const write = (roles: T_CustomRole[]) => {
  const target = storage();
  if (!target) throw new CustomRolesApiError("Role storage is unavailable");
  target.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(roles));
  window.dispatchEvent(new Event(CUSTOM_ROLES_CHANGE_EVENT));
};

const audit = (roleId: T_CustomRoleId, action: T_CustomRoleAuditAction, actorRole: T_StaffRole, subjectId?: string) => {
  const target = storage();
  if (!target) return;
  const current = getCustomRoleAuditSync();
  const entry: T_CustomRoleAuditEntry = { id: createId(), roleId, action, actorRole, subjectId, createdAt: new Date().toISOString() };
  target.setItem(AUDIT_STORAGE_KEY, JSON.stringify([entry, ...current].slice(0, 100)));
};

export const getCustomRoleAuditSync = (): T_CustomRoleAuditEntry[] => {
  try {
    const parsed: unknown = JSON.parse(storage()?.getItem(AUDIT_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as T_CustomRoleAuditEntry[] : [];
  } catch { return []; }
};

const sanitizePermissions = (permissions: T_SaveCustomRoleDto["permissions"], actorRole: T_StaffRole) => Object.fromEntries(
  Object.entries(permissions).map(([module, actions]) => [module, (actions ?? []).filter((action) => hasAdminPermission(actorRole, module as T_AdminModule, action))]),
) as T_SaveCustomRoleDto["permissions"];

const validate = (input: T_SaveCustomRoleDto) => {
  if (!/^[a-z][a-z0-9-]{1,48}$/.test(input.key)) throw new CustomRolesApiError("Role key must use lowercase letters, numbers and hyphens");
  if (!locales.some((locale) => input.translations[locale].name.trim())) throw new CustomRolesApiError("At least one localized role name is required");
};

export const getCustomRoles = async () => readCustomRolesSync();
export const saveCustomRole = async (input: T_SaveCustomRoleDto, actorRole: T_StaffRole, action: T_CustomRoleAuditAction = input.id ? "update" : "create") => {
  if (actorRole !== "developer" && actorRole !== "owner") throw new CustomRolesApiError("Only an owner or developer can manage roles");
  validate(input);
  const roles = readCustomRolesSync();
  if (roles.some((role) => role.id !== input.id && role.key === input.key)) throw new CustomRolesApiError("Role key already exists");
  const current = roles.find((role) => role.id === input.id);
  const now = new Date().toISOString();
  const role: T_CustomRole = { ...input, permissions: sanitizePermissions(input.permissions, actorRole), id: current?.id ?? `custom:${createId()}`, createdAt: current?.createdAt ?? now, updatedAt: now };
  write([role, ...roles.filter((item) => item.id !== role.id)]);
  audit(role.id, action, actorRole);
  return role;
};

export const setCustomRoleStatus = async (id: T_CustomRoleId, status: T_CustomRole["status"], actorRole: T_StaffRole) => {
  if (actorRole !== "developer" && actorRole !== "owner") throw new CustomRolesApiError("Only an owner or developer can manage roles");
  const role = readCustomRolesSync().find((item) => item.id === id);
  if (!role) throw new CustomRolesApiError("Role not found");
  const updated = { ...role, status, updatedAt: new Date().toISOString() };
  write([updated, ...readCustomRolesSync().filter((item) => item.id !== id)]);
  audit(id, status === "archived" ? "archive" : "restore", actorRole);
  return updated;
};

export const recordCustomRoleAssignment = (roleId: T_CustomRoleId, actorRole: T_StaffRole, subjectId: string) => audit(roleId, "assign", actorRole, subjectId);
export const getCustomRole = (id: string) => readCustomRolesSync().find((role) => role.id === id);
