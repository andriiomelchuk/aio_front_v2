import { T_Orders, T_OrderStatus } from "@/entities/order";

  export const orderStatusBadgeVariant: Record<
    T_OrderStatus,
    "success" | "warning" | "danger" | "neutral"
  > = {
    new: "neutral",
    processing: "warning",
    completed: "success",
    cancelled: "danger",
  };

  export const orderStatusLabel: Record<T_Orders["status"], string> = {
    new: "New",
    processing: "Processing",
    completed: "Completed",
    cancelled: "Cancelled",
  };