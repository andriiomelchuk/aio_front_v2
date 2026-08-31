import { useState } from "react";
import { usePagination } from "./usePagination";

type T_UseTableControlsParams<
  TStatus extends string,
  TSort extends string,
  TStock extends string = never,
> = {
  initialStatus: TStatus;
  initialStockStatus?: TStock,
  initialSort: TSort;
  initialPageSize?: number;
};

export const useTableControls = <
  TStatus extends string,
  TSort extends string,
  TStock extends string = never,
>({
  initialStatus,
  initialStockStatus,
  initialSort,
  initialPageSize = 5,
}: T_UseTableControlsParams<TStatus, TSort, TStock>) => {
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState<TStatus>(initialStatus);
  const [stock, setStockState] = useState<TStock | undefined>(initialStockStatus);
  const [sort, setSortState] = useState<TSort>(initialSort);

  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPage,
    resetPagination,
  } = usePagination({
    initialPageSize,
  });

  const setSearch = (nextSearch: string) => {
    setSearchState(nextSearch);
    resetPage();
  };

  const setStatus = (nextStatus: TStatus) => {
    setStatusState(nextStatus);
    resetPage();
  };

  const setStock = (nextStock: TStock | undefined) => {
    setStockState(nextStock);
    resetPage();
  };

  const setSort = (nextSort: TSort) => {
    setSortState(nextSort);
    resetPage();
  };

  const resetControls = () => {
    setSearchState("");
    setStatusState(initialStatus);
    setSortState(initialSort);
    setStockState(initialStockStatus)
    resetPagination();
  };

  const hasActiveControls =
    search !== "" || status !== initialStatus || sort !== initialSort || stock !== initialStockStatus;

  return {
    search,
    status,
    stock,
    sort,
    page,
    pageSize,
    setSearch,
    setStatus,
    setStock,
    setSort,
    setPage,
    setPageSize,
    resetPage,
    resetControls,
    hasActiveControls,
  };
};
