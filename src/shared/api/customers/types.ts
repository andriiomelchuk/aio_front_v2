import type { T_CustomerStatus, T_CustomerType } from "@/entities/customer";

export type T_GetCustomersParams = {
  search?: string;
  status?: T_CustomerStatus;
  type?: T_CustomerType;
};
