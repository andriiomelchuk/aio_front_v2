import type { T_User } from "@/entities/user";

export type T_UsersModalsProps = {
  isAddUserOpen: boolean;
  selectedUser: T_User | null;
  onCloseAddUser: () => void;
  onCloseEditUser: () => void;
  onCreateUser: (user: T_User) => void;
  onUpdateUser: (user: T_User) => void;
};