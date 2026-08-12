import { Button } from "../Button";
import { Select } from "../Select";
import { T_PaginationProps } from "./types";

export const Pagination = ({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 20],
  onPageChange,
  onPageSizeChange,
}: T_PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) {
    return null;
  }

  return (
    <nav
      className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Rows per page</span>

        <Select
          className="h-10 w-[90px]"
          name="pageSize"
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          options={pageSizeOptions.map((option) => ({
            value: String(option),
            label: String(option),
          }))}
        />
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm text-muted">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>

          <Button
            variant="secondary"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </nav>
  );
};