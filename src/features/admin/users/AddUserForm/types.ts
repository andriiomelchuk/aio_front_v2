import { T_User, T_UserRole, T_UserStatus } from "@/entities/user";

export type T_UserData = {
  name: string;
  login: string;
  email: string;
  password: string;
  role: T_UserRole | "";
  status: T_UserStatus | "";
};

export type T_AddUserFormProps = {
  onCancel: () => void;
  onCreate: (user: T_User) => void;
};