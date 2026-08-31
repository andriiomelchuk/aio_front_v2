import { useState } from "react";
import { usePagination } from "./usePagination";

type T_UseTableControlsParams<TStatus extends string, TSort extends string> = {
  initialStatus: TStatus;
  initialSort: TSort;
  initialPageSize?: number;
};

export const useTableControls = <
  TStatus extends string,
  TSort extends string,
>({
  initialStatus,
  initialSort,
  initialPageSize = 5,
}: T_UseTableControlsParams<TStatus, TSort>) => {
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState<TStatus>(initialStatus);
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

  const setSort = (nextSort: TSort) => {
    setSortState(nextSort);
    resetPage();
  };

  const resetControls = () => {
    setSearchState("");
    setStatusState(initialStatus);
    setSortState(initialSort);
    resetPagination();
  };

  const hasActiveControls =
    search !== "" || status !== initialStatus || sort !== initialSort;

  return {
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
    resetPage,
    resetControls,
    hasActiveControls,
  };
};