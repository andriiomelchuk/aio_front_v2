import { useState } from "react";
import type { T_User } from "./types";

export const mockUsers: T_User[] = [
    {
    id: 1,
    name: "Anna Smith",
    login: "anna",
    email: "anna@example.com",
    password: "123456",
    role: "Admin",
    status: "active",
  },
  {
    id: 2,
    name: "Mark Stone",
    login: "mark",
    email: "mark@example.com",
    password: "123456",
    role: "Editor",
    status: "invited",
  },
];

