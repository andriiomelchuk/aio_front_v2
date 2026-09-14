import Link from "next/link";
import type { T_Customer } from "@/entities/customer";
import type { T_I18nContext } from "@/shared/i18n";
import type { T_AdminTableColumn } from "@/widgets/AdminWidgets/AdminTable/types";
import { AdminBadge } from "@/widgets/AdminWidgets";
import {
  customerStatusBadgeVariant,
  getCustomerStatusLabel,
} from "./customerStatusView";

export type T_CustomerTableRow = {
  id: string;
  customer: string;
  email: string;
  type: string;
  status: React.ReactNode;
  action: React.ReactNode;
};

export const getCustomerColumns = (
  t: T_I18nContext["t"],
): readonly T_AdminTableColumn<T_CustomerTableRow>[] => [
  { key: "customer", label: t("admin.customers.table.customer") },
  { key: "email", label: t("admin.customers.table.email") },
  { key: "type", label: t("admin.customers.table.type") },
  { key: "status", label: t("admin.customers.table.status"), align: "center" },
  { key: "action", label: t("admin.customers.table.action"), align: "right" },
];

export const mapCustomerRows = (
  customers: T_Customer[],
  t: T_I18nContext["t"],
): T_CustomerTableRow[] => customers.map((customer) => ({
  id: customer.id,
  customer: `${customer.firstName} ${customer.lastName}`.trim(),
  email: customer.email,
  type: customer.type === "business"
    ? t("admin.customers.type.business")
    : t("admin.customers.type.individual"),
  status: (
    <AdminBadge variant={customerStatusBadgeVariant[customer.status]}>
      {getCustomerStatusLabel(customer.status, t)}
    </AdminBadge>
  ),
  action: (
    <Link
      href={`/admin/customers/${customer.id}`}
      className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-surface-muted"
      onClick={(event) => event.stopPropagation()}
    >
      {t("admin.customers.table.open")}
    </Link>
  ),
}));
