import { T_OrderStatus } from "@/entities/order";

export const orderStatusBadgeVariant: Record<
  T_OrderStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  new: "neutral",
  processing: "warning",
  completed: "success",
  cancelled: "danger",
};


export const getOrderStatusLabel = (
  status: T_OrderStatus,
  t: (key: string) => string,
) => {
  return t(`admin.ecommerce.status.${status}`);
};

