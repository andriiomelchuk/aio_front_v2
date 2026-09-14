export type T_PaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  pageSizeLabel?: string;
  ariaLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};
