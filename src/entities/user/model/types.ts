import type { T_StaffRole } from "@/shared/config/adminRoles";

export type T_UserRole = T_StaffRole;
export type T_UserStatus = "active" | "invited" | "blocked";

export type T_User = {
  id: number;
  name: string;
  login: string;
  email: string;
  role: T_UserRole;
  status: T_UserStatus;
  address?: T_UserAddress;
  phone?: string;
  company?: T_UserCompany;
  shipping?: T_ShippingAddress;
};

export type T_UserAddress = {
  country?: string;
  city?: string;
  street?: string,
  suite?: string,
  zipcode?: string,
}

export type T_UserCompany = {
  name: string;
  address: T_UserAddress;
  phone: string;
}

export type T_ShippingAddress = {
  country: string;
  city: string;
  street: string,
  suite: string,
  zipcode: string,
}

export type T_CreateUserDto = Omit<T_User, "id"> & { password: string };

export type T_UpdateUserDto = T_User;
