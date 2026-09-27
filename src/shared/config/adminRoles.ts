export type T_SystemStaffRole =
  | "viewer"
  | "manager"
  | "admin"
  | "owner"
  | "developer";
export type T_StaffRole = T_SystemStaffRole | `custom:${string}`;

export const assignableStaffRoles = [
  "owner",
  "admin",
  "manager",
  "viewer",
] as const satisfies readonly T_StaffRole[];

export const canAssignStaffRoles = (role: T_StaffRole) =>
  role === "developer" || role === "owner";
