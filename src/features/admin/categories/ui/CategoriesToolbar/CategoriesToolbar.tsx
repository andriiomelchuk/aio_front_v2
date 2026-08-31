import type { T_CategoriesStatus } from "@/entities/categories/model/types";
import type { T_CategoriesSort } from "../../model/types";
import { useI18n } from "@/shared/i18n";
import { Button, Input, Select } from "@/shared/ui";
import { T_CategoriesToolbarProps } from "./types";

export const CategoriesToolbar = ({tableControls, onAddCategoryClick}: T_CategoriesToolbarProps) => {

    const { t } = useI18n();

  return (
    <>
      <Input
        type="search"
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.search}
        onChange={(e) => {
          tableControls.setSearch(e.target.value);
        }}
        placeholder={t("admin.categories.searchPlaceholder")}
      />
      <Select
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.status}
        onChange={(e) => {
          tableControls.setStatus(e.target.value as T_CategoriesStatus | "all");
        }}
        options={[
          { value: "all", label: t("admin.categories.status.allCategories") },
          { value: "active", label: t("admin.categories.status.active") },
          { value: "inactive", label: t("admin.categories.status.inactive") },
        ]}
      ></Select>
      <Select
        className="h-10 w-full sm:w-[180px]"
        value={tableControls.sort}
        onChange={(e) => {
          tableControls.setSort(e.target.value as T_CategoriesSort);
        }}
        options={[
          { value: "default", label: t("admin.categories.sorting.default") },
          { value: "name-asc", label: t("admin.categories.sorting.nameAToZ") },
          { value: "name-desc", label: t("admin.categories.sorting.nameZToA") },
          {
            value: "status-asc",
            label: t("admin.categories.sorting.statusAToZ"),
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
      <Button
        variant="default"
        className="h-10 w-full sm:ml-auto sm:w-auto"
        onClick={onAddCategoryClick}
      >
        {t("admin.actions.addCategory")}
      </Button>
    </>
  );
};
