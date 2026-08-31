export type T_OrderStatus = "new" | "processing" | "completed" | "cancelled";

export type T_Order = {
  id: string | number;
  price: number;
  status: T_OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type T_OrderSort = "default" | "price-asc" | "price-desc" | "id-asc" | "id-desc";
