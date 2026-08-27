"use client";
import { useI18n } from "@/shared/i18n";
import { Pagination } from "@/shared/ui";
import { AdminCard, AdminPage, AdminTable } from "@/widgets/AdminWidgets";
import {
  filterCategories,
  getCategoriesColumns,
  mapCategoriesRows,
  sortCategories,
  useCategoriesTableControls,
} from "../../model";
import { T_Categories } from "@/entities/categories/model/types";
import { useEffect, useState } from "react";
import { paginate } from "@/lib";
import { CategoriesToolbar } from "../CategoriesToolbar/CategoriesToolbar";
import { getCategories } from "@/shared/api/categories";
import { CategoriesModals } from "../CategoriesModals";
import { CategoriesBulkActions } from "../CategoriesBulkActions";

export function CategoriesManagement() {
  const { t } = useI18n();
  const tableControls = useCategoriesTableControls();

  const [categories, setCategories] = useState<T_Categories[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const categories = await getCategories();
      setCategories(categories);
    };

    loadCategories();
  }, []);

  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const categoriesColumns = getCategoriesColumns(t);

  const [selectedCategory, setSelectedCategory] = useState<T_Categories | null>(
    null,
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const [selectedCategoriesIds, setSelectedCategoriesIds] = useState<
    Array<string | number>
  >([]);

  const filteredCategories = filterCategories(categories, {
    status: tableControls.status,
    search: tableControls.search,
  });

  const sortedCategories = sortCategories(
    filteredCategories,
    tableControls.sort,
  );

  const paginatedCategories = paginate(
    sortedCategories,
    tableControls.page,
    tableControls.pageSize,
  );

  const categoriesRows = mapCategoriesRows(
    paginatedCategories,
    t,
    setSelectedCategory,
  );

  const handleUpdateCategory = (updatedCategory: T_Categories) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === selectedCategory?.id ? updatedCategory : category,
      ),
    );

    setSelectedCategory(null);
  };

  const handleCloseEditCategory = () => {
    setSelectedCategory(null);
  };
  const [bulkAction, setBulkAction] = useState("");
  const handleConfirmBulkAction = () => {
    if (bulkAction === "active") {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          selectedCategoriesIds.includes(category.id)
            ? { ...category, status: "active" }
            : category,
        ),
      );
    }

        if (bulkAction === "inactive") {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          selectedCategoriesIds.includes(category.id)
            ? { ...category, status: "inactive" }
            : category,
        ),
      );
    }

    if (bulkAction === "delete") {
      setCategories((prevCategories) =>
        prevCategories.filter((category) => !selectedCategoriesIds.includes(category.id)),
      );
    }

    setSelectedCategoriesIds([]);
    setBulkAction("");
  };

  return (
    <AdminPage
      actions={
        <CategoriesToolbar
          tableControls={tableControls}
          onAddCategoryClick={() => setIsAddCategoryOpen(true)}
        />
      }
    >
      <AdminCard
        title={t("admin.categories.pageTitle")}
        description={t("admin.categories.description", {
          shown: paginatedCategories.length,
          total: categories.length,
        })}
      >
        <AdminTable
          columns={categoriesColumns}
          rows={categoriesRows}
          getRowKey={(category) => category.id}
          selectedRowKey={selectedCategoryId}
          onRowClick={(category) => setSelectedCategoryId(category.id)}
          selectedRowKeys={selectedCategoriesIds}
          onSelectedRowKeysChange={setSelectedCategoriesIds}
          emptyText={t("admin.categories.noUserFound")}
        />

        <CategoriesBulkActions
          selectedCount={selectedCategoriesIds.length}
          selectedAction={bulkAction}
          onActionChange={setBulkAction}
          onConfirm={handleConfirmBulkAction}
        />

        <Pagination
          page={tableControls.page}
          pageSize={tableControls.pageSize}
          totalItems={sortedCategories.length}
          onPageChange={tableControls.setPage}
          onPageSizeChange={tableControls.setPageSize}
        />
      </AdminCard>
      <CategoriesModals
        selectedCategory={selectedCategory}
        isAddCategoryOpen={isAddCategoryOpen}
        onCloseAddCategory={() => setIsAddCategoryOpen(false)}
        onCloseEditCategory={handleCloseEditCategory}
        onCreateCategory={(createdCategory) => {
          setCategories((prevCategory) => [createdCategory, ...prevCategory]);
          setIsAddCategoryOpen(false);
        }}
        onUpdateCategory={handleUpdateCategory}
      />
    </AdminPage>
  );
}
