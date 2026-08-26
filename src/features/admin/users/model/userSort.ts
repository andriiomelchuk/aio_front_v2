import type { T_User } from "@/entities/user";


export type T_UserSort =
  | "default"
  | "name-asc"
  | "name-desc"
  | "role-asc"
  | "status-asc";

export const sortUsers = (
  users: T_User[],
  sort: T_UserSort,
): T_User[] => {
  const sortedUsers = [...users];

  switch (sort) {
    case "name-asc":
      return sortedUsers.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return sortedUsers.sort((a, b) => b.name.localeCompare(a.name));

    case "role-asc":
      return sortedUsers.sort((a, b) => a.role.localeCompare(b.role));

    case "status-asc":
      return sortedUsers.sort((a, b) => a.status.localeCompare(b.status));

    default:
      return sortedUsers;
  }
};
