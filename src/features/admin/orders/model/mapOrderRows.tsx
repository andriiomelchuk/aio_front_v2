import type { T_Order } from "@/entities/order";
import type { T_ProductCurrency } from "@/entities/product";
import type { T_I18nContext } from "@/shared/i18n";
import { AdminBadge } from "@/widgets/AdminWidgets";
import { orderStatusBadgeVariant, getOrderStatusLabel } from "./orderStatusView";
import Link from "next/link";

export const mapOrderRows = (
  orders: T_Order[],
  t: T_I18nContext["t"],
  formatPrice: (value: number, currency?: T_ProductCurrency) => string,
  formatDate: (value: string) => string,
) => {
  return orders.map((order) => ({
    id: order.id,
    orderId: `#${order.id}`,
    price: formatPrice(order.totals?.total ?? order.price, order.currency),
    createdAt: formatDate(order.createdAt),
    updatedAt: formatDate(order.updatedAt),
    status: (
      <AdminBadge variant={orderStatusBadgeVariant[order.status]}>
        {getOrderStatusLabel(order.status, t)}
      </AdminBadge>
    ),
    action: (
      <Link
        href={`/admin/orders/${encodeURIComponent(order.id)}`}
        className="inline-flex h-10 items-center rounded-md px-4 text-sm hover:bg-surface-muted"
        onClick={(event) => event.stopPropagation()}
      >
        {t("admin.orders.table.view")}
      </Link>
    ),
  }));
};
