import type { T_CreateUserDto, T_UpdateUserDto, T_User } from "@/entities/user";
import { ApiError } from "@/shared/api/core";

export type T_UsersApiErrorCode =
  | "NOT_FOUND"
  | "FETCH_FAILED"
  | "STORAGE_WRITE_FAILED";

export class UsersApiError extends ApiError<T_UsersApiErrorCode> {
  constructor(code: T_UsersApiErrorCode, message: string, options?: ErrorOptions) {
    super(code, message, options);
    this.name = "UsersApiError";
  }
}

export type T_UsersApiContract = {
  getUsers: () => Promise<T_User[]>;
  createUser: (input: T_CreateUserDto) => Promise<T_User>;
  updateUser: (input: T_UpdateUserDto) => Promise<T_User>;
  deleteUser: (id: number) => Promise<number>;
};
