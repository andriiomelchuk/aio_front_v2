import type { T_User } from "./types";

export const mockUsers: T_User[] = [
  {
    id: 1,
    name: "Anna Smith",
    email: "anna@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: 2,
    name: "Mark Stone",
    email: "mark@example.com",
    role: "Editor",
    status: "invited",
  },
];