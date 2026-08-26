"use client";

import { mockOrders, type T_Order } from "@/entities/order";
import { useI18n } from "@/shared/i18n";
import { useState } from "react";
import { paginate } from "@/lib";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { Pagination } from "@/shared/ui";
import { OrdersToolbar } from "../OrdersToolbar/OrdersToolbar";
import { useOrdersTableControls } from "../../model/useOrdersTableControls";
import { OrdersModals } from "../OrdersModals";
import {
  getOrderColumns,
  mapOrderRows,
  ordersFilter,
  orderSort,
} from "../../model";
import { OrdersBulkActions } from "../OrdersBulkActions";

export function OrdersManagement() {
  const { t } = useI18n();

  const tableControls = useOrdersTableControls();

//   const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<T_Order | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<T_Order["id"] | null>(
    null,
  );

  const [selectedOrderIds, setSelectedOrderIds] = useState<
    Array<string | number>
  >([]);

  const [orders, setOrders] = useState<T_Order[]>(mockOrders);

  const [bulkAction, setBulkAction] = useState("");

  const handleUpdateOrder = (updatedOrder: T_Order) => {
    setOrders((prevOrder) =>
      prevOrder.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order,
      ),
    );

    setSelectedOrder(null);
  };

  const handleCloseEditOrder = () => {
    setSelectedOrder(null);
  };

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

  const orderRows = mapOrderRows(paginatedOrders, t, setSelectedOrder);

  const orderColumns = getOrderColumns(t);

  const handleConfirmBulkAction = () => {
    if (!bulkAction) {
      return;
    }

    const selectedIds = new Set(selectedOrderIds.map(String));
    const nextStatus = bulkAction as T_Order["status"];

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        selectedIds.has(String(order.id))
          ? { ...order, status: nextStatus }
          : order,
      ),
    );

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
              selectedRowKeys={selectedOrderIds}
              onSelectedRowKeysChange={setSelectedOrderIds}
            ></AdminTable>

            <OrdersBulkActions
              selectedCount={selectedOrderIds.length}
              selectedAction={bulkAction}
              onActionChange={setBulkAction}
              onConfirm={handleConfirmBulkAction}
            />
            <Pagination
              page={tableControls.page}
              pageSize={tableControls.pageSize}
              totalItems={sortedOrders.length}
              onPageChange={tableControls.setPage}
              onPageSizeChange={tableControls.setPageSize}
            />
          </div>
        </AdminCard>
        <OrdersModals
        //   isAddOrderOpen={isAddOrderOpen}
        //   onCloseAddOrder={() => setIsAddOrderOpen(false)}
          onCloseEditOrder={handleCloseEditOrder}
          onUpdateOrder={handleUpdateOrder}
          selectedOrder={selectedOrder}
        />
      </div>
    </AdminPage>
  );
}
