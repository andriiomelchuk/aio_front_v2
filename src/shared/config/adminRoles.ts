export type T_StaffRole =
  | "viewer"
  | "manager"
  | "admin"
  | "owner"
  | "developer";

export const assignableStaffRoles = [
  "owner",
  "admin",
  "manager",
  "viewer",
] as const satisfies readonly T_StaffRole[];

export const canAssignStaffRoles = (role: T_StaffRole) =>
  role === "developer" || role === "owner";
