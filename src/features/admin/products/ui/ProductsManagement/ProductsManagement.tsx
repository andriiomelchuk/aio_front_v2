"use client";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import { ProductsToolbar } from "../ProductsToolbar";
import { UsersBulkActions } from "@/features/admin/users/ui/UsersBulkActions";
import { Pagination } from "@/shared/ui";
import { useI18n } from "@/shared/i18n";
import { useEffect, useState } from "react";
import type { T_Product } from "@/entities/product/model/types";
import { useProductsTableControls } from "../../model/useProductsTableControls";
import { getProductsColumns } from "../../model/productsTableColumns";
import { paginate } from "@/lib";
import { sortProducts } from "../../model/sortProducts";
import { filterProducts } from "../../model/filterProducts";
import { mapProductsRows } from "../../model/mapProductsRows";
import { getProducts } from "@/shared/api/products";

export function ProductsManagement() {
  const { t } = useI18n();

  const tableControls = useProductsTableControls();

  const productsColumns = getProductsColumns(t);

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<T_Product | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [selectedUserIds, setSelectedUserIds] = useState<
    Array<string | number>
  >([]);

  const [products, setProducts] = useState<T_Product[]>([]);

    useEffect(() => {
      const loadProducts = async () => {
        const products = await getProducts();
        setProducts(products);
      };
  
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

  const productsRows = mapProductsRows(
    paginatedProducts,
    t,
    setSelectedProduct,
  );

  return (
    <AdminPage
      actions={
        <ProductsToolbar
          tableControls={tableControls}
          onAddProductClick={() => setIsAddProductOpen(true)}
        />
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
          selectedRowKey={selectedUserId}
          onRowClick={(product) => setSelectedUserId(product.id)}
          selectedRowKeys={selectedUserIds}
          onSelectedRowKeysChange={setSelectedUserIds}
          emptyText={t("admin.products.noProductFound")}
        />

        {/* <ProductsBulkActions
                  selectedCount={selectedUserIds.length}
                  selectedAction={bulkAction}
                  onActionChange={setBulkAction}
                  onConfirm={handleConfirmBulkAction}
                /> */}

        <Pagination
          page={tableControls.page}
          pageSize={tableControls.pageSize}
          totalItems={sortedProducts.length}
          onPageChange={tableControls.setPage}
          onPageSizeChange={tableControls.setPageSize}
        />
      </AdminCard>
      {/* <ProductsModal
                selectedUser={selectedUser}
                isAddUserOpen={isAddUserOpen}
                onCloseAddUser={() => setIsAddUserOpen(false)}
                onCloseEditUser={handleCloseEditUser}
                onCreateUser={(createdUser) => {
                  setUsers((prevUsers) => [createdUser, ...prevUsers]);
                  setIsAddUserOpen(false);
                }}
                onUpdateUser={handleUpdateUser}
              /> */}
    </AdminPage>
  );
}
