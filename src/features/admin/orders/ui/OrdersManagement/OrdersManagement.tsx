"use client";

import { type T_Order } from "@/entities/order";
import type { T_ProductCurrency } from "@/entities/product";
import { useI18n } from "@/shared/i18n";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { paginate } from "@/lib";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { DataState, Pagination } from "@/shared/ui";
import { OrdersToolbar } from "../OrdersToolbar/OrdersToolbar";
import { useOrdersTableControls } from "../../model/useOrdersTableControls";
import {
  getOrderColumns,
  mapOrderRows,
  ordersFilter,
  orderSort,
  calculateOrderMetrics,
} from "../../model";
import { OrdersBulkActions } from "../OrdersBulkActions";
import { getOrders, updateOrder } from "@/shared/api/orders";
import { useAdminAccess } from "@/features/auth";
import { usePriceFormatter } from "@/shared/siteSettings";

export function OrdersManagement() {
  const { t, locale } = useI18n();
  const { canManage, session } = useAdminAccess();
  const router = useRouter();
  const formatPrice = usePriceFormatter();

  const tableControls = useOrdersTableControls();

//   const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);

  const [selectedOrderIds, setSelectedOrderIds] = useState<
    Array<string | number>
  >([]);

  const [orders, setOrders] = useState<T_Order[]>([]);

  const [bulkAction, setBulkAction] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    getOrders().then(setOrders).catch(() => setHasError(true)).finally(() => setIsLoading(false));
  }, [reloadKey]);

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

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
  };
  const orderRows = mapOrderRows(paginatedOrders, t, formatPrice, formatDate);

  const orderColumns = getOrderColumns(t);
  const metrics = calculateOrderMetrics(orders);
  const revenue = Object.entries(metrics.revenueByCurrency)
    .map(([currency, value]) => formatPrice(value, currency as T_ProductCurrency))
    .join(" / ") || formatPrice(0);

  const handleConfirmBulkAction = async () => {
    if (!bulkAction) {
      return;
    }

    const selectedIds = new Set(selectedOrderIds.map(String));
    const nextStatus = bulkAction as T_Order["status"];

    const nextOrders = await Promise.all(orders.map((order) =>
      selectedIds.has(String(order.id))
        ? updateOrder({ ...order, status: nextStatus }, { updatedBy: session?.displayName })
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
        <AdminCard title={t("admin.orders.activeOrders")}>
          <p className="text-2xl font-semibold text-foreground">
            {metrics.activeOrders}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t("admin.orders.activeProducts")}
          </p>
        </AdminCard>

        <AdminCard title={t("admin.orders.orders")}>
          <p className="text-2xl font-semibold text-foreground">{metrics.ordersThisWeek}</p>
          <p className="mt-1 text-sm text-muted">
            {t("admin.orders.ordersThisWeek")}
          </p>
        </AdminCard>

        <AdminCard title={t("admin.orders.revenue")}>
          <p className="text-lg font-semibold text-foreground">{revenue}</p>
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
            {isLoading ? <DataState compact variant="loading" title={t("admin.orders.loading")} /> : hasError ? <DataState compact variant="error" description={t("admin.orders.loadError")} onAction={() => { setIsLoading(true); setHasError(false); setReloadKey((value) => value + 1); }} /> : orderRows.length === 0 ? <DataState compact variant="empty" title={t("admin.orders.noOrderFound")} /> : <AdminTable
              columns={orderColumns}
              rows={orderRows}
              getRowKey={(order) => order.id}
              onRowClick={(order) => router.push(`/admin/orders/${encodeURIComponent(order.id)}`)}
              selectedRowKeys={canManage ? selectedOrderIds : undefined}
              onSelectedRowKeysChange={canManage ? setSelectedOrderIds : undefined}
            ></AdminTable>}

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
