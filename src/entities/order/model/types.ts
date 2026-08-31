export type T_OrderStatus = "new" | "processing" | "completed" | "cancelled";

export type T_Order = {
  id: string | number;
  price: number;
  status: T_OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type T_UpdateOrderDto = T_Order;
