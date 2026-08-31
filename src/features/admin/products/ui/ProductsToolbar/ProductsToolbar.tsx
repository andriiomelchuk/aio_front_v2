import { useI18n } from "@/shared/i18n";
import { Button, Input, Select } from "@/shared/ui";
import type { T_ProductsToolbarProps } from "./types";
import type {
  T_ProductSearchField,
  T_ProductStockFilter,
  T_ProductsSort,
} from "../../model/types";
import type {
  T_ProductStatus,
} from "@/entities/product/model/types";
import Link from "next/link";

export const ProductsToolbar = ({
  tableControls,
  onAddProductClick,
}: T_ProductsToolbarProps) => {
  const { t } = useI18n();
  const searchPlaceholderByField = {
    title: t("admin.products.search.placeholder.title"),
    sku: t("admin.products.search.placeholder.sku"),
    category: t("admin.products.search.placeholder.category"),
    price: t("admin.products.search.placeholder.price"),
    stock: t("admin.products.search.placeholder.stock"),
  };

  return (
    <>
      <Select
        className="h-10 w-full sm:w-[160px]"
        value={tableControls.searchField}
        onChange={(e) => {
          tableControls.setSearchField(e.target.value as T_ProductSearchField);
        }}
        options={[
          { value: "title", label: t("admin.products.search.field.title") },
          { value: "sku", label: t("admin.products.search.field.sku") },
          {
            value: "category",
            label: t("admin.products.search.field.category"),
          },
          { value: "price", label: t("admin.products.search.field.price") },
          { value: "stock", label: t("admin.products.search.field.stock") },
        ]}
      />
      <Input
        type="search"
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.search}
        onChange={(e) => {
          tableControls.setSearch(e.target.value);
        }}
        placeholder={searchPlaceholderByField[tableControls.searchField]}
      />
      <Select
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.status}
        onChange={(e) => {
          tableControls.setStatus(e.target.value as T_ProductStatus | "all");
        }}
        options={[
          { value: "all", label: t("admin.products.status.allProducts") },
          { value: "active", label: t("admin.products.status.active") },
          { value: "archived", label: t("admin.products.status.archived") },
          { value: "draft", label: t("admin.products.status.draft") },
        ]}
      ></Select>
      <Select
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.stock}
        onChange={(e) => {
          tableControls.setStock(e.target.value as T_ProductStockFilter);
        }}
        options={[
          { value: "all", label: t("admin.products.stock.all") },
          { value: "in_stock", label: t("admin.products.stock.inStock") },
          { value: "low_stock", label: t("admin.products.stock.lowStock") },
          {
            value: "out_of_stock",
            label: t("admin.products.stock.outOfStock"),
          },
        ]}
      />
      <Select
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.sort}
        onChange={(e) => {
          tableControls.setSort(e.target.value as T_ProductsSort);
        }}
        options={[
          { value: "default", label: t("admin.products.sorting.default") },
          { value: "name-asc", label: t("admin.products.sorting.nameAToZ") },
          { value: "name-desc", label: t("admin.products.sorting.nameZToA") },
          {
            value: "status-asc",
            label: t("admin.products.sorting.statusAToZ"),
          },
        ]}
      />
      {tableControls.hasActiveControls && (
        <Button
          variant="ghost"
          className="h-10 w-full sm:w-auto"
          onClick={tableControls.resetControls}
        >
          {t("admin.actions.clearFilters")}
        </Button>
      )}
      <Link href="/admin/products/new">
        <Button
          variant="default"
          className="h-10 w-full sm:ml-auto sm:w-auto"
          onClick={onAddProductClick}
        >
          {t("admin.actions.addProduct")}
        </Button>
      </Link>
    </>
  );
};
