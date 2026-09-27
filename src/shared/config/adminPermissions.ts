import type { T_CustomRoleAction } from "@/entities/customRole";
import type { T_StaffRole, T_SystemStaffRole } from "./adminRoles";
import { adminModules, type T_AdminModule } from "./adminModules";

export type T_AdminPermission = T_CustomRoleAction;

const rolePermissions: Record<
  T_SystemStaffRole,
  Partial<Record<T_AdminModule, readonly T_AdminPermission[]>>
> = {
  developer: {
    dashboard: ["view", "manage"],
    users: ["view", "manage"],
    roles: ["view", "create", "edit", "delete", "approve", "export", "manage"],
    staff: ["view", "create", "edit", "delete", "approve", "export", "manage"],
    payroll: ["view", "create", "edit", "delete", "approve", "export", "manage"],
    customers: ["view", "manage"],
    orders: ["view", "manage"],
    products: ["view", "manage"],
    warehouse: ["view", "manage"],
    imports: ["view", "manage"],
    services: ["view", "manage"],
    categories: ["view", "manage"],
    pages: ["view", "manage"],
    menus: ["view", "manage"],
    translations: ["view", "manage"],
    analytics: ["view", "manage"],
    settings: ["view", "manage"],
    developerSettings: ["view", "manage"],
  },
  owner: {
    dashboard: ["view", "manage"],
    users: ["view", "manage"],
    roles: ["view", "create", "edit", "delete", "approve", "export", "manage"],
    staff: ["view", "create", "edit", "delete", "approve", "export", "manage"],
    payroll: ["view", "create", "edit", "delete", "approve", "export", "manage"],
    customers: ["view", "manage"],
    orders: ["view", "manage"],
    products: ["view", "manage"],
    warehouse: ["view", "manage"],
    imports: ["view", "manage"],
    services: ["view", "manage"],
    categories: ["view", "manage"],
    pages: ["view", "manage"],
    menus: ["view", "manage"],
    translations: ["view", "manage"],
    analytics: ["view", "manage"],
    settings: ["view", "manage"],
  },
  admin: {
    dashboard: ["view", "manage"],
    customers: ["view", "manage"],
    orders: ["view", "manage"],
    products: ["view", "manage"],
    warehouse: ["view", "manage"],
    imports: ["view", "manage"],
    services: ["view", "manage"],
    staff: ["view", "create", "edit", "approve", "export", "manage"],
    payroll: ["view", "create", "edit", "approve", "export", "manage"],
    categories: ["view", "manage"],
    pages: ["view", "manage"],
    menus: ["view", "manage"],
    translations: ["view", "manage"],
    analytics: ["view", "manage"],
  },
  manager: {
    dashboard: ["view", "manage"],
    customers: ["view", "manage"],
    orders: ["view", "manage"],
    products: ["view", "manage"],
    warehouse: ["view", "manage"],
    imports: ["view", "manage"],
    services: ["view", "manage"],
    staff: ["view", "create", "edit", "approve", "export", "manage"],
    payroll: ["view", "create", "edit", "export"],
    categories: ["view", "manage"],
    pages: ["view", "manage"],
    menus: ["view", "manage"],
  },
  viewer: {
    dashboard: ["view"],
    customers: ["view"],
    orders: ["view"],
    products: ["view"],
    warehouse: ["view"],
    imports: ["view"],
    services: ["view"],
    staff: ["view"],
    categories: ["view"],
    pages: ["view"],
    menus: ["view"],
  },
};

export const isStaffRole = (role: string): role is T_StaffRole =>
  role === "developer" ||
  role === "owner" ||
  role === "admin" ||
  role === "manager" ||
  role === "viewer" || role.startsWith("custom:");

const getCustomPermissions = (role: T_StaffRole, module: T_AdminModule) => {
  if (!role.startsWith("custom:") || typeof window === "undefined") return [];
  try {
    const roles = JSON.parse(localStorage.getItem("aio-custom-roles-v1") ?? "[]") as Array<{ id?: string; status?: string; permissions?: Partial<Record<T_AdminModule, T_AdminPermission[]>> }>;
    const customRole = roles.find((item) => item.id === role && item.status === "active");
    return customRole?.permissions?.[module] ?? [];
  } catch { return []; }
};

export const hasAdminPermission = (
  role: T_StaffRole,
  module: T_AdminModule,
  permission: T_AdminPermission = "view",
) => {
  const permissions = role.startsWith("custom:")
    ? getCustomPermissions(role, module)
    : rolePermissions[role as T_SystemStaffRole][module] ?? [];
  return permissions.includes(permission) || (permission !== "view" && permissions.includes("manage"));
};

export const getAdminModuleFromPath = (pathName: string): T_AdminModule => {
  const segment = pathName.split("/").filter(Boolean)[1];
  if (segment === "developer-settings") return "developerSettings";
  return segment && segment in adminModules
    ? (segment as T_AdminModule)
    : "dashboard";
};
