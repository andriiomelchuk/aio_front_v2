"use client";
import { mockOrders, T_OrderSort, type T_OrderStatus } from "@/entities/order";
import { Button, Input, Pagination, Select } from "@/shared/ui";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { orderSort } from "./model/orderSort";
import { getOrderColumns } from "./model/orderTableColumns";
import { ordersFilter } from "./model/orderFilters";
import { mapOrderRows } from "./model/mapOrderRows";
import { paginate } from "@/lib/paginate";
import { useTableControls } from "@/hooks/useTableControls";
import { useI18n } from "@/shared/i18n";

export default function EcommercePage() {
  const {
    search,
    status,
    sort,
    page,
    pageSize,
    setSearch,
    setStatus,
    setSort,
    setPage,
    setPageSize,
    resetControls,
    hasActiveControls,
  } = useTableControls<T_OrderStatus | "all", T_OrderSort>({
    initialStatus: "all",
    initialSort: "default",
    initialPageSize: 5,
  });

  
  const { t } = useI18n();

  const activeOrders = mockOrders.filter(
    (order) => order.status === "new" || order.status === "processing",
  );

  const filteredOrders = ordersFilter(mockOrders, { status, search });

  const sortedOrders = orderSort(filteredOrders, sort);

  const paginatedOrders = paginate(sortedOrders, page, pageSize);

  const orderRows = mapOrderRows(paginatedOrders, t);


  const orderColumns = getOrderColumns(t);

  return (
    <AdminPage
      title={t("admin.ecommerce.pageTitle")}
      description={t("admin.ecommerce.description", {
        shown: filteredOrders.length,
        total: mockOrders.length,
      })}
      actions={
        <>
          <Input
            className="h-10 w-[180px]"
            name="search"
            placeholder={t("admin.actions.searchOrder")}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            type="search"
          />

          <Select
            onChange={(event) => {
              setStatus(event.target.value as T_OrderStatus | "all");
            }}
            value={status}
            className="w-[180px]"
            name="status"
            aria-label="Filter orders by status"
            options={[
              { value: "all", label: t("admin.ecommerce.status.allStatus") },
              { value: "new", label: t("admin.ecommerce.status.new") },
              {
                value: "processing",
                label: t("admin.ecommerce.status.processing"),
              },
              {
                value: "completed",
                label: t("admin.ecommerce.status.completed"),
              },
              {
                value: "cancelled",
                label: t("admin.ecommerce.status.cancelled"),
              },
            ]}
          />
          <Select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as T_OrderSort);
            }}
            className="w-[180px]"
            name="sort"
            aria-label="Sort orders"
            options={[
              {
                value: "default",
                label: t("admin.ecommerce.sorting.defaultSorting"),
              },
              {
                value: "price-asc",
                label: t("admin.ecommerce.sorting.priceLowToHigh"),
              },
              {
                value: "price-desc",
                label: t("admin.ecommerce.sorting.priceHighToLow"),
              },
              {
                value: "id-asc",
                label: t("admin.ecommerce.sorting.orderIdAscending"),
              },
              {
                value: "id-desc",
                label: t("admin.ecommerce.sorting.orderIdDescending"),
              },
            ]}
          />
          <Button variant="ghost" onClick={resetControls}>
            {t("admin.actions.clearFilters")}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard title={t("admin.ecommerce.products")}>
          <p className="text-2xl font-semibold text-foreground">
            {activeOrders.length}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t("admin.ecommerce.activeProducts")}
          </p>
        </AdminCard>

        <AdminCard title={t("admin.ecommerce.orders")}>
          <p className="text-2xl font-semibold text-foreground">42</p>
          <p className="mt-1 text-sm text-muted">
            {t("admin.ecommerce.ordersThisWeek")}
          </p>
        </AdminCard>

        <AdminCard title={t("admin.ecommerce.revenue")}>
          <p className="text-2xl font-semibold text-foreground">$12,480</p>
          <p className="mt-1 text-sm text-muted">
            {t("admin.ecommerce.monthlyRevenue")}
          </p>
        </AdminCard>
      </div>

      <div className="mt-4">
        <AdminCard
          title={t("admin.ecommerce.recentOrders")}
          description={t("admin.ecommerce.latestCustomerOrders")}
        >
          <div className="space-y-3">
            <AdminTable
              columns={orderColumns}
              rows={orderRows}
              getRowKey={(order) => order.id}
              emptyText={t("admin.ecommerce.noOrderFound")}
            ></AdminTable>
            <Pagination
              page={page}
              pageSize={pageSize}
              totalItems={sortedOrders.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </AdminCard>
      </div>
    </AdminPage>
  );
}
