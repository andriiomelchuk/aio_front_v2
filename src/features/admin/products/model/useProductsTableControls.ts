import type { T_ProductStatus } from "@/entities/product/model/types"
import type {
  T_ProductSearchField,
  T_ProductStockFilter,
  T_ProductsSort,
} from "./types";
import { useTableControls } from "@/hooks"
import { useState } from "react";

export const useProductsTableControls = () => {
    const tableControls = useTableControls<T_ProductStatus | "all", T_ProductsSort, T_ProductStockFilter>({
        initialStatus: "all",
        initialSort: "default",
        initialStockStatus: "all",
        initialPageSize: 5
    });

    const [searchField, setSearchField] =
    useState<T_ProductSearchField>("title");

    const resetProductsControls = () => {
    tableControls.resetControls();
    setSearchField("title");
  };

  return {
    ...tableControls,
    searchField,
    setSearchField,
    resetControls: resetProductsControls,
  };
}
