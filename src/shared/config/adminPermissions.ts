import type { T_StaffRole } from "./adminRoles";
import { adminModules, type T_AdminModule } from "./adminModules";

export type T_AdminPermission = "view" | "manage";

const rolePermissions: Record<
  T_StaffRole,
  Partial<Record<T_AdminModule, readonly T_AdminPermission[]>>
> = {
  developer: {
    dashboard: ["view", "manage"],
    users: ["view", "manage"],
    customers: ["view", "manage"],
    orders: ["view", "manage"],
    products: ["view", "manage"],
    categories: ["view", "manage"],
    pages: ["view", "manage"],
    menus: ["view", "manage"],
    analytics: ["view", "manage"],
    settings: ["view", "manage"],
  },
  owner: {
    dashboard: ["view", "manage"],
    users: ["view", "manage"],
    customers: ["view", "manage"],
    orders: ["view", "manage"],
    products: ["view", "manage"],
    categories: ["view", "manage"],
    pages: ["view", "manage"],
    menus: ["view", "manage"],
    analytics: ["view", "manage"],
    settings: ["view", "manage"],
  },
  admin: {
    dashboard: ["view", "manage"],
    customers: ["view", "manage"],
    orders: ["view", "manage"],
    products: ["view", "manage"],
    categories: ["view", "manage"],
    pages: ["view", "manage"],
    menus: ["view", "manage"],
    analytics: ["view", "manage"],
  },
  manager: {
    dashboard: ["view", "manage"],
    customers: ["view", "manage"],
    orders: ["view", "manage"],
    products: ["view", "manage"],
    categories: ["view", "manage"],
    pages: ["view", "manage"],
    menus: ["view", "manage"],
  },
  viewer: {
    dashboard: ["view"],
    customers: ["view"],
    orders: ["view"],
    products: ["view"],
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
  role === "viewer";

export const hasAdminPermission = (
  role: T_StaffRole,
  module: T_AdminModule,
  permission: T_AdminPermission = "view",
) =>
  (role === "developer" || adminModules[module]) &&
  Boolean(rolePermissions[role][module]?.includes(permission));

export const getAdminModuleFromPath = (pathName: string): T_AdminModule => {
  const segment = pathName.split("/").filter(Boolean)[1];
  return segment && segment in adminModules
    ? (segment as T_AdminModule)
    : "dashboard";
};
