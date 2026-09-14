import type { T_CustomerStatus } from "@/entities/customer";
import type { T_I18nContext, T_I18nKey } from "@/shared/i18n";

export const customerStatusBadgeVariant: Record<
  T_CustomerStatus,
  "success" | "warning" | "danger"
> = {
  active: "success",
  inactive: "warning",
  blocked: "danger",
};

const customerStatusLabelKey: Record<T_CustomerStatus, T_I18nKey> = {
  active: "admin.customers.status.active",
  inactive: "admin.customers.status.inactive",
  blocked: "admin.customers.status.blocked",
};

export const getCustomerStatusLabel = (
  status: T_CustomerStatus,
  t: T_I18nContext["t"],
) => t(customerStatusLabelKey[status]);
