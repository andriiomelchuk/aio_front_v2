import type { T_OrderStatus } from "@/entities/order";
import type { T_OrderSort } from "../../model/types";
import { useI18n } from "@/shared/i18n";
import { Button, Input, Select } from "@/shared/ui";
import type { T_OrdersToolbarProps } from "./types";

export const OrdersToolbar = ({tableControls}: T_OrdersToolbarProps) => {

    const { t } = useI18n();
  return (
    <>
      <Input
        className="h-10 w-full sm:w-[180px]"
        name="search"
        placeholder={t("admin.actions.searchOrder")}
        value={tableControls.search}
        onChange={(event) => {
          tableControls.setSearch(event.target.value);
        }}
        type="search"
      />

      <Select
        onChange={(event) => {
          tableControls.setStatus(event.target.value as T_OrderStatus | "all");
        }}
        value={tableControls.status}
        className="h-10 w-full sm:w-[180px]"
        name="status"
        aria-label="Filter orders by status"
        options={[
          { value: "all", label: t("admin.orders.status.allStatus") },
          { value: "new", label: t("admin.orders.status.new") },
          {
            value: "processing",
            label: t("admin.orders.status.processing"),
          },
          {
            value: "completed",
            label: t("admin.orders.status.completed"),
          },
          {
            value: "cancelled",
            label: t("admin.orders.status.cancelled"),
          },
        ]}
      />
      <Select
        value={tableControls.sort}
        onChange={(event) => {
          tableControls.setSort(event.target.value as T_OrderSort);
        }}
        className="h-10 w-full sm:w-[180px]"
        name="sort"
        aria-label="Sort orders"
        options={[
          {
            value: "default",
            label: t("admin.orders.sorting.defaultSorting"),
          },
          {
            value: "price-asc",
            label: t("admin.orders.sorting.priceLowToHigh"),
          },
          {
            value: "price-desc",
            label: t("admin.orders.sorting.priceHighToLow"),
          },
          {
            value: "id-asc",
            label: t("admin.orders.sorting.orderIdAscending"),
          },
          {
            value: "id-desc",
            label: t("admin.orders.sorting.orderIdDescending"),
          },
        ]}
      />
      <Button
        variant="ghost"
        className="h-10 w-full sm:w-auto"
        onClick={tableControls.resetControls}
      >
        {t("admin.actions.clearFilters")}
      </Button>
    </>
  );
};
