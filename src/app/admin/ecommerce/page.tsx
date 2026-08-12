"use client";
import { mockOrders, T_OrderSort, type T_OrderStatus } from "@/entities/order";
import { Button, Input, Pagination, Select } from "@/shared/ui";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { orderSort } from "./model/orderSort";
import { orderColumns } from "./model/orderTableColumns";
import { useState } from "react";
import { ordersFilter } from "./model/orderFilters";
import { mapOrderRows } from "./model/mapOrderRows";
import { paginate } from "@/lib/paginate";
import { usePagination } from "@/hooks/usePagination";
import { useTableControls } from "@/hooks/useTableControls";

export default function EcommercePage() {
  // const [status, setStatus] = useState<T_OrderStatus | "all">("all");
  // const [search, setSearch] = useState("");
  // const [sort, setSort] = useState<T_OrderSort>("default");

  // const { page, pageSize, setPage, setPageSize, resetPage, resetPagination } =
  //   usePagination({
  //     initialPageSize: 5,
  //   });

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

  const activeOrders = mockOrders.filter(
    (order) => order.status === "new" || order.status === "processing",
  );

  const filteredOrders = ordersFilter(mockOrders, { status, search });

  const sortedOrders = orderSort(filteredOrders, sort);

  const paginatedOrders = paginate(sortedOrders, page, pageSize);

  const orderRows = mapOrderRows(paginatedOrders);


  return (
    <AdminPage
      title="E-commerce"
      description={`Showing ${filteredOrders.length} of ${mockOrders.length} orders`}
      actions={
        <>
          <Input
            className="h-10 w-[180px]"
            name="search"
            placeholder="Search order"
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
              { value: "all", label: "All statuses" },
              { value: "new", label: "New" },
              { value: "processing", label: "In Process" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "cancelled" },
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
              { value: "default", label: "Default sorting" },
              { value: "price-asc", label: "Price low to high" },
              { value: "price-desc", label: "Price high to low" },
              { value: "id-asc", label: "Order ID ascending" },
              { value: "id-desc", label: "Order ID descending" },
            ]}
          />
          <Button variant="ghost" onClick={resetControls}>
            Clear filters
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard title="Products">
          <p className="text-2xl font-semibold text-foreground">
            {activeOrders.length}
          </p>
          <p className="mt-1 text-sm text-muted">Active products</p>
        </AdminCard>

        <AdminCard title="Orders">
          <p className="text-2xl font-semibold text-foreground">42</p>
          <p className="mt-1 text-sm text-muted">Orders this week</p>
        </AdminCard>

        <AdminCard title="Revenue">
          <p className="text-2xl font-semibold text-foreground">$12,480</p>
          <p className="mt-1 text-sm text-muted">Monthly revenue</p>
        </AdminCard>
      </div>

      <div className="mt-4">
        <AdminCard title="Recent orders" description="Latest customer orders">
          <div className="space-y-3">
            <AdminTable
              columns={orderColumns}
              rows={orderRows}
              getRowKey={(order) => order.id}
              emptyText="No orders found"
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
