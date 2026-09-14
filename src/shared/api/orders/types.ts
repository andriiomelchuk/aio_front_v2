import type { T_OrderStatus } from "@/entities/order";

export type T_GetOrdersParams = {
  customerId?: string;
  status?: T_OrderStatus;
};
