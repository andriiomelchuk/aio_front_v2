import type { T_StaffRole } from "@/shared/config/adminRoles";

export type { T_StaffRole } from "@/shared/config/adminRoles";
export type T_AuthRole = "customer" | T_StaffRole;

export type T_AuthSession = {
  id: string;
  customerId: string;
  email: string;
  displayName: string;
  role: T_AuthRole;
  expiresAt: string;
};

export type T_RegisterCredentials = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  marketingConsent: boolean;
};

export type T_LoginCredentials = {
  email: string;
  password: string;
};

export type T_StaffAccountInput = {
  userId: number;
  email: string;
  password: string;
  displayName: string;
  role: T_StaffRole;
  status: "active" | "invited" | "blocked";
};

export type T_UpdateStaffAccountInput = Omit<T_StaffAccountInput, "password">;

export type T_AuthErrorCode =
  | "EMAIL_EXISTS"
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_UNAVAILABLE";

export class AuthApiError extends Error {
  constructor(public readonly code: T_AuthErrorCode) {
    super(code);
    this.name = "AuthApiError";
  }
}
