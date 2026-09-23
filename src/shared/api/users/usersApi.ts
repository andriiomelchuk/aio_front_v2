import type { T_CreateUserDto, T_UpdateUserDto, T_User } from "@/entities/user";
import { createStaffAccount, deleteStaffAccount, updateStaffAccount } from "@/shared/api/auth";
import { UsersApiError, type T_UsersApiContract } from "./types";
import type { T_JsonPlaceholderUser } from "./providerTypes";

const USERS_STORAGE_KEY = "aio-staff-users";

const loadStoredUsers = (): T_User[] | null => {
  try {
    const value = localStorage.getItem(USERS_STORAGE_KEY);
    if (!value) return null;
    const users: unknown = JSON.parse(value);
    return Array.isArray(users) ? (users as T_User[]) : null;
  } catch {
    localStorage.removeItem(USERS_STORAGE_KEY);
    return null;
  }
};

const saveUsers = (users: T_User[]) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    throw new UsersApiError("STORAGE_WRITE_FAILED", "Could not save users", { cause: error });
  }
};

export const createUser = async (input: T_CreateUserDto): Promise<T_User> => {
  const { password, ...profile } = input;
  const user: T_User = { id: Date.now(), ...profile };
  await createStaffAccount({ userId: user.id, email: user.email, password, displayName: user.name, role: user.role, status: user.status });
  saveUsers([user, ...(loadStoredUsers() ?? [])]);
  return user;
};

export const updateUser = async (user: T_UpdateUserDto): Promise<T_User> => {
  const users = loadStoredUsers() ?? [];
  const currentUser = users.find((item) => item.id === user.id);
  if (!currentUser) throw new UsersApiError("NOT_FOUND", "User not found");
  const updatedUser: T_User = { ...currentUser, ...user, id: currentUser.id };
  saveUsers(users.map((item) => item.id === user.id ? updatedUser : item));
  updateStaffAccount({ userId: updatedUser.id, email: updatedUser.email, displayName: updatedUser.name, role: updatedUser.role, status: updatedUser.status });
  return updatedUser;
};

export const deleteUser = async (userId: number): Promise<number> => {
  const users = loadStoredUsers() ?? [];
  if (!users.some((user) => user.id === userId)) throw new UsersApiError("NOT_FOUND", "User not found");
  saveUsers(users.filter((user) => user.id !== userId));
  deleteStaffAccount(userId);
  return userId;
};

export const getUsers = async (): Promise<T_User[]> => {
  const storedUsers = loadStoredUsers();
  if (storedUsers) return storedUsers;
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!response.ok) throw new UsersApiError("FETCH_FAILED", "Failed to fetch users");
  const sourceUsers: T_JsonPlaceholderUser[] = await response.json();
  const users: T_User[] = sourceUsers.map((user) => ({
    id: user.id, name: user.name, login: user.username, email: user.email,
    role: "viewer", status: "invited", phone: user.phone,
    address: { street: user.address.street, suite: user.address.suite, city: user.address.city, zipcode: user.address.zipcode },
    company: { name: user.company.name, address: { street: user.address.street, suite: user.address.suite, city: user.address.city, zipcode: user.address.zipcode }, phone: user.phone },
  }));
  saveUsers(users);
  return users;
};

export const usersApi = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} satisfies T_UsersApiContract;
