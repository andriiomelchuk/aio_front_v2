import type { T_CreateUserDto, T_UpdateUserDto, T_User } from "@/entities/user";
import type { T_JsonPlaceholderUser } from "./types";

export const createUser = async (user: T_CreateUserDto) => {
  console.log("Create user request:", user);

  return {
    id: Date.now(),
    ...user,
  };
};

export const updateUser = async (user: T_UpdateUserDto) => {
  console.log("Update user request:", user);

  return user;
};

export const getUsers = async (): Promise<T_User[]> => {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const users: T_JsonPlaceholderUser[] = await response.json();

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    login: user.username,
    email: user.email,
    password: "1234567",
    role: "User",
    status: "active",
    phone: user.phone,
    address: {
      street: user.address.street,
      suite: user.address.suite,
      city: user.address.city,
      zipcode: user.address.zipcode,
    },
    company: {
      name: user.company.name,
      address: {
        street: user.address.street,
        suite: user.address.suite,
        city: user.address.city,
        zipcode: user.address.zipcode,
      },
      phone: user.phone,
    },
  }));
};
