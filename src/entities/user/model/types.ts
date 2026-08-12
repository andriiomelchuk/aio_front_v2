export type T_UserRole = "Admin" | "Editor" | "User";
export type T_UserStatus = "active" | "invited" | "blocked";

export type T_User = {
  id: number;
  name: string;
  email: string;
  role: T_UserRole;
  status: T_UserStatus;
};