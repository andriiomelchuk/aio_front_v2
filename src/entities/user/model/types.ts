export type T_UserRole = "Admin" | "Editor" | "User";
export type T_UserStatus = "active" | "invited" | "blocked";

export type T_User = {
  id: number;
  name: string;
  login: string;
  email: string;
  password: string;
  role: T_UserRole;
  status: T_UserStatus;
};

export type T_CreateUserDto = Omit<T_User, "id">;

export type T_UpdateUserDto = T_User;