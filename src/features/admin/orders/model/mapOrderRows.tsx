import type { T_Order } from "@/entities/order";
import type { T_I18nContext } from "@/shared/i18n";
import { AdminBadge } from "@/widgets/AdminWidgets";
import { orderStatusBadgeVariant, getOrderStatusLabel } from "./orderStatusView";
import { Button } from "@/shared/ui";

export const mapOrderRows = (
  orders: T_Order[],
  t: T_I18nContext["t"],
  onEdit: (user: T_Order) => void, 
) => {
  return orders.map((order) => ({
    id: order.id,
    orderId: `#${order.id}`,
    price: `$${order.price}`,
    createdAt: order.createdAt || "-",
    updatedAt: order.updatedAt || "-",
    status: (
      <AdminBadge variant={orderStatusBadgeVariant[order.status]}>
        {getOrderStatusLabel(order.status, t)}
      </AdminBadge>
    ),
    action: (
      <Button
        className="h-10"
        variant="ghost"
        onClick={() => onEdit(order)}
      >
        {t("admin.orders.table.view")}
      </Button>
    ),
  }));
};
