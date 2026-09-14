"use client";

import { type T_Order } from "@/entities/order";
import { useI18n } from "@/shared/i18n";
import { useEffect, useState } from "react";
import { paginate } from "@/lib";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { Pagination } from "@/shared/ui";
import { OrdersToolbar } from "../OrdersToolbar/OrdersToolbar";
import { useOrdersTableControls } from "../../model/useOrdersTableControls";
import {
  getOrderColumns,
  mapOrderRows,
  ordersFilter,
  orderSort,
} from "../../model";
import { OrdersBulkActions } from "../OrdersBulkActions";
import { getOrders, updateOrder } from "@/shared/api/orders";
import { useAdminAccess } from "@/features/auth";

export function OrdersManagement() {
  const { t } = useI18n();
  const { canManage } = useAdminAccess();

  const tableControls = useOrdersTableControls();

//   const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState<T_Order["id"] | null>(
    null,
  );

  const [selectedOrderIds, setSelectedOrderIds] = useState<
    Array<string | number>
  >([]);

  const [orders, setOrders] = useState<T_Order[]>([]);

  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  const activeOrders = orders.filter(
    (order) => order.status === "new" || order.status === "processing",
  );

  const filteredOrders = ordersFilter(orders, {
    status: tableControls.status,
    search: tableControls.search,
  });

  const sortedOrders = orderSort(filteredOrders, tableControls.sort);

  const paginatedOrders = paginate(
    sortedOrders,
    tableControls.page,
    tableControls.pageSize,
  );

  const orderRows = mapOrderRows(paginatedOrders, t);

  const orderColumns = getOrderColumns(t);

  const handleConfirmBulkAction = async () => {
    if (!bulkAction) {
      return;
    }

    const selectedIds = new Set(selectedOrderIds.map(String));
    const nextStatus = bulkAction as T_Order["status"];

    const nextOrders = await Promise.all(orders.map((order) =>
      selectedIds.has(String(order.id))
        ? updateOrder({ ...order, status: nextStatus })
        : order,
    ));
    setOrders(nextOrders);

    setSelectedOrderIds([]);
    setBulkAction("");
  };

  return (
    <AdminPage
      title={t("admin.orders.pageTitle")}
      description={t("admin.orders.description", {
        shown: filteredOrders.length,
        total: orders.length,
      })}
      actions={<OrdersToolbar tableControls={tableControls} />}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard title={t("admin.orders.products")}>
          <p className="text-2xl font-semibold text-foreground">
            {activeOrders.length}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t("admin.orders.activeProducts")}
          </p>
        </AdminCard>

        <AdminCard title={t("admin.orders.orders")}>
          <p className="text-2xl font-semibold text-foreground">42</p>
          <p className="mt-1 text-sm text-muted">
            {t("admin.orders.ordersThisWeek")}
          </p>
        </AdminCard>

        <AdminCard title={t("admin.orders.revenue")}>
          <p className="text-2xl font-semibold text-foreground">$12,480</p>
          <p className="mt-1 text-sm text-muted">
            {t("admin.orders.monthlyRevenue")}
          </p>
        </AdminCard>
      </div>

      <div className="mt-4">
        <AdminCard
          title={t("admin.orders.recentOrders")}
          description={t("admin.orders.latestCustomerOrders")}
        >
          <div className="space-y-3">
            <AdminTable
              columns={orderColumns}
              rows={orderRows}
              getRowKey={(order) => order.id}
              selectedRowKey={selectedOrderId}
              onRowClick={(order) => setSelectedOrderId(order.id)}
              emptyText={t("admin.orders.noOrderFound")}
              selectedRowKeys={canManage ? selectedOrderIds : undefined}
              onSelectedRowKeysChange={canManage ? setSelectedOrderIds : undefined}
            ></AdminTable>

            {canManage && <OrdersBulkActions
              selectedCount={selectedOrderIds.length}
              selectedAction={bulkAction}
              onActionChange={setBulkAction}
              onConfirm={handleConfirmBulkAction}
            />}
            <Pagination
              page={tableControls.page}
              pageSize={tableControls.pageSize}
              totalItems={sortedOrders.length}
              onPageChange={tableControls.setPage}
              onPageSizeChange={tableControls.setPageSize}
            />
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
