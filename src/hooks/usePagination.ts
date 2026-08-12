import { useState } from "react";

type T_UsePaginationParams = {
  initialPage?: number;
  initialPageSize?: number;
};

export const usePagination = ({
  initialPage = 1,
  initialPageSize = 5,
}: T_UsePaginationParams = {}) => {
    
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const setPageSize = (nextPageSize: number) => {
    setPageSizeState(nextPageSize);
    setPage(1);
  };

  const resetPage = () => {
    setPage(1);
  };

  const resetPagination = () => {
    setPage(initialPage);
    setPageSizeState(initialPageSize);
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    resetPage,
    resetPagination,
  };
};