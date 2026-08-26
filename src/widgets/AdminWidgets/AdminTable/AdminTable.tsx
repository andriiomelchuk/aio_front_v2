import type { T_AdminTableColumn, T_AdminTableProps } from "./types";

export const AdminTable = <T extends Record<string, React.ReactNode>>({
  columns,
  rows,
  getRowKey,
  emptyText = "No data found",
  selectedRowKey,
  onRowClick,
  selectedRowKeys,
  onSelectedRowKeysChange,
}: T_AdminTableProps<T>) => {
  const getAlignClass = (align: T_AdminTableColumn<T>["align"]) => {
    if (align === "center") {
      return "text-center";
    }

    if (align === "right") {
      return "text-right";
    }

    return "text-left";
  };

  const isMultipleSelection = Boolean(onSelectedRowKeysChange);

  const isRowChecked = (rowKey: string | number) => {
    return selectedRowKeys?.includes(rowKey) ?? false;
  };

  const toggleRowCheck = (rowKey: string | number) => {
    if (!onSelectedRowKeysChange) {
      return;
    }

    const currentKeys = selectedRowKeys ?? [];

    if (currentKeys.includes(rowKey)) {
      onSelectedRowKeysChange(currentKeys.filter((key) => key !== rowKey));
      return;
    }

    onSelectedRowKeysChange([...currentKeys, rowKey]);
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            {isMultipleSelection && (
              <th className="w-10 px-3 py-2">
                <span className="sr-only">Select</span>
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-3 py-2 font-medium ${getAlignClass(column.align)}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (isMultipleSelection ? 1 : 0)}
                className="px-3 py-8 text-center text-sm text-muted"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const rowKey = getRowKey(row);
              const isSelected = selectedRowKey === rowKey;

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    "border-b border-border transition last:border-0",
                    onRowClick ? "cursor-pointer hover:bg-surface-muted" : "",
                    isSelected ? "bg-accent-soft" : "",
                  ].join(" ")}
                >
                  {isMultipleSelection && (
                    <td className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={isRowChecked(rowKey)}
                        onChange={() => toggleRowCheck(rowKey)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-3 py-3 text-foreground ${getAlignClass(column.align)}`}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
