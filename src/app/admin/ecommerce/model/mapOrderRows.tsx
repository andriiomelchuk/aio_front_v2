import { T_Order } from "@/entities/order";
import { AdminBadge } from "@/widgets/AdminWidgets";
import { orderStatusBadgeVariant, orderStatusLabel } from "./orderStatusView";
import { Button } from "@/shared/ui";

export const mapOrderRows = (orders: T_Order[]) => {
  return orders.map((order) => ({
    id: `#${order.id}`,
    price: `$${order.price}`,
    createdAt: order.createdAt || "-",
    updatedAt: order.updatedAt || "-",
    status: (
      <AdminBadge variant={orderStatusBadgeVariant[order.status]}>
        {orderStatusLabel[order.status]}
      </AdminBadge>
    ),
    action: (
      <Button
        className="h-10"
        variant="ghost"
        onClick={() => console.log("View order", order.id)}
      >
        View
      </Button>
    ),
  }));
};