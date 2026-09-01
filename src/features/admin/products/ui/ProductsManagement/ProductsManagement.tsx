"use client";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { ProductsToolbar } from "../ProductsToolbar";
import { Pagination } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { useEffect, useState } from "react";
import type { T_Product } from "@/entities/product/model/types";
import { paginate } from "@/lib";
import { bulkUpdateProducts, deleteProduct, getProducts } from "@/shared/api/products";
import { ProductsBulkActions } from "../ProductsBulkActions";
import type { T_ProductBulkAction } from "../ProductsBulkActions/types";
import {
  filterProducts,
  getProductsColumns,
  mapProductsRows,
  sortProducts,
  useProductsTableControls,
} from "../../model";

export function ProductsManagement() {
  const { t } = useI18n();

  const tableControls = useProductsTableControls();

  const productsColumns = getProductsColumns(t);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const [selectedProductIds, setSelectedProductIds] = useState<
    Array<string | number>
  >([]);

  const [products, setProducts] = useState<T_Product[]>([]);

  const loadProducts = async () => {
    const products = await getProducts();
    setProducts(products);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = filterProducts(products, {
    status: tableControls.status,
    search: tableControls.search,
    searchField: tableControls.searchField,
    stock: tableControls.stock,
  });

  const sortedProducts = sortProducts(filteredProducts, tableControls.sort);

  const paginatedProducts = paginate(
    sortedProducts,
    tableControls.page,
    tableControls.pageSize,
  );

  const [bulkAction, setBulkAction] = useState<T_ProductBulkAction>("");

  const handleConfirmBulkAction = async () => {
    if (!bulkAction || selectedProductIds.length === 0) {
      return;
    }

    if (bulkAction === "delete") {
      await Promise.all(
        selectedProductIds.map((productId) => deleteProduct(productId)),
      );
    } else {
      await bulkUpdateProducts({
        ids: selectedProductIds,
        changes: {
          status: bulkAction,
        },
      });
    }

    await loadProducts();
    setSelectedProductIds([]);
    setBulkAction("");
  };

  const productsRows = mapProductsRows(paginatedProducts, t);

  return (
    <AdminPage
      actions={
        <ProductsToolbar tableControls={tableControls} />
      }
    >
      <AdminCard
        title={t("admin.products.pageTitle")}
        description={t("admin.products.description", {
          shown: paginatedProducts.length,
          total: products.length,
        })}
      >
        <AdminTable
          columns={productsColumns}
          rows={productsRows}
          getRowKey={(product) => product.id}
          selectedRowKey={selectedProductId}
          onRowClick={(product) => setSelectedProductId(product.id)}
          selectedRowKeys={selectedProductIds}
          onSelectedRowKeysChange={setSelectedProductIds}
          emptyText={t("admin.products.noProductFound")}
        />

        <ProductsBulkActions
          selectedCount={selectedProductIds.length}
          selectedAction={bulkAction}
          onActionChange={setBulkAction}
          onConfirm={handleConfirmBulkAction}
        />

        <Pagination
          page={tableControls.page}
          pageSize={tableControls.pageSize}
          totalItems={sortedProducts.length}
          onPageChange={tableControls.setPage}
          onPageSizeChange={tableControls.setPageSize}
        />
      </AdminCard>
    </AdminPage>
  );
}
