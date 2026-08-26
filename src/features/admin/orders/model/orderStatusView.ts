import type { T_OrderStatus } from "@/entities/order";
import type { T_I18nContext, T_I18nKey } from "@/shared/i18n";

export const orderStatusBadgeVariant: Record<
  T_OrderStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  new: "neutral",
  processing: "warning",
  completed: "success",
  cancelled: "danger",
};

const orderStatusLabelKey: Record<T_OrderStatus, T_I18nKey> = {
  new: "admin.orders.status.new",
  processing: "admin.orders.status.processing",
  completed: "admin.orders.status.completed",
  cancelled: "admin.orders.status.cancelled",
};

export const getOrderStatusLabel = (
  status: T_OrderStatus,
  t: T_I18nContext["t"],
) => {
  return t(orderStatusLabelKey[status]);
};

